/// <reference lib="webworker" />

import { hashChunk } from './integrity';

self.onmessage = async (e: MessageEvent) => {
    const { file, chunkSize = 256 * 1024 } = e.data;

    if (!file) return;

    try {
        const totalChunks = Math.ceil(file.size / chunkSize);
        const chunks = [];

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const blob = file.slice(start, end);
            const buffer = await blob.arrayBuffer();
            const hash = await hashChunk(buffer);

            chunks.push({
                index: i,
                hash,
                size: buffer.byteLength,
                offset: start
            });

            self.postMessage({ type: 'progress', pct: ((i + 1) / totalChunks) * 100 });
        }

        let fileId;
        if (file.size < 500 * 1024 * 1024) {
            const buffer = await file.arrayBuffer();
            fileId = await hashChunk(buffer);
        } else {
            const combinedHashes = chunks.map(c => c.hash).join('');
            const encoder = new TextEncoder();
            fileId = await hashChunk(encoder.encode(combinedHashes).buffer);
        }

        const manifest = {
            fileId,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || 'application/octet-stream',
            chunkSize,
            totalChunks,
            chunks
        };

        self.postMessage({ type: 'done', manifest });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        self.postMessage({ type: 'error', error: msg });
    }
};
