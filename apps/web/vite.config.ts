import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'production') {
    const env = loadEnv(mode, __dirname, '')
    const missing: string[] = []
    if (!env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL')
    if (!env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY')
    if (missing.length > 0) {
      throw new Error(
        `[vite] Missing production env: ${missing.join(', ')}. ` +
          `Add them in Vercel Settings → Environment Variables (all scopes) and redeploy.`,
      )
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@impostor/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      },
    },
  }
})
