/// <reference types="vitest/config" />

import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import MotionResolver from 'motion-v/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/simple-weather/',

    resolve: {
      alias: {
        '~/': `${path.resolve(__dirname, 'src')}/`,
      },
    },

    plugins: [
      // https://github.com/antfu/unplugin-auto-import
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          '@vueuse/core',
        ],
        dts: true,
        dirs: [
          './src/composables/**',
        ],
        vueTemplate: true,
      }),

      // https://github.com/antfu/vite-plugin-components
      Components({
        dts: true, // enabled by default if `typescript` is installed
        resolvers: [
          MotionResolver(),
        ],
      }),

      tailwindcss(),

      vue(),

      // https://github.com/vuejs/devtools-next
      VueDevTools(),
    ],

    server: {
      proxy: {
        '/api/weather': {
          target: env.VITE_OPEN_WEATHER_API_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api\/weather/, '/data/2.5'),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              const url = new URL(req.url || '', `http://${req.headers.host}`)
              url.searchParams.append('appid', env.VITE_OPEN_WEATHER_API_KEY)
              proxyReq.path = url.pathname + url.search
            })
          },
        },

        '/api/geo': {
          target: env.VITE_OPEN_WEATHER_API_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api\/geo/, '/geo/1.0'),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              const url = new URL(req.url || '', `http://${req.headers.host}`)
              url.searchParams.append('appid', env.VITE_OPEN_WEATHER_API_KEY)
              proxyReq.path = url.pathname + url.search
            })
          },
        },
      },
    },

    // https://github.com/vitest-dev/vitest
    test: {
      environment: 'jsdom',
    },
  }
})
