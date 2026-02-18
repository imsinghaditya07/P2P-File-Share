import { Redis } from '@upstash/redis';

// Simple in-memory KV for development/demo without credentials
class MemoryKV {
    private store = new Map<string, { value: any, expires: number }>();

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
    // Only use Redis if BOTH vars are present and non-empty
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
            return new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            });
        } catch (e) {
            console.error("Redis init failed, falling back to memory");
        }
    }

    // Fallback
    console.warn("⚠️ Using in-memory KV (Redis credentials missing). Works locally but not on Vercel.");
    if (!globalForKV.memoryKV) globalForKV.memoryKV = new MemoryKV();
    return globalForKV.memoryKV;
};

export const kv = getKV();
