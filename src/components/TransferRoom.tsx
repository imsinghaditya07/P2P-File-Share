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
            const receiver = new PeerReceiver(roomId, 'guest', (stats) => {
                useTransferStore.getState().updateStats(stats);
            });
            engineRef.current = receiver;

            receiver.connect()
                .then(() => {
                    setStatus('connected');
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
    }, [role, roomId]); 

    return (
        <div className="max-w-[540px] mx-auto bg-white/70 backdrop-blur-2xl rounded-[32px] overflow-hidden min-h-[500px] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white/60">
            {/* Header */}
            <div className="bg-white/40 border-b border-black/[0.04] p-6 relative overflow-hidden flex flex-col items-center">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-black/5 hover:text-slate-900 absolute top-5 left-5 rounded-full" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>

                <div className="text-center mt-2">
                    <h2 className="text-[19px] font-semibold tracking-tight text-slate-900">Transfer in Progress</h2>
                    <div className="flex items-center justify-center gap-2 mt-1.5">
                        <span className="font-mono bg-slate-100/80 text-slate-500 px-3 py-1 rounded-[8px] text-[13px] tracking-widest">{roomId}</span>
                    </div>
                </div>

                <div className="mt-5 flex justify-center">
                    <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm ${status === 'connected' || status === 'transferring' ? 'bg-green-50 text-green-600 border border-green-200/50' :
                        status === 'signaling' ? 'bg-blue-50 text-blue-600 border border-blue-200/50 animate-pulse' :
                            status === 'done' ? 'bg-slate-50 text-slate-600 border border-slate-200/50' : 'bg-red-50 text-red-600 border border-red-200/50'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${status === 'connected' || status === 'transferring' ? 'bg-green-500' :
                            status === 'signaling' ? 'bg-blue-500' :
                                status === 'done' ? 'bg-slate-500' : 'bg-red-500'
                            }`} />
                        {status}
                    </div>
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col items-center justify-center space-y-6">
                {role === 'sender' && status !== 'done' && (
                    <div className="w-full">
                        <ShareLink roomId={roomId} />
                    </div>
                )}

                {error && (
                    <Alert variant="destructive" className="rounded-2xl shrink-0 text-left border-red-200 bg-red-50 text-red-900">
                        <AlertCircle className="h-4 w-4 stroke-[2]" />
                        <AlertTitle className="font-semibold text-[15px]">Connection Interrupted</AlertTitle>
                        <AlertDescription className="text-[13px] leading-relaxed">{error}</AlertDescription>
                    </Alert>
                )}

                {(status === 'transferring' || status === 'done' || status === 'connected') && (
                    <div className="w-full pt-4">
                        <ProgressPanel />
                    </div>
                )}

                {status === 'done' && (
                    <div className="text-center space-y-5 animate-in zoom-in-50 duration-500 pt-6">
                        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto shadow-sm border border-green-100/50">
                            <CheckCircle className="w-10 h-10 text-green-500 stroke-[1.5]" />
                        </div>
                        <div>
                            <h3 className="text-[22px] font-semibold text-slate-900 mb-1">Transfer Complete</h3>
                            <p className="text-[15px] text-slate-500 font-light">Securely saved to device.</p>
                        </div>
                        <Button size="lg" className="rounded-full px-8 text-[15px] font-medium bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/10" onClick={() => window.location.href = '/'}>
                            Done
                        </Button>
                    </div>
                )}

                {status === 'signaling' && role === 'receiver' && (
                    <div className="text-center py-10">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-5 stroke-[1.5]" />
                        <h3 className="text-[17px] font-medium text-slate-900 mb-1">Waiting for sender...</h3>
                        <p className="text-[14px] text-slate-500 font-light">Establishing secure connection</p>
                    </div>
                )}
            </div>
        </div>
    );
}
