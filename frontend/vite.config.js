import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function proxyShortLinkRoutes() {
  return {
    name: 'proxy-shortlink-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || req.method !== 'GET') {
          next();
          return;
        }

        const [pathname] = req.url.split('?');
        const isInternalRoute =
          pathname === '/' ||
          pathname.startsWith('/api/') ||
          pathname.startsWith('/@vite/') ||
          pathname.startsWith('/src/') ||
          pathname.startsWith('/node_modules/') ||
          pathname.includes('.');

        if (isInternalRoute) {
          next();
          return;
        }

        if (!/^\/[A-Za-z0-9]+$/.test(pathname)) {
          next();
          return;
        }

        try {
          const upstream = await fetch(`http://127.0.0.1:3000${req.url}`, {
            redirect: 'manual',
          });

          res.statusCode = upstream.status;
          upstream.headers.forEach((value, key) => {
            if (!['content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
              res.setHeader(key, value);
            }
          });

          const body = Buffer.from(await upstream.arrayBuffer());
          res.end(body);
        } catch {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), proxyShortLinkRoutes()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
