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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fimsinghaditya07%2FP2P-File-Share&env=KV_REST_API_URL,KV_REST_API_TOKEN,NEXT_PUBLIC_APP_URL)

## Setup

### Prerequisites

- Node.js 18+
- (Optional) A Vercel KV or Upstash Redis database (free tier) for production

### Environment Variables

Copy `.env.local.example` to `.env.local` and optionally fill in:

```bash
# Set either Vercel KV or Upstash Redis credentials
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server (Zero Config):
   *Note: If you don't provide KV credentials, the app will automatically fall back to in-memory storage. Perfect for local testing!*
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment 🚀 (Vercel Ready & 100% Free)

This project is perfectly optimized for Vercel's free Hobby Tier.

1. **Push your code to GitHub.**
2. **Import the project in Vercel:** Go to Vercel dashboard and add the repository.
3. **Add Storage:** Navigate to the "Storage" tab in your Vercel project dashboard, create a new **Vercel KV**, and connect it to your project. This completely handles the Redis environment variables automatically (`KV_REST_API_URL`, `KV_REST_API_TOKEN`).
4. **Deploy!**

## Architecture

See `src/app/page.tsx` or run the app to see the detailed architecture breakdown.

## Testing

Run unit tests:
```bash
npm test
```

Run E2E tests:
```bash
npm run test:e2e
```
