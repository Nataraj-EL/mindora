import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function mindoraAiServerPlugin(): Plugin {
  return {
    name: 'mindora-ai-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next: () => void) => {
        const urlStr: string = req.url || '';
        if (urlStr.startsWith('/api/ai/')) {
          try {
            let body = null;
            if (req.method === 'POST') {
              const chunks: any[] = [];
              for await (const chunk of req) {
                chunks.push(chunk);
              }
              const rawBody = Buffer.concat(chunks).toString();
              if (rawBody.trim().length > 0) {
                body = JSON.parse(rawBody);
              }
            }

            // @ts-ignore - dynamic import of ESM server module
            const { handleAIRequest } = await import('./server/aiRouter.mjs');
            const pathname = urlStr.split('?')[0];
            const handled = await handleAIRequest(req, res, pathname, body);
            if (handled) return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Server error' }));
            return;
          }
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mindoraAiServerPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
