/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.output.globalObject = 'self';
        return config;
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' https://stun.l.google.com:19302 wss://stun.l.google.com:19302 blob:;",
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
