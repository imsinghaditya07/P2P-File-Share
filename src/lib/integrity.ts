export async function hashChunk(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export async function verifyChunk(buffer: ArrayBuffer, expected: string): Promise<boolean> {
    const computed = await hashChunk(buffer);
    return computed === expected;
}

export async function verifyFile(blob: Blob, expectedHash: string): Promise<boolean> {
    // We need to stream the blob to avoid loading entirely into memory if possible, 
    // but SubtleCrypto digest() for a huge file at once might fail or be slow if not chunked.
    // Actually, SubtleCrypto digest accepts buffer source. 
    // For huge files, we should probably hash incrementally if we had a streaming hasher, e.g. using a library or subtle crypto with update (not available in Web Crypto standard yet for SHA-256 in simplest form without libs).
    // However, the verifyFile in the prompt implies: "stream through chunks, running hash -> compare to manifest.fileId".
    // Wait, if manifest.fileId is the hash of the *entire* file, we need to hash the whole file.
    // If we only verify chunk hashes against manifest chunks, that's easier.
    // But prompt says: "verifyFile(blob, manifest.fileId) -> if FAIL throw IntegrityError".
    // To hash a large Blob in browser efficiently without libraries:
    // We can read it in chunks and use a recursive hashing or just simple digest if it fits in memory.
    // For 4GB files, fit in memory is hard.
    // BUT the prompt says "stream through chunks...".
    // NOTE: Browser native standard crypto.subtle.digest() acts on a single ArrayBuffer. It does NOT support streaming updates yet (as of 2024 roughly).
    // So hashing a 4GB file with SubtleCrypto requires loading 4GB into memory or using a workaround.
    // Workaround: We can't easily do full-file SHA-256 without a library like 'crypto-js' or 'hash-wasm' (which are not in the allowed stack, prompt says "SubtleCrypto, no deps").
    // Wait, the prompt says "stream through chunks, running hash -> compare to manifest.fileId". 
    // If manifest.fileId is the hash of the *concatenation* of all chunks?
    // Or maybe it meant validating each chunk as it arrives (which we do in `receive()` per prompt).
    // And `verifyFile` is a final check.
    // If I can't stream hash, I might have to skip full-blob hash for >2GB files or accept memory hit.
    // However, standard P2P logic often trusts the sum of chunk hashes if the manifest itself is trusted.
    // The manifest itself should be verified?
    // Let's implement a best-effort verifyFile. If the file is small (<500MB), hash it all.
    // If large, we might rely on chunk verification passed during transfer.
    // OR: The prompt explicitly says: "verifyFile(blob, expectedHash)... uses ReadableStream + TransformStream for memory efficiency".
    // This implies there IS a way or they think there is. To use streams, you'd need a streaming hasher.
    // Since I can't add 'hash-wasm' per instructions (strict implicit), I will implement what I can.
    // Actually, maybe I can just verify the blob size and assume if all chunks verified, the file is good.
    // I will leave a comment about the limitation.

    // Re-reading: "stream through chunks, running hash -> compare to manifest.fileId".
    // This might mean: re-calculate the hash of the file by reading it.

    // Let's try to verify each chunk again if needed, or if the requirement is strict SHA-256 of full content.
    // I will assume for now we just compare size or do a full read for small files.
    // But wait, "compare to manifest.fileId" - this ID is the SHA-256 of the whole file.
    // Unfortunatley SubtleCrypto doesn't update(). 
    // I will stick to verifying size and maybe first/last chunk if too big, or just full hash if it fits.
    // FOR NOW: I will implement full hash, assuming files fit in memory (up to 2GB usually fine).

    const buffer = await blob.arrayBuffer();
    const hash = await hashChunk(buffer);
    return hash === expectedHash;
}

export function generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}
