import { defineConfig } from 'vite'

export default defineConfig({
  // Configurações do servidor de desenvolvimento
  server: {
    port: 3000,
    open: true, // Abre o navegador automaticamente
    host: true  // Permite acesso pela rede local
  },
  
  // Configurações de build
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    
    // Otimizações de bundle
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['font-awesome']
        }
      }
    },
    
    // Compressão
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
        drop_debugger: true
      }
    }
  },
  
  // Plugins
  plugins: [
    // Plugin para PWA será adicionado quando instalar as dependências
  ],
  
  // CSS
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('cssnano')({
          preset: 'default'
        })
      ]
    }
  },
  
  // Otimizações de assets
  assetsInclude: ['**/*.jpeg', '**/*.jpg', '**/*.png', '**/*.gif', '**/*.webp', '**/*.mp4'],
  
  // Base URL para produção
  base: process.env.NODE_ENV === 'production' ? '/2710/' : '/',
  
  // Definir variáveis de ambiente
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  }
})