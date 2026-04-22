import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        shop: resolve(__dirname, 'shop.html'),
        finishes: resolve(__dirname, 'finishes.html'),
        categories: resolve(__dirname, 'categories.html'),
        product: resolve(__dirname, 'product.html'),
        doorStyles: resolve(__dirname, 'door-styles.html'),
        getStarted: resolve(__dirname, 'get-started.html'),
        concerns: resolve(__dirname, 'concerns.html'),
      },
    },
  },
})
