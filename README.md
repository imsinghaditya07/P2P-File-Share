# Production P2P File Sharing

A production-quality browser-based P2P file sharing application deployable entirely on Vercel's free Hobby tier with zero server costs.
Files transfer directly peer-to-peer via WebRTC DataChannels. Vercel handles only lightweight signaling. No file ever touches a server.

## Features

- **P2P Transport**: WebRTC DataChannels for direct, encrypted, browser-to-browser transfer.
- **Zero Server Costs**: Uses Vercel Edge Functions + Upstash Redis (free tier only) for signaling.
- **Privacy First**: No file data touches the server. Only transient signaling metadata (SDP, ICE candidates) is stored briefly.
- **Secure**: All transfers are DTLS-encrypted. File integrity verified with SHA-256checksums.
- **Resilient**: Automatic chunking, parallel transfers, and retry logic.
- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui.

## Live Demo

[Deploy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fp2p-share&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,NEXT_PUBLIC_APP_URL)

## Setup

### Prerequisites

- Node.js 18+
- An Upstash Redis database (free tier)

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server (Zero Config):
   *Note: If you don't provide Upstash credentials, the app will automatically fall back to in-memory storage. Perfect for local testing!*
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

1. Push to GitHub.
2. Import project in Vercel.
3. Add the environment variables from Upstash.
4. Deploy!

## Architecture

See [App Architecture](./src/app/page.tsx) or run the app to see the detailed architecture breakdown.

## Testing

Run unit tests:
```bash
npm test
```

Run E2E tests:
```bash
npm run test:e2e
```
