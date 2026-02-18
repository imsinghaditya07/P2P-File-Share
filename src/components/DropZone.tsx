'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTransferStore } from '@/store/transfer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Send, File as FileIcon, UploadCloud } from 'lucide-react';
import { ChunkManifest } from '@/lib/schemas';

export function DropZone() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProcessingProgress] = useState(0);
    const setManifest = useTransferStore((state) => state.setManifest);
    const setFile = useTransferStore((state) => state.setFile);
    const workerRef = useRef<Worker | null>(null);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
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
    };

    return (
        <Card
            className={`border-dashed border-2 cursor-pointer transition-all duration-300 rounded-2xl shadow-sm ${isDragOver ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' : 'border-slate-200 hover:border-blue-400 hover:shadow-md bg-white'
                }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
        >
            <CardContent className="flex flex-col items-center justify-center p-12 text-center min-h-[320px]">
                <input type="file" id="fileInput" className="hidden" onChange={onFileChange} />

                {processing ? (
                    <div className="space-y-6 w-full max-w-xs">
                        <div className="relative w-20 h-20 mx-auto">
                            <Loader2 className="w-20 h-20 animate-spin text-blue-500 opacity-20 absolute inset-0" />
                            <Loader2 className="w-20 h-20 animate-spin text-blue-600 absolute inset-0 style={{animationDuration: '3s'}}" />
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-700">
                                {Math.round(progress)}%
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-slate-700">Analyzing File...</h3>
                            <p className="text-sm text-slate-500">Preparing encryption & chunks</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 group">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-inner">
                            <Send className="w-10 h-10 text-blue-600 ml-1.5" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Send Files</h3>
                            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                                Drag & drop files or click to browse.<br />
                                <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-full mt-2 inline-block">
                                    No Size Limit • Direct P2P • Encrypted
                                </span>
                            </p>
                        </div>
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-full px-8 font-bold tracking-wide">
                            Select File
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
