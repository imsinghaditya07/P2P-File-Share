import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Link as LinkIcon } from "lucide-react";
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
        <div className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground">
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md w-fit mx-auto">
                <QRCodeSVG value={url} size={150} />
            </div>
            <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded px-3 py-2 text-xs truncate font-mono flex items-center">
                    <LinkIcon className="w-3 h-3 mr-2 opacity-50" />
                    {url}
                </div>
                <Button size="icon" variant="outline" onClick={copy}>
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
                Share this link or QR code with the recipient. Valid for 1 hour.
            </p>
        </div>
    );
}
