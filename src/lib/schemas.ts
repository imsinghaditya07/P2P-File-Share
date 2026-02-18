import { z } from 'zod';

export const ChunkMetaSchema = z.object({
    index: z.number(),
    hash: z.string(),
    size: z.number(),
    offset: z.number(),
});

export const ChunkManifestSchema = z.object({
    fileId: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    mimeType: z.string(),
    chunkSize: z.number(),
    totalChunks: z.number(),
    chunks: z.array(ChunkMetaSchema),
});

export type ChunkMeta = z.infer<typeof ChunkMetaSchema>;
export type ChunkManifest = z.infer<typeof ChunkManifestSchema>;

export const SignalTypeSchema = z.enum(['offer', 'answer', 'ice']);

export const SignalMessageSchema = z.object({
    roomId: z.string(),
    peerId: z.string(),
    type: SignalTypeSchema,
    payload: z.any(), // RTCSessionDescriptionInit or RTCIceCandidateInit
});

export type SignalMessage = z.infer<typeof SignalMessageSchema>;

export const RoomSchema = z.object({
    active: z.boolean(),
    expiresAt: z.number(),
});

export type Room = z.infer<typeof RoomSchema>;
