import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

/* Dev-only passthrough for the static folders that sit alongside the
   React app (photos, videos, the live web-demo iframes, the blog).
   They are not part of the Vite build — copy-static.mjs puts them
   next to the built app after `vite build` — but the dev server needs
   to be able to serve them too, or every img/iframe 404s locally. */
const STATIC_DIRS = ['assets', 'work', 'blog', 'db'];
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif',
  '.mp4': 'video/mp4', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.txt': 'text/plain', '.xml': 'application/xml'
};

function staticPassthrough() {
  return {
    name: 'static-passthrough',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = (req.url || '').split('?')[0];
        const top = urlPath.split('/')[1];
        if (!STATIC_DIRS.includes(top)) return next();
        const filePath = path.join(process.cwd(), decodeURIComponent(urlPath));
        fs.stat(filePath, (err, stat) => {
          if (err || !stat.isFile()) return next();
          res.setHeader('Content-Type', MIME[path.extname(filePath)] || 'application/octet-stream');
          res.setHeader('Accept-Ranges', 'bytes');

          // Videos need byte-range replies or browsers can't seek in them.
          const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
          if (range && (range[1] || range[2])) {
            const start = range[1] ? parseInt(range[1], 10) : Math.max(0, stat.size - parseInt(range[2], 10));
            const end = range[1] && range[2] ? Math.min(parseInt(range[2], 10), stat.size - 1) : stat.size - 1;
            if (start > end || start >= stat.size) {
              res.statusCode = 416;
              res.setHeader('Content-Range', `bytes */${stat.size}`);
              return res.end();
            }
            res.statusCode = 206;
            res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
            res.setHeader('Content-Length', end - start + 1);
            return fs.createReadStream(filePath, { start, end }).pipe(res);
          }
          res.setHeader('Content-Length', stat.size);
          fs.createReadStream(filePath).pipe(res);
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), staticPassthrough()],
  publicDir: false,
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    assetsDir: '_app',
    emptyOutDir: true
  }
});
