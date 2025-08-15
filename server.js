#!/usr/bin/env node
/*
  Minimal static server for development (no deps)
  - Serves files from current directory
  - Sets correct content types for common assets
  - Adds basic CORS headers for local testing
*/
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const ROOT = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.hdr': 'image/vnd.radiance',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.usdz': 'model/vnd.usdz+zip',
  '.manifest': 'text/cache-manifest'
};

const send = (res, code, headers, body) => {
  res.writeHead(code, { 'Access-Control-Allow-Origin': '*', ...headers });
  if (body) res.end(body); else res.end();
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURI(req.url.split('?')[0]);
    if (urlPath.endsWith('/')) urlPath += 'index.html';

    // Service worker: allow exact path
    if (urlPath === '/service-worker.js') {
      const swPath = path.join(ROOT, 'service-worker.js');
      if (fs.existsSync(swPath)) {
        const data = fs.readFileSync(swPath);
        return send(res, 200, { 'Content-Type': 'text/javascript; charset=utf-8' }, data);
      }
    }

    const filePath = path.join(ROOT, urlPath);
    if (!filePath.startsWith(ROOT)) return send(res, 403, {}, 'Forbidden');

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || 'application/octet-stream';
      const data = fs.readFileSync(filePath);
      return send(res, 200, { 'Content-Type': type }, data);
    }

    // Fallback to index.html for SPA routes
    const indexPath = path.join(ROOT, 'index.html');
    if (fs.existsSync(indexPath)) {
      const data = fs.readFileSync(indexPath);
      return send(res, 200, { 'Content-Type': 'text/html; charset=utf-8' }, data);
    }

    return send(res, 404, {}, 'Not Found');
  } catch (e) {
    return send(res, 500, {}, String(e.stack || e));
  }
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
