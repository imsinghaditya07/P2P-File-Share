import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export const runtime = 'nodejs'; // Use nodejs for in-memory KV fallbacks

export async function POST(req: NextRequest) {
    try {
        const { nanoid } = await import('nanoid');
        const roomId = nanoid(10);
        const key = `room:${roomId}`;

        // Default KV (Redis or Mem)
        // For Mem, we need to pass (key, ttl, value). Redis setex(key, ttl, value).
        // Our kv.ts adapter returns a compatible API for .set() if we use @upstash/redis directly.
        // Wait, the memory fallback returns object with .setex(), .get(), .del().

        // Upstash Redis: .setex(key, seconds, value)
        // MemoryKV: .setex(key, seconds, value)

        // Check if kv implements .setex.
        // If not using Upstash type directly, we need to be careful with types.
        // kv is typed as Redis | MemoryKV.
        // If kv is Redis, setex exists. If MemoryKV, setex exists.

        const roomData = {
            created: Date.now(),
            active: true
        };

        await kv.setex(key, 3600, JSON.stringify(roomData));

        const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/room/${roomId}`;

        return NextResponse.json({ roomId, shareUrl });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
}
