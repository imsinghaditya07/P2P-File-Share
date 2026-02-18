import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { SignalMessageSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomId, peerId, type, payload } = SignalMessageSchema.parse(body);

        const key = `signal:${roomId}:${peerId}:${type}`;
        await kv.setex(key, 300, JSON.stringify(payload));

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('room');
    const peerId = searchParams.get('peer');
    const type = searchParams.get('type');

    if (!roomId || !peerId || !type) {
        return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    try {
        const key = `signal:${roomId}:${peerId}:${type}`;
        const data = await kv.get(key);

        if (!data) {
            return NextResponse.json({ payload: null }, { status: 404 });
        }

        if (typeof data === 'string') {
            // Redis returns string or null usually? If it's pure string?
            // MemoryKV handles JSON.stringify.
            // If Redis, 'get' returns string.
            // If MemoryKV, 'get' returns string.
            // We just return it as 'payload'.
            // If it was JSON stringified, we parse it or pass it?
            // The sender sends JSON.
            // The receiver expects JSON.
        }

        await kv.del(key);

        // Upstash usually auto-parses if stored as JSON?
        // Actually @upstash/redis .get() parses JSON automatically if stored as JSON string.
        // MemoryKV above returns stored value (which was stringified JSON).
        // Wait: In MemoryKV I store string.
        // In Redis via JSON.stringify(), get() will parse it back to Object?
        // If using Redis.fromEnv(), .get() returns Object.
        // If using MemoryKV, .get() returns *string* (JSON string).
        // My signal-api.ts expects "data.payload". It does `res.json()`.
        // The response payload should be the Object.
        // So here:
        let payload = data;
        if (typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
            try { payload = JSON.parse(data); } catch { }
        }

        // Wait, if Redis automatically parses, 'data' is Object.
        // If MemoryKV returns what I set (string), 'data' is String.
        // So let's normalize.

        return NextResponse.json({ payload });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
