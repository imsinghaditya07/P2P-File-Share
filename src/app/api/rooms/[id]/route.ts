import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const roomId = params.id;

    if (!roomId) {
        return NextResponse.json({ error: 'Missing room ID' }, { status: 400 });
    }

    try {
        const key = `room:${roomId}`;
        const roomDataRaw = await kv.get(key);

        if (!roomDataRaw) {
            return NextResponse.json({ active: false }, { status: 404 });
        }

        let roomData = roomDataRaw;
        if (typeof roomData === 'string') {
            try { roomData = JSON.parse(roomData); } catch { }
        }

        return NextResponse.json({ active: true, ...roomData });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
