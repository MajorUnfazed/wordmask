import { useState } from 'react'
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

export default function PackCreatorScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const [step, setStep] = useState<Step>('meta')

  // Meta
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('en')
  const [category, setCategory] = useState('')

  // Words
  const [words, setWords] = useState<WordDraft[]>([{ word: '', hints: [''] }])

  // Submission
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

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
    const draft: CommunityPackDraft = { title, description, language, category, tags: [], words }
    const result = validateCommunityPack(draft)
    setValidationErrors(result.errors)
    if (result.valid) setStep('review')
  }

  async function handleSubmit() {
    if (!isSupabaseConfigured) {
      setSubmitError('Supabase is not configured.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const client = await ensureAnonymousSession()
      const { data: { user } } = await client.auth.getUser()
      if (!user) throw new Error('You must be signed in to submit a pack.')

      // Insert pack metadata
      const { data: packData, error: packError } = await client
        .from('community_packs')
        .insert({ title, description, language, category, tags: [], creator_id: user.id })
        .select('id')
        .single()

      if (packError) throw packError
      const packId = String((packData as Record<string, unknown>)['id'] ?? '')

      // Insert words
      const wordRows = words.map((w, position) => ({
        pack_id: packId,
        word: w.word.trim(),
        clues: w.hints.map((h) => h.trim()).filter(Boolean),
        position,
      }))
      const { error: wordsError } = await client.from('community_pack_words').insert(wordRows)
      if (wordsError) throw wordsError

      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
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
        <h2 className="font-display text-4xl font-bold">Pack Submitted!</h2>
        <p className="text-white/60">Your pack is pending review. Once approved, it will appear in the community browser.</p>
        <GlowButton onClick={() => setScreen('pack-browser')}>Browse Packs</GlowButton>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 overflow-y-auto px-6 py-12">
      <motion.div
        className="w-full max-w-lg text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          {step === 'meta' ? 'Step 1 of 3' : step === 'words' ? 'Step 2 of 3' : 'Step 3 of 3'}
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold">
          {step === 'meta' ? 'Pack Details' : step === 'words' ? 'Add Words' : 'Review & Submit'}
        </h2>
      </motion.div>

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
                { label: 'Category', value: category, set: setCategory, placeholder: 'e.g. Entertainment', max: 48 }].map(({ label, value, set, placeholder, max }) => (
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
                  className="text-xs text-accent/70 hover:text-accent transition"
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
            <p className="text-center text-xs text-white/30">{words.length} / 500 words · Minimum 10 required</p>
            <GlowButton onClick={goToReview} disabled={words.length < 10}>
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
              <div className="flex gap-2 flex-wrap">
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

            <GlowButton onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Pack for Review'}
            </GlowButton>
            <GlowButton variant="secondary" onClick={() => setStep('words')}>Edit Words</GlowButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
