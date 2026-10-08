import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Next.js only auto-loads .env files from this app's own directory; the monorepo
// keeps a single .env at the repo root, so load it explicitly.
config({ path: path.resolve(__dirname, '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@editor/edit-schema',
    '@editor/db',
    '@editor/storage',
    '@editor/remotion-composition',
  ],
  experimental: {
    // These ship native binaries resolved relative to their own package directory
    // (e.g. ffprobe-static's `__dirname`-based path); bundling them breaks that
    // resolution, so they must be required from node_modules at runtime instead.
    serverComponentsExternalPackages: [
      '@remotion/renderer',
      'fluent-ffmpeg',
      'ffmpeg-static',
      'ffprobe-static',
      'bullmq',
    ],
  },
};

export default nextConfig;
