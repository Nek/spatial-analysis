import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  root: './',
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react-reconciler': 'preact-reconciler',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
  plugins: [preact()],
})
