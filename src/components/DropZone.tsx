'use client';

import { useState, useCallback, useRef } from 'react';
import { useTransferStore } from '@/store/transfer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CloudUpload } from 'lucide-react';
import { ChunkManifest } from '@/lib/schemas';

export function DropZone() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProcessingProgress] = useState(0);
    const setManifest = useTransferStore((state) => state.setManifest);
    const setFile = useTransferStore((state) => state.setFile);
    const workerRef = useRef<Worker | null>(null);

    const processFile = useCallback((file: File) => {
        setProcessing(true);
        setProcessingProgress(0);

        if (!workerRef.current) {
            workerRef.current = new Worker(new URL('../lib/chunker.worker.ts', import.meta.url));
            workerRef.current.onmessage = (e) => {
                const { type, pct, manifest, error } = e.data;
                if (type === 'progress') setProcessingProgress(pct);
                else if (type === 'done') {
                    setManifest(manifest as ChunkManifest);
                    setFile(file);
                    setProcessing(false);
                    workerRef.current?.terminate();
                    workerRef.current = null;
                } else if (type === 'error') {
                    setProcessing(false);
                    alert('Error: ' + error);
                }
            };
        }
        workerRef.current.postMessage({ file });
    }, [setFile, setManifest]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    }, [processFile]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <Card
            className={`border-0 cursor-pointer transition-all duration-300 rounded-[24px] shadow-none ${isDragOver ? 'bg-blue-50/50 ring-2 ring-blue-500/20' : 'bg-slate-50/50 hover:bg-slate-100/50'
                }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
        >
            <CardContent className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                <input type="file" id="fileInput" className="hidden" onChange={onFileChange} />

                {processing ? (
                    <div className="space-y-6 w-full max-w-xs">
                        <div className="relative w-20 h-20 mx-auto">
                            <Loader2 className="w-20 h-20 animate-spin text-blue-500 opacity-20 absolute inset-0" />
                            <Loader2 className="w-20 h-20 animate-spin text-blue-500 absolute inset-0" style={{ animationDuration: '3s' }} />
                            <div className="absolute inset-0 flex items-center justify-center font-medium text-slate-800 text-sm">
                                {Math.round(progress)}%
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-medium text-[17px] text-slate-900">Preparing File...</h3>
                            <p className="text-[13px] text-slate-500 font-light">Optimizing and securing chunks</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-7 group">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-500 shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-slate-100">
                            <CloudUpload className="w-10 h-10 text-blue-500 stroke-[1.5]" />
                        </div>
                        <div>
                            <h3 className="text-[22px] font-semibold text-slate-900 mb-2">Upload File</h3>
                            <p className="text-[15px] text-slate-500 max-w-sm mx-auto leading-relaxed font-light">
                                Drag & drop any file here, or click to browse.
                                <br />
                                <span className="text-[13px] text-slate-400 mt-2 inline-block">
                                    Directly transfers from your device securely.
                                </span>
                            </p>
                        </div>
                        <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 text-[15px] font-medium transition-all shadow-md">
                            Browse Files
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
