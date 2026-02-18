import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
    hash: string;
    status: 'pending' | 'pass' | 'fail';
}

export function IntegrityBadge({ hash, status }: Props) {
    return (
        <div className="flex flex-col gap-1 items-start">
            <span className="text-xs uppercase text-muted-foreground tracking-widest">SHA-256 Integrity</span>
            <div className="flex items-center gap-2">
                <code className="text-[10px] sm:text-xs font-mono bg-muted px-2 py-1 rounded text-foreground break-all">
                    {hash || 'Computing...'}
                </code>
                {status === 'pass' && <Badge variant="default" className="bg-green-500 hover:bg-green-600">PASS</Badge>}
                {status === 'fail' && <Badge variant="destructive" className="animate-pulse">FAIL</Badge>}
                {status === 'pending' && <Badge variant="outline" className="text-muted-foreground">Checking</Badge>}
            </div>
        </div>
    );
}
