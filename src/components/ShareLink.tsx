import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Link as LinkIcon, Sparkles } from "lucide-react";
import { useState } from "react";

interface Props {
    roomId: string;
}

export function ShareLink({ roomId }: Props) {
    const [copied, setCopied] = useState(false);

    // Use window.location in client side
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/room/${roomId}`;

    const copy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 p-6 border-2 border-indigo-50/50 rounded-2xl bg-white/50 backdrop-blur-sm shadow-xl shadow-indigo-100/20 text-slate-800 transition-all duration-300 hover:shadow-indigo-100/40">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Room Ready
                </div>
                <h3 className="text-lg font-bold text-slate-800">Share with friend</h3>
                <p className="text-sm text-slate-500">Scan QR or copy the link below</p>
            </div>

            <div className="flex flex-col items-center justify-center p-5 bg-white rounded-xl shadow-inner border border-slate-100 w-fit mx-auto transition-transform duration-300 hover:scale-105">
                <QRCodeSVG value={url} size={160} level="H" includeMargin={false} />
            </div>

            <div className="flex gap-2 items-center">
                <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm truncate font-mono flex items-center border border-slate-200 shadow-inner group">
                    <LinkIcon className="w-4 h-4 mr-3 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="truncate text-slate-600 font-medium">{url}</span>
                </div>
                <Button
                    size="lg"
                    className={`rounded-xl transition-all duration-300 ${copied ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/25' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'} shadow-lg w-14`}
                    onClick={copy}
                >
                    {copied ? <Check className="w-5 h-5 animate-in zoom-in" /> : <Copy className="w-5 h-5" />}
                </Button>
            </div>

            <p className="text-xs text-center text-slate-400 font-medium flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Secure connection waiting
            </p>
        </div>
    );
}
