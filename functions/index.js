const { onRequest } = require('firebase-functions/v2/https');

let handler;

// `./server` is the Angular server bundle copied in by scripts/prepare-functions.mjs
exports.ssr = onRequest(
  {
    region: 'southamerica-east1',
    memory: '512MiB',
    timeoutSeconds: 30,
    maxInstances: 10,
  },
  async (req, res) => {
    handler ??= (await import('./server/server.mjs')).reqHandler;
    return handler(req, res);
  }
);
