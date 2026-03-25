import { TransferRoom } from '@/components/TransferRoom';
import { Lock } from 'lucide-react';

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="py-16 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto px-4">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-slate-200/50 text-slate-600 text-[11px] font-semibold tracking-wide mb-4 shadow-sm">
                    <Lock className="w-3.5 h-3.5" />
                    End-to-End Encrypted Channel
                </div>
                <h1 className="text-4xl font-semibold text-slate-900 tracking-[-0.02em] mb-2">Ready to Transfer</h1>
                <p className="text-[15px] font-light text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Share the link below and keep this tab open to transfer directly.
                </p>
            </div>

            <TransferRoom roomId={id} />
        </div>
    );
}
