import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

function serveRootMediaPlugin() {
  const extensions = ['jpeg', 'jpg', 'png', 'JPEG', 'JPG', 'PNG', 'webp', 'WEBP'];
  const names = ['nida', 'ayesha'];
  return {
    name: 'serve-root-media',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url || '';
        const match = url.match(/^\/(nida|ayesha)\.(jpeg|jpg|png|JPEG|JPG|PNG|webp|WEBP)$/i);
        if (match) {
          const baseName = match[1];
          const ext = match[2];
          const filePath = path.resolve(__dirname, `${baseName}.${ext}`);
          if (fs.existsSync(filePath)) {
            const lowerExt = ext.toLowerCase();
            const mimeType = lowerExt === 'png' ? 'image/png' : lowerExt === 'webp' ? 'image/webp' : 'image/jpeg';
            res.setHeader('Content-Type', mimeType);
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    },
    closeBundle() {
      names.forEach(name => {
        extensions.forEach(ext => {
          const srcPath = path.resolve(__dirname, `${name}.${ext}`);
          const destPath = path.resolve(__dirname, `dist/${name}.${ext}`);
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied ${name}.${ext} to dist/`);
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serveRootMediaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Unconditionally disable HMR and watching to prevent unexpected automatic page reloads in AI Studio
      hmr: false,
      watch: null,
    },
  };
});
