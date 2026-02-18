import { create } from 'zustand';
import { ChunkManifest } from '@/lib/schemas';

interface TransferState {
    role: 'sender' | 'receiver' | null;
    status: 'idle' | 'signaling' | 'connected' | 'transferring' | 'done' | 'error';
    manifest: ChunkManifest | null;
    file: File | null;
    chunks: Record<number, 'pending' | 'inflight' | 'done' | 'failed'>;
    stats: {
        bytesSent: number;
        bytesRecv: number;
        speed: number;
        eta: number;
        startedAt: number;
    };
    error: string | null;
    setRole: (role: 'sender' | 'receiver') => void;
    setStatus: (status: TransferState['status']) => void;
    setManifest: (manifest: ChunkManifest) => void;
    setFile: (file: File) => void;
    updateChunkStatus: (index: number, status: 'pending' | 'inflight' | 'done' | 'failed') => void;
    updateStats: (stats: Partial<TransferState['stats']>) => void;
    setError: (error: string) => void;
    reset: () => void;
}

export const useTransferStore = create<TransferState>((set) => ({
    role: null,
    status: 'idle',
    manifest: null,
    file: null,
    chunks: {},
    stats: { bytesSent: 0, bytesRecv: 0, speed: 0, eta: 0, startedAt: 0 },
    error: null,
    setRole: (role) => set({ role }),
    setStatus: (status) => set({ status }),
    setManifest: (manifest) => {
        // Initialize chunks status
        const initialChunks: Record<number, 'pending' | 'inflight' | 'done' | 'failed'> = {};
        for (let i = 0; i < manifest.totalChunks; i++) {
            initialChunks[i] = 'pending';
        }
        set({ manifest, chunks: initialChunks });
    },
    setFile: (file) => set({ file }),
    updateChunkStatus: (index, status) =>
        set((state) => ({ chunks: { ...state.chunks, [index]: status } })),
    updateStats: (newStats) =>
        set((state) => ({ stats: { ...state.stats, ...newStats } })),
    setError: (error) => set({ error, status: 'error' }),
    reset: () =>
        set({
            role: null,
            status: 'idle',
            manifest: null,
            file: null,
            chunks: {},
            stats: { bytesSent: 0, bytesRecv: 0, speed: 0, eta: 0, startedAt: 0 },
            error: null,
        }),
}));
