import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // localhost(127.0.0.1) + 네트워크 IP 모두 접속 가능
    strictPort: false,
    origin: 'http://127.0.0.1:5173', // 브라우저가 접속할 주소 고정
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
  },
})
