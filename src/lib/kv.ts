import { Redis } from '@upstash/redis';

// Simple in-memory KV for development/demo without credentials
class MemoryKV {
    private store = new Map<string, { value: string, expires: number }>();

    async setex(key: string, seconds: number, value: string) {
        this.store.set(key, {
            value,
            expires: Date.now() + seconds * 1000
        });
        return 'OK';
    }

    async get(key: string) {
        const item = this.store.get(key);
        if (!item) return null;
        if (Date.now() > item.expires) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    async del(key: string) {
        this.store.delete(key);
        return 1;
    }
}

// Singleton global for development state persistence
const globalForKV = globalThis as unknown as {
    memoryKV: MemoryKV | undefined
}

const getKV = () => {
    // Check for either Vercel KV or Upstash Redis credentials
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
        try {
            return new Redis({ url, token });
        } catch {
            console.error("Redis init failed, falling back to memory");
        }
    }

    // Fallback
    console.warn("⚠️ Using in-memory KV (Redis credentials missing). To fix on Vercel, attach a Vercel KV (free tier) in your dashboard.");
    if (!globalForKV.memoryKV) globalForKV.memoryKV = new MemoryKV();
    return globalForKV.memoryKV;
};

export const kv = getKV();
