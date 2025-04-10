import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: "/~savary23/SAE401/CycleC/dist/",
  plugins: [react(), tailwindcss(), svgr()],
  preview: {
   port: 5173,
   strictPort: true,
  },
  server: {
   port: 5173,
   strictPort: true,
   host: true,
   origin: "http://localhost:8090",
   allowedHosts: ["sae-frontend"]
  },
});