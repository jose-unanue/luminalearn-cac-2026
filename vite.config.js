import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { luminaBackendPlugin } from './server/apiMiddleware.js';

export default defineConfig({
  plugins: [react(), tailwindcss(), luminaBackendPlugin()],
  server: {
    port: 5173,
    open: false
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('/src/data/')) {
            return 'curriculum-data';
          }
          if (
            id.includes('TeacherAdminPortal') ||
            id.includes('ResearchReportModal')
          ) {
            return 'educator-and-research';
          }
        }
      }
    }
  }
});
