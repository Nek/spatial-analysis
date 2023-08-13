import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  root: './',
  resolve: {
    alias: [
      { find: '$', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  // resolve: {
  //   alias: {
  //     react: 'preact/compat',
  //     'react-dom': 'preact/compat',
  //     'react-reconciler': 'preact-reconciler',
  //     'react/jsx-runtime': 'preact/jsx-runtime',
  //   },
  // },
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
    react({
      include: '**/*.jsx',
    }),
  ],
})
