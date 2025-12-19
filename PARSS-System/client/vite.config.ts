import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Enable JSX runtime automatic import
      jsxRuntime: 'automatic'
    }),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['react-query', '@tanstack/react-query'],
          ui: ['lucide-react', 'framer-motion'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-query',
      '@tanstack/react-query',
      'axios',
      'react-hook-form',
      'zustand',
      'react-hot-toast',
      'framer-motion',
      'lucide-react',
      'recharts',
      'date-fns'
    ]
  },
  define: {
    // Enable development mode checks
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    // Set API base URL
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || '/api'),
    // Set app version
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    devSourcemap: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/'
      ]
    }
  }
});