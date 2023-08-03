import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  root: './',
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react-reconciler': 'preact-reconciler',
      'react/jsx-runtime': 'preact/jsx-runtime',
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
  plugins: [
    preact({
      include: '**/*.jsx',
    }),
  ],
})
