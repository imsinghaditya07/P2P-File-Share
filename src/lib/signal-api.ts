import { Room } from './schemas';

const API_BASE = '/api';

export class SignalApi {
    constructor(private roomId: string, private peerId: string) { }

    async sendSignal(type: 'offer' | 'answer' | 'ice', payload: unknown) {
        const res = await fetch(`${API_BASE}/signal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                roomId: this.roomId,
                peerId: this.peerId,
                type,
                payload,
            }),
        });
        if (!res.ok) throw new Error('Signal failed');
    }

    async getSignal(peerId: string, type: 'offer' | 'answer' | 'ice') {
        const res = await fetch(
            `${API_BASE}/signal?room=${this.roomId}&peer=${peerId}&type=${type}`
        );
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Get signal failed');
        const data = await res.json();
        return data.payload;
    }

    static async createRoom(): Promise<{ roomId: string; shareUrl: string }> {
        const res = await fetch(`${API_BASE}/rooms`, { method: 'POST' });
        if (!res.ok) throw new Error('Create room failed');
        return res.json();
    }

    static async getRoom(roomId: string): Promise<Room> {
        const res = await fetch(`${API_BASE}/rooms/${roomId}`);
        if (!res.ok) throw new Error('Get room failed');
        return res.json();
    }
}
