import { SignalApi } from './signal-api';
import { ChunkManifest, ChunkManifestSchema } from './schemas';
import { verifyChunk, verifyFile } from './integrity';

export interface TransferStats {
    bytesSent: number;
    bytesTotal: number;
    bytesRecv?: number; // Added bytesRecv optional
    speed: number;
    eta: number;
    startedAt: number;
}

type ProgressCallback = (stats: TransferStats) => void;

export class PeerSender {
    private pc: RTCPeerConnection;
    private dc: RTCDataChannel;
    private file: File;
    private manifest: ChunkManifest;
    private signalApi: SignalApi;
    private peerId: string;
    private roomId: string;
    private stats: TransferStats = { bytesSent: 0, bytesTotal: 0, speed: 0, eta: 0, startedAt: 0 };
    private onProgress?: ProgressCallback;
    private aborted = false;

    constructor(manifest: ChunkManifest, file: File, roomId: string, peerId: string, onProgress?: ProgressCallback) {
        this.manifest = manifest;
        this.file = file;
        this.roomId = roomId;
        this.peerId = peerId;
        this.onProgress = onProgress;
        this.signalApi = new SignalApi(roomId, peerId);
        this.stats.bytesTotal = file.size;

        this.pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        this.dc = this.pc.createDataChannel("chunks", {
            ordered: false,
            maxRetransmits: 3
        });
        this.dc.binaryType = "arraybuffer";
    }

    async connect(): Promise<void> {
        this.pc.onicecandidate = async (e) => {
            if (e.candidate) {
                await this.signalApi.sendSignal('ice', e.candidate);
            }
        };

        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        await this.signalApi.sendSignal('offer', offer);

        return new Promise((resolve, reject) => {
            const checkAnswer = async () => {
                if (this.aborted) return;
                try {
                    const targetPeer = this.peerId === 'host' ? 'guest' : 'host';
                    const answer = await this.signalApi.getSignal(targetPeer, 'answer');
                    if (answer) {
                        await this.pc.setRemoteDescription(new RTCSessionDescription(answer));

                        const iceInterval = setInterval(async () => {
                            if (this.aborted || this.pc.iceConnectionState === 'connected' || this.pc.iceConnectionState === 'completed') {
                                clearInterval(iceInterval);
                                return;
                            }
                            const ice = await this.signalApi.getSignal(targetPeer, 'ice');
                            if (ice) {
                                try { await this.pc.addIceCandidate(ice); } catch (e) { }
                            }
                        }, 1000);
                        resolve(undefined);
                    } else {
                        setTimeout(checkAnswer, 1000);
                    }
                } catch (e) {
                    reject(e);
                }
            };
            checkAnswer();
        });
    }

