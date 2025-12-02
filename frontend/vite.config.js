import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Se ha eliminado la configuración del proxy, ya que no es necesaria
    // y estaba causando problemas de autenticación en el entorno de Cloud Workstations.
  },
})
