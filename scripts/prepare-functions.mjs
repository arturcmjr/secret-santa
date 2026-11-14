import { cp, rm } from 'node:fs/promises';

// The Cloud Function only deploys what lives in /functions, so the SSR bundle is copied there after each build
await rm('functions/server', { recursive: true, force: true });
await cp('dist/prod/server', 'functions/server', { recursive: true });
console.log('Copied dist/prod/server to functions/server');
