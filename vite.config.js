import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import path from 'path'
import { fileURLToPath } from 'url'
import bundleStyleScss from './build/rollup-plugin-bundle-style-scss'

// todo: peerDependencies

const __filename__ = fileURLToPath(import.meta.url)
const __dirname__ = path.dirname(__filename__)

// https://vitejs.cn/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname__, 'src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  plugins: [
    bundleStyleScss(),
    vue()
  ],
  css: {
    postcss: {},
    preprocessorOptions: {
      scss: {
        additionalData: '@import \'src/variables.scss\';',
        quietDeps: true
      }
    }
  },
  server: {
    host: 5174
  },
  build: {
    lib: {
      entry: 'src/index.js',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['element-ui'],
      output: {
        dir: 'lib',
        manualChunks () {
          return 'index'
        }
      }
    }
  }
})
