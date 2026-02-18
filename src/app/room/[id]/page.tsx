import { TransferRoom } from '@/components/TransferRoom';
import { Lock } from 'lucide-react';

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="py-12 animate-rise max-w-2xl mx-auto">
            <div className="mb-8 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Lock className="w-3 h-3" />
                    Secure P2P Channel
                </div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Transfer Room</h1>
                <p className="text-slate-500 mt-1">
                    Keep this tab open. Share the link below to connect.
                </p>
            </div>

            <TransferRoom roomId={id} />
        </div>
    );
}
