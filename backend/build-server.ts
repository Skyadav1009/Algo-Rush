import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/server.js',
  format: 'esm',
  external: [
    'express',
    'mongoose',
    'jsonwebtoken',
    'bcryptjs',
    'node-cron',
    'cors',
    'web-push',
    'dotenv',
    'vite'
  ],
}).catch(() => process.exit(1));
