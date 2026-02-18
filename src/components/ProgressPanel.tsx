import { useTransferStore } from "@/store/transfer";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils"; // Wait, formatBytes doesn't exist in utils, I should add it or inline. I'll inline.

function fmt(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function ProgressPanel() {
    const { stats, status, manifest, error } = useTransferStore();

    if (!manifest) return null;

    const percent = stats.bytesTotal > 0 ? (stats.bytesSent / stats.bytesTotal) * 100 : 0;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex justify-between">
                    <span>Transfer Progress</span>
                    <span className={status === 'error' ? 'text-destructive' : 'text-primary'}>{status}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Progress value={percent} className="h-3" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground text-xs">Transferred</p>
                        <p className="font-mono">{fmt(stats.bytesSent)} / {fmt(stats.bytesTotal)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">Speed</p>
                        <p className="font-mono">{fmt(stats.speed)}/s</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">ETA</p>
                        <p className="font-mono">{stats.eta > 0 ? `${Math.ceil(stats.eta)}s` : '-'}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">File</p>
                        <p className="truncate" title={manifest.fileName}>{manifest.fileName}</p>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive text-sm rounded border border-destructive/20">
                        {error}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
