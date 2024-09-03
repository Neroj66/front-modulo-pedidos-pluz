import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '10.155.241.37', // o una IP específica como '192.168.1.100'
    port: 4000
  },
})