    async send(): Promise<void> {
        this.stats.startedAt = Date.now();

        if (this.dc.readyState !== 'open') {
            await new Promise<void>((resolve) => {
                if (this.dc.readyState === 'open') resolve();
                this.dc.onopen = () => resolve();
            });
        }

        const manifestStr = JSON.stringify(this.manifest);
        this.dc.send(new TextEncoder().encode(manifestStr));

        const chunks = this.manifest.chunks;
        let index = 0;

        while (index < chunks.length && !this.aborted) {
            if (this.dc.bufferedAmount > 16 * 1024 * 1024) {
                await new Promise(r => setTimeout(r, 50));
                continue;
            }

            const chunk = chunks[index];
            const start = chunk.offset;
            const end = start + chunk.size;

            try {
                const blob = this.file.slice(start, end);
                const buffer = await blob.arrayBuffer();

                const header = new ArrayBuffer(8);
                const view = new DataView(header);
                view.setUint32(0, chunk.index);
                view.setUint32(4, chunk.size);

                const packet = new Uint8Array(8 + buffer.byteLength);
                packet.set(new Uint8Array(header), 0);
                packet.set(new Uint8Array(buffer), 8);

                this.dc.send(packet);

                this.stats.bytesSent += chunk.size;
                this.updateStats();
                index++;
            } catch (e) {
                console.error('Send chunk error', e);
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }

    private updateStats() {
        if (!this.onProgress) return;
        const now = Date.now();
        const duration = (now - this.stats.startedAt) / 1000;
        if (duration > 0) {
            this.stats.speed = this.stats.bytesSent / duration;
            const remaining = this.stats.bytesTotal - this.stats.bytesSent;
            this.stats.eta = remaining / (this.stats.speed || 1);
        }
        this.onProgress({ ...this.stats });
    }

    close() {
        this.aborted = true;
        this.pc.close();
        this.dc.close();
    }
}

export class PeerReceiver {
    private pc: RTCPeerConnection;
    private signalApi: SignalApi;
    private peerId: string;
    private roomId: string;
    private onProgress?: ProgressCallback;
    private aborted = false;
    private receivedChunks = new Map<number, ArrayBuffer>();
    public manifest?: ChunkManifest; // Make public
    private stats: TransferStats = { bytesSent: 0, bytesTotal: 0, speed: 0, eta: 0, startedAt: 0 };

    constructor(roomId: string, peerId: string, onProgress?: ProgressCallback) {
        this.roomId = roomId;
        this.peerId = peerId;
        this.onProgress = onProgress;
        this.signalApi = new SignalApi(roomId, peerId);

        this.pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        this.pc.ondatachannel = (e) => {
            this.setupDataChannel(e.channel);
        };
    }

    async connect(): Promise<ChunkManifest | void> { // Fix return type
        this.pc.onicecandidate = async (e) => {
            if (e.candidate) {
                await this.signalApi.sendSignal('ice', e.candidate);
            }
        };

        return new Promise((resolve, reject) => {
            const checkOffer = async () => {
                if (this.aborted) return;
                try {
                    const targetPeer = this.peerId === 'host' ? 'guest' : 'host';
                    const offer = await this.signalApi.getSignal(targetPeer, 'offer');
                    if (offer) {
                        await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
                        const answer = await this.pc.createAnswer();
                        await this.pc.setLocalDescription(answer);
                        await this.signalApi.sendSignal('answer', answer);

                        const iceInterval = setInterval(async () => {
                            if (this.aborted || this.pc.iceConnectionState === 'connected' || this.pc.iceConnectionState === 'completed') {
                                clearInterval(iceInterval);
                                return;
                            }
                            const ice = await this.signalApi.getSignal(targetPeer, 'ice');
                            if (ice) {
                                try { await this.pc.addIceCandidate(ice); } catch (e) { }
                            }
                        }, 1000);
                        resolve(undefined);
                    } else {
                        setTimeout(checkOffer, 1000);
                    }
                } catch (e) {
                    reject(e);
                }
            };
            checkOffer();
        });
    }

    private setupDataChannel(dc: RTCDataChannel) {
        dc.binaryType = "arraybuffer";
        dc.onmessage = async (e) => {
            const data = e.data;

            if (!this.manifest) {
                try {
                    const text = new TextDecoder().decode(data);
                    this.manifest = JSON.parse(text);
                    this.stats.bytesTotal = this.manifest!.fileSize;
                    this.stats.startedAt = Date.now();
                    return;
                } catch (e) {
                    console.error("Manifest parse error", e);
                    return;
                }
            }

            if (data.byteLength < 8) return;

            const view = new DataView(data);
            const index = view.getUint32(0);
            const size = view.getUint32(4);
            const chunkData = data.slice(8);

            if (chunkData.byteLength !== size) {
                console.error("Chunk size mismatch");
                return;
            }

            const expectedHash = this.manifest.chunks[index].hash;
            const valid = await verifyChunk(chunkData, expectedHash);

            if (valid) {
                this.receivedChunks.set(index, chunkData);
                this.stats.bytesSent += size;
                this.updateStats();
            } else {
                console.error(`Chunk ${index} verification failed`);
            }
        };
    }

    async waitForCompletion(): Promise<Blob> {
        return new Promise((resolve) => {
            const check = () => {
                if (this.manifest && this.receivedChunks.size === this.manifest.totalChunks) {
                    const chunks = [];
                    for (let i = 0; i < this.manifest.totalChunks; i++) {
                        chunks.push(this.receivedChunks.get(i)!);
                    }
                    const blob = new Blob(chunks, { type: this.manifest.mimeType });
                    resolve(blob);
                } else {
                    setTimeout(check, 500);
                }
            };
            check();
        });
    }

    private updateStats() {
        if (!this.onProgress) return;
        const now = Date.now();
        const duration = (now - this.stats.startedAt) / 1000;
        if (duration > 0) {
            this.stats.speed = this.stats.bytesSent / duration;
            const remaining = this.stats.bytesTotal - this.stats.bytesSent;
            this.stats.eta = remaining / (this.stats.speed || 1);
        }
        this.onProgress({ ...this.stats, bytesRecv: this.stats.bytesSent });
    }

    close() {
        this.aborted = true;
        this.pc.close();
    }
}
