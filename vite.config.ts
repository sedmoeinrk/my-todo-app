import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Listen on IPv4 explicitly: by default Vite may bind only to IPv6 (::1),
    // which some browsers/firewalls refuse when resolving "localhost".
    host: '127.0.0.1',
  },
})
