import { motion } from 'framer-motion'
import { useState } from 'react'

interface LobbyCodeProps {
  code: string
}

export function LobbyCode({ code }: LobbyCodeProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.button
      onClick={handleCopy}
      className="flex flex-col items-center gap-1 px-8 py-4 rounded-2xl glass group"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{
        boxShadow: '0 0 30px var(--color-accent-glow)',
        border: '1px solid rgba(124,58,237,0.4)',
      }}
    >
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Room code
      </span>
      <span className="font-display text-4xl font-black tracking-widest" style={{ color: 'var(--color-accent-light)' }}>
        {code}
      </span>
      <span className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
        {copied ? '✓ Copied!' : 'Tap to copy'}
      </span>
    </motion.button>
  )
}
