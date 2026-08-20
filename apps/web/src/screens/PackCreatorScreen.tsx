import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { GlowButton } from '../components/ui/GlowButton'
import { useUIStore } from '../store/uiStore'
import { validateCommunityPack } from '@impostor/core'
import { ensureAnonymousSession, isSupabaseConfigured } from '../lib/supabase'
import type { CommunityPackDraft } from '@impostor/core'

type Step = 'meta' | 'words' | 'review'

interface WordDraft {
  word: string
  hints: string[]
}

const SAMPLE_JSON = {
  title: "Classic Movies",
  description: "Identify popular movies from subtle 1-2 word clues.",
  category: "Entertainment",
  language: "en",
  tags: ["movies", "pop-culture", "cinema"],
  words: [
    { word: "Inception", hints: ["Dream", "Layers"] },
    { word: "Matrix", hints: ["Simulation", "Red Pill"] },
    { word: "Titanic", hints: ["Iceberg", "Shipwreck"] },
    { word: "Gladiator", hints: ["Colosseum", "Vengeance"] },
    { word: "Interstellar", hints: ["Wormhole", "Gravity"] },
    { word: "Jaws", hints: ["Shark", "Beach"] },
    { word: "Jurassic Park", hints: ["Dinosaur", "Island"] },
    { word: "Avatar", hints: ["Pandora", "Blue"] },
    { word: "Psycho", hints: ["Shower", "Motel"] },
    { word: "Star Wars", hints: ["Galactic", "Force"] }
  ]
}

