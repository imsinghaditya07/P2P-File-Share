import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Link as LinkIcon, Cloud } from "lucide-react";
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
        <div className="space-y-6 pt-4 text-slate-800 transition-all duration-300">
            <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 text-blue-600 text-xs font-medium mb-3 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-blue-100/50">
                    <Cloud className="w-3.5 h-3.5" />
                    Ready to Share
                </div>
                <h3 className="text-[20px] font-semibold text-slate-900 tracking-[-0.01em]">Share with Recipient</h3>
                <p className="text-[14px] text-slate-500 font-light">Scan QR or share the link</p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-white/50 backdrop-blur-md rounded-[24px] shadow-sm border border-black/[0.04] w-fit mx-auto transition-transform duration-300 hover:scale-105">
                <QRCodeSVG value={url} size={150} level="H" includeMargin={false} />
            </div>

            <div className="flex gap-2 items-center max-w-sm mx-auto">
                <div className="flex-1 bg-slate-50/50 backdrop-blur-sm rounded-[14px] px-4 py-3 text-[13px] truncate font-mono flex items-center border border-black/[0.04] group transition-colors">
                    <LinkIcon className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="truncate text-slate-600 font-medium">{url}</span>
                </div>
                <Button
                    size="lg"
                    className={`rounded-[14px] transition-all duration-300 ${copied ? 'bg-green-500 hover:bg-green-600 shadow-md shadow-green-500/20 text-white' : 'bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/10 text-white'} w-12 h-[46px] p-0 flex items-center justify-center`}
                    onClick={copy}
                >
                    {copied ? <Check className="w-4 h-4 animate-in zoom-in" /> : <Copy className="w-4 h-4" />}
                </Button>
            </div>

            <p className="text-[12px] text-center text-slate-400 font-medium flex items-center justify-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Waiting for secure connection
            </p>
        </div>
    );
}
