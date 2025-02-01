import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import legacy from '@vitejs/plugin-legacy';
import createExternal from 'vite-plugin-external';

// https://vite.dev/config/
export default defineConfig({
  base: '/tizenbrew-ui/dist/',
  plugins: [
    preact(),
    legacy({
      targets: ['chrome 47'],
      renderLegacyChunks: true,
      polyfills: true
    }),
    createExternal({
      externals: {
        'react-native': 'react-native'
      }
    })
  ],
  build: {
    terserOptions: {
      ecma: 5
    },
    target: 'es2015',
    rollupOptions: {
      external: ['react-native'],
    }
  }
})