export default function PackCreatorScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('meta')

  // Meta
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('en')
  const [category, setCategory] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  // Words
  const [words, setWords] = useState<WordDraft[]>([
    { word: '', hints: [''] },
    { word: '', hints: [''] }
  ])

  // Submission
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  function downloadSampleJson() {
    const jsonStr = JSON.stringify(SAMPLE_JSON, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wordmask_pack_template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = JSON.parse(text) as Record<string, unknown> | Array<Record<string, unknown>>

        if (Array.isArray(parsed)) {
          // Simple words array JSON
          const importedWords: WordDraft[] = parsed
            .filter((item) => typeof item === 'object' && item !== null && 'word' in item)
            .map((item) => ({
              word: String(item['word'] ?? '').trim(),
              hints: Array.isArray(item['hints'])
                ? item['hints'].map((h) => String(h).trim()).filter(Boolean)
                : Array.isArray(item['clues'])
                ? item['clues'].map((c) => String(c).trim()).filter(Boolean)
                : [''],
            }))

          if (importedWords.length > 0) {
            setWords(importedWords)
            setStep('words')
          }
        } else if (typeof parsed === 'object' && parsed !== null) {
          // Full pack draft JSON
          if (parsed['title']) setTitle(String(parsed['title']).trim())
          if (parsed['description']) setDescription(String(parsed['description']).trim())
          if (parsed['category']) setCategory(String(parsed['category']).trim())
          if (parsed['language']) setLanguage(String(parsed['language']).trim())
          if (Array.isArray(parsed['tags'])) setTagsInput(parsed['tags'].join(', '))

          if (Array.isArray(parsed['words'])) {
            const importedWords: WordDraft[] = parsed['words']
              .filter((item) => typeof item === 'object' && item !== null && 'word' in item)
              .map((item) => ({
                word: String((item as Record<string, unknown>)['word'] ?? '').trim(),
                hints: Array.isArray((item as Record<string, unknown>)['hints'])
                  ? ((item as Record<string, unknown>)['hints'] as unknown[]).map((h) => String(h).trim()).filter(Boolean)
                  : Array.isArray((item as Record<string, unknown>)['clues'])
                  ? ((item as Record<string, unknown>)['clues'] as unknown[]).map((c) => String(c).trim()).filter(Boolean)
                  : [''],
              }))

            if (importedWords.length > 0) setWords(importedWords)
          }

          setStep('words')
        }
      } catch (err) {
        setSubmitError(err instanceof Error ? `Invalid JSON: ${err.message}` : 'Failed to parse JSON file.')
      }
    }
    reader.readAsText(file)
  }

  function addWord() {
    setWords((prev) => [...prev, { word: '', hints: [''] }])
  }

  function removeWord(index: number) {
    setWords((prev) => prev.filter((_, i) => i !== index))
  }

  function updateWord(index: number, word: string) {
    setWords((prev) => prev.map((w, i) => i === index ? { ...w, word } : w))
  }

  function updateHint(wordIndex: number, hintIndex: number, hint: string) {
    setWords((prev) => prev.map((w, i) =>
      i === wordIndex
        ? { ...w, hints: w.hints.map((h, j) => j === hintIndex ? hint : h) }
        : w
    ))
  }

  function addHint(wordIndex: number) {
    setWords((prev) => prev.map((w, i) =>
      i === wordIndex ? { ...w, hints: [...w.hints, ''] } : w
    ))
  }

  function goToReview() {
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    const draft: CommunityPackDraft = { title, description, language, category, tags, words }
    const result = validateCommunityPack(draft)
    setValidationErrors(result.errors)
    if (result.valid) setStep('review')
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    const packObj = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      language,
      category: category.trim(),
      tags,
      words: words.map((w) => ({ word: w.word.trim(), hints: w.hints.map((h) => h.trim()).filter(Boolean) })),
      createdAt: new Date().toISOString(),
    }

    // Always save to localStorage custom packs
    try {
      const existing = localStorage.getItem('wordmask_custom_packs')
      const list = existing ? (JSON.parse(existing) as unknown[]) : []
      list.push(packObj)
      localStorage.setItem('wordmask_custom_packs', JSON.stringify(list))
    } catch {
      // Ignore
    }

    // Submit to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const client = await ensureAnonymousSession()
        const { data: { user } } = await client.auth.getUser()
        if (user) {
          const { data: packData, error: packError } = await client
            .from('community_packs')
            .insert({ title: title.trim(), description: description.trim(), language, category: category.trim(), tags, creator_id: user.id })
            .select('id')
            .single()

          if (packError) throw packError
          const packId = String((packData as Record<string, unknown>)['id'] ?? '')

          const wordRows = words.map((w, position) => ({
            pack_id: packId,
            word: w.word.trim(),
            clues: w.hints.map((h) => h.trim()).filter(Boolean),
            position,
          }))

          await client.from('community_pack_words').insert(wordRows)
        }
      } catch (err) {
        console.warn('Supabase pack submission warning:', err)
      }
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-8xl"
        >
          🎉
        </motion.div>
        <h2 className="font-display text-4xl font-bold">Pack Saved!</h2>
        <p className="max-w-sm text-white/60">
          Saved to this device{isSupabaseConfigured ? ' and submitted for community review' : ''}. You
          can play it right away — pick it under “Your Packs” when choosing categories, in offline
          games or as the host of an online lobby.
        </p>
        <GlowButton onClick={() => setScreen('pack-browser')}>Browse Packs</GlowButton>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 overflow-y-auto px-6 py-12">
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        className="hidden"
        onChange={handleFileUpload}
      />

      <motion.div
        className="w-full max-w-lg text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          {step === 'meta' ? 'Step 1 of 3' : step === 'words' ? 'Step 2 of 3' : 'Step 3 of 3'}
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold">
          {step === 'meta' ? 'Pack Details' : step === 'words' ? 'Add Words' : 'Review & Save'}
        </h2>
      </motion.div>

      {/* Upload JSON banner */}
      <GlassCard className="w-full max-w-lg rounded-3xl p-5 border border-accent/30 bg-accent/10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="font-display font-bold text-white">📁 Quick JSON Import</h4>
            <p className="text-xs text-white/60 mt-1">Upload a .json pack file to automatically prefill everything.</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 rounded-2xl bg-accent px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-accent/80"
          >
            Upload JSON
          </button>
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        {step === 'meta' && (
          <motion.div
            key="meta"
            className="flex w-full max-w-lg flex-col gap-6"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <GlassCard className="rounded-3xl p-6 flex flex-col gap-5">
              {[{ label: 'Pack Title', value: title, set: setTitle, placeholder: 'e.g. Classic Movies', max: 80 },
                { label: 'Description', value: description, set: setDescription, placeholder: 'What is this pack about?', max: 500 },
                { label: 'Category', value: category, set: setCategory, placeholder: 'e.g. Entertainment', max: 48 },
                { label: 'Tags (comma separated)', value: tagsInput, set: setTagsInput, placeholder: 'e.g. movies, pop-culture', max: 100 }].map(({ label, value, set, placeholder, max }) => (
                <label key={label} className="flex flex-col gap-2">
                  <span className="text-sm text-white/60">{label}</span>
                  <input
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    maxLength={max}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent placeholder:text-white/30"
                  />
                </label>
              ))}

              <label className="flex flex-col gap-2">
                <span className="text-sm text-white/60">Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="pt">Portuguese</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </GlassCard>

            <div className="flex gap-3">
              <button
                onClick={downloadSampleJson}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-white/70 hover:bg-white/10"
              >
                📥 Download JSON Template
              </button>
            </div>

            <GlowButton onClick={() => setStep('words')} disabled={!title.trim() || !category.trim()}>
              Next: Add Words
            </GlowButton>
            <GlowButton variant="secondary" onClick={() => setScreen('pack-browser')}>Cancel</GlowButton>
          </motion.div>
        )}

        {step === 'words' && (
          <motion.div
            key="words"
            className="flex w-full max-w-lg flex-col gap-5"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            {validationErrors.length > 0 && (
              <div
                className="rounded-2xl border px-4 py-3 text-sm"
                style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'rgb(252,165,165)' }}
              >
                {validationErrors.slice(0, 5).map((err, i) => <div key={i}>{err}</div>)}
              </div>
            )}

            {words.map((word, wi) => (
              <GlassCard key={wi} className="rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <input
                    value={word.word}
                    onChange={(e) => updateWord(wi, e.target.value)}
                    placeholder={`Word ${wi + 1}`}
                    maxLength={40}
                    className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-accent placeholder:text-white/30"
                  />
                  {words.length > 1 && (
                    <button onClick={() => removeWord(wi)} className="p-2 text-white/30 hover:text-red-400 transition">
                      ✕
                    </button>
                  )}
                </div>
                {word.hints.map((hint, hi) => (
                  <input
                    key={hi}
                    value={hint}
                    onChange={(e) => updateHint(wi, hi, e.target.value)}
                    placeholder={`Clue ${hi + 1} (1-2 words)`}
                    maxLength={120}
                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-accent placeholder:text-white/30"
                  />
                ))}
                <button
                  onClick={() => addHint(wi)}
                  className="text-xs text-accent/70 hover:text-accent transition self-start"
                >
                  + Add clue
                </button>
              </GlassCard>
            ))}

            <button
              onClick={addWord}
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 py-4 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition"
            >
              + Add Word
            </button>

            <p className="text-center text-xs text-white/30">{words.length} words added · Minimum 10 recommended</p>

            <GlowButton onClick={goToReview} disabled={words.length < 2 || words.some((w) => !w.word.trim())}>
              Review Pack
            </GlowButton>

            <GlowButton variant="secondary" onClick={() => setStep('meta')}>Back</GlowButton>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div
            key="review"
            className="flex w-full max-w-lg flex-col gap-5"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <GlassCard className="rounded-3xl p-6 flex flex-col gap-3">
              <h3 className="font-display text-xl font-bold">{title}</h3>
              <p className="text-sm text-white/60">{description}</p>
              <div className="flex gap-2 flex-wrap mt-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">{category}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">{language.toUpperCase()}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">{words.length} words</span>
              </div>
            </GlassCard>

            {submitError && (
              <div
                className="rounded-2xl border px-4 py-3 text-sm"
                style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'rgb(252,165,165)' }}
              >
                {submitError}
              </div>
            )}

            <GlowButton onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save & Publish Pack'}
            </GlowButton>
            <GlowButton variant="secondary" onClick={() => setStep('words')}>Edit Words</GlowButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
