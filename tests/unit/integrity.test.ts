import { describe, it, expect } from 'vitest';
import { hashChunk, verifyChunk } from '../../src/lib/integrity';

describe('Integrity Module', () => {
    it('hashes a chunk consistently', async () => {
        const data = new TextEncoder().encode('Hello World');
        // SHA-256 of "Hello World"
        // a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e
        const hash = await hashChunk(data.buffer);
        expect(hash).toBe('a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e');
    });

    it('verifies a valid chunk', async () => {
        const data = new TextEncoder().encode('Test Data');
        const hash = await hashChunk(data.buffer);
        const isValid = await verifyChunk(data.buffer, hash);
        expect(isValid).toBe(true);
    });

    it('rejects an invalid chunk', async () => {
        const data = new TextEncoder().encode('Test Data');
        const hash = await hashChunk(data.buffer);
        const modified = new TextEncoder().encode('Test DatA');
        const isValid = await verifyChunk(modified.buffer, hash);
        expect(isValid).toBe(false);
    });
});
