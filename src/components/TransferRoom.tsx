'use client';

import { useEffect, useRef } from 'react';
import { useTransferStore } from '@/store/transfer';
import { PeerSender, PeerReceiver } from '@/lib/transfer-engine';
import { ProgressPanel } from './ProgressPanel';
import { ShareLink } from './ShareLink';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Props {
    roomId: string;
}

export function TransferRoom({ roomId }: Props) {
    const router = useRouter();
    const {
        role, status, file, manifest, error,
        setRole, setStatus, setManifest, setError
    } = useTransferStore();

    const engineRef = useRef<PeerSender | PeerReceiver | null>(null);

    useEffect(() => {
        if (file && manifest) {
            setRole('sender');
        } else {
            setRole('receiver');
        }
    }, [file, manifest, setRole]);

    useEffect(() => {
        if (!role) return;

        // Initialize engine
        if (role === 'sender' && file && manifest && !engineRef.current) {
            // ... (Logic same as before, simplified for brevity in this artifact)
            setStatus('signaling');
            const sender = new PeerSender(manifest, file, roomId, 'host', (stats) => {
                useTransferStore.getState().updateStats(stats);
            });
            engineRef.current = sender;

            sender.connect()
                .then(() => {
                    setStatus('connected');
                    setStatus('transferring');
                    return sender.send();
                })
                .then(() => {
                    setStatus('done');
                })
                .catch(err => {
                    console.error(err);
                    setError(err.message);
                });
        } else if (role === 'receiver' && !engineRef.current) {
            setStatus('signaling');
            // ...
            const receiver = new PeerReceiver(roomId, 'guest', (stats) => {
                useTransferStore.getState().updateStats(stats);
            });
            engineRef.current = receiver;

            receiver.connect()
                .then(() => {
                    setStatus('connected');
                    // Access manifest via public property (fixed in previous step)
                    if (receiver.manifest) {
                        setManifest(receiver.manifest);
                    }
                    setStatus('transferring');
                    return receiver.waitForCompletion();
                })
                .then((blob) => {
                    setStatus('done');
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = useTransferStore.getState().manifest?.fileName || 'download';
                        a.click();
                    }
                })
                .catch(err => {
                    console.error(err);
                    setError(err.message);
                });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role, roomId]); // Reduced deps to avoid re-init loops

    return (
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white absolute top-4 left-4" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>

                <div className="text-center mt-4">
                    <h2 className="text-xl font-bold tracking-tight">Active Room</h2>
                    <div className="flex items-center justify-center gap-2 mt-2 opacity-80">
                        <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-sm">{roomId}</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${status === 'connected' || status === 'transferring' ? 'bg-green-500/20 text-green-300' :
                        status === 'signaling' ? 'bg-yellow-500/20 text-yellow-300 animate-pulse' :
                            status === 'done' ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${status === 'connected' || status === 'transferring' ? 'bg-green-400' :
                            status === 'signaling' ? 'bg-yellow-400' :
                                status === 'done' ? 'bg-blue-400' : 'bg-red-400'
                            }`} />
                        {status}
                    </div>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-6">
                {role === 'sender' && status !== 'done' && (
                    <div className="w-full">
                        <ShareLink roomId={roomId} />
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {(status === 'transferring' || status === 'done' || status === 'connected') && (
                    <div className="w-full">
                        <ProgressPanel />
                    </div>
                )}

                {status === 'done' && (
                    <div className="text-center space-y-4 animate-in zoom-in-50 duration-300">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">Success!</h3>
                            <p className="text-slate-500">File transfer completed securely.</p>
                        </div>
                        <Button size="lg" className="rounded-full px-8" onClick={() => window.location.href = '/'}>
                            Send Another File
                        </Button>
                    </div>
                )}

                {status === 'signaling' && role === 'receiver' && (
                    <div className="text-center py-8">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Connecting to sender...</h3>
                        <p className="text-sm text-slate-400">Waiting for peer discovery</p>
                    </div>
                )}
            </div>
        </div>
    );
}
