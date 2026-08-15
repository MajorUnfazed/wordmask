import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { GlowButton } from '../components/ui/GlowButton'
import { useUIStore } from '../store/uiStore'
import { ensureAnonymousSession, isSupabaseConfigured } from '../lib/supabase'

interface CommunityPack {
  id: string
  title: string
  description: string
  language: string
  category: string
  tags: string[]
  downloads: number
  likes: number
  publishedAt: string | null
}

function PackCard({ pack, onLike }: { pack: CommunityPack; onLike: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="rounded-3xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-white">{pack.title}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/40">
              {pack.category} · {pack.language}
            </p>
            <p className="mt-2 text-sm text-white/60 line-clamp-2">{pack.description}</p>
            {pack.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {pack.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider"
                    style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--color-accent-light)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-4 text-sm text-white/40">
            <span>⬇️ {pack.downloads}</span>
            <span>❤️ {pack.likes}</span>
          </div>
          <button
            onClick={() => onLike(pack.id)}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-accent hover:text-accent"
          >
            Like
          </button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default function PackBrowserScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const [packs, setPacks] = useState<CommunityPack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Connect a project to browse community packs.')
      setLoading(false)
      return
    }
    void fetchPacks()
  }, [])

  async function fetchPacks() {
    try {
      const client = await ensureAnonymousSession()
      const { data, error: fetchError } = await client
        .from('community_packs')
        .select('id, title, description, language, category, tags, downloads, likes, published_at')
        .eq('status', 'published')
        .order('likes', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError
      setPacks(
        (data ?? []).map((row: Record<string, unknown>) => ({
          id: String(row['id'] ?? ''),
          title: String(row['title'] ?? ''),
          description: String(row['description'] ?? ''),
          language: String(row['language'] ?? ''),
          category: String(row['category'] ?? ''),
          tags: Array.isArray(row['tags']) ? (row['tags'] as string[]) : [],
          downloads: Number(row['downloads'] ?? 0),
          likes: Number(row['likes'] ?? 0),
          publishedAt: row['published_at'] ? String(row['published_at']) : null,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packs.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLike(packId: string) {
    // Optimistic update
    setPacks((prev) => prev.map((p) => p.id === packId ? { ...p, likes: p.likes + 1 } : p))
    try {
      const client = await ensureAnonymousSession()
      await client.rpc('like_community_pack', { p_pack_id: packId })
    } catch {
      // Revert on error
      setPacks((prev) => prev.map((p) => p.id === packId ? { ...p, likes: Math.max(0, p.likes - 1) } : p))
    }
  }

  const filteredPacks = packs.filter((pack) =>
    search.trim() === '' ||
    pack.title.toLowerCase().includes(search.toLowerCase()) ||
    pack.category.toLowerCase().includes(search.toLowerCase()) ||
    pack.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 overflow-y-auto px-6 py-12">
      <motion.div
        className="w-full max-w-2xl text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          Community
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold">Word Packs</h2>
        <p className="mt-2 text-white/50">Packs created and shared by the community.</p>
      </motion.div>

      <div className="w-full max-w-2xl">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search packs…"
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent placeholder:text-white/30"
        />
      </div>

      {error && (
        <div
          className="w-full max-w-2xl rounded-2xl border px-4 py-3 text-sm"
          style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'rgb(252,165,165)' }}
        >
          {error}
        </div>
      )}

      {loading && (
        <p className="text-white/40">Loading packs…</p>
      )}

      <div className="flex w-full max-w-2xl flex-col gap-4">
        {filteredPacks.map((pack) => (
          <PackCard key={pack.id} pack={pack} onLike={handleLike} />
        ))}
        {!loading && filteredPacks.length === 0 && !error && (
          <p className="py-12 text-center text-white/30">No packs found. Be the first to create one!</p>
        )}
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-3">
        <GlowButton onClick={() => setScreen('pack-creator')}>
          Create a Pack
        </GlowButton>
        <GlowButton variant="secondary" onClick={() => setScreen('home')}>
          Back
        </GlowButton>
      </div>
    </div>
  )
}
