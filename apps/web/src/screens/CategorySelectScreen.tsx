import { motion } from 'framer-motion'
import { useOfflineGame } from '../hooks/useOfflineGame'
import { useUIStore } from '../store/uiStore'
import { GlowButton } from '../components/ui/GlowButton'
import { CategoryCard } from '../components/game/CategoryCard'
import { RECOMMENDED_CATEGORIES, wordCountByEngineCategory } from '../lib/categoryUI'

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[randomIndex]] = [copy[randomIndex]!, copy[index]!]
  }

  return copy
}

export default function CategorySelectScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const { selectedCategories, setSelectedCategories, startRound } = useOfflineGame()

  function isSelected(engineCategory: string) {
    return selectedCategories.includes(engineCategory)
  }

  function toggleCategory(engineCategory: string) {
    setSelectedCategories(
      isSelected(engineCategory)
        ? selectedCategories.filter((value) => value !== engineCategory)
        : [...selectedCategories, engineCategory],
    )
  }

  function handleSurpriseMe() {
    const minCategories = 3
    const maxCategories = 4
    const total = Math.min(
      RECOMMENDED_CATEGORIES.length,
      minCategories + Math.floor(Math.random() * (maxCategories - minCategories + 1)),
    )

    const surpriseSelection = shuffle(RECOMMENDED_CATEGORIES)
      .slice(0, total)
      .map((category) => category.engineCategory)

    setSelectedCategories(surpriseSelection)
  }

  function handleStartRound() {
    if (selectedCategories.length === 0) return
    startRound(selectedCategories)
    setScreen('round-transition')
  }

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-start gap-8 overflow-y-auto px-6 pt-12"
      style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}
    >
      <motion.div
        className="max-w-2xl text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <p
          className="mb-3 text-xs uppercase tracking-[0.36em]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Curated Categories
        </p>
        <h2 className="font-display text-4xl font-bold">Build your round pool</h2>
        <p
          className="mt-3 text-sm leading-6"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Pick one or more visual packs, or let the app choose a mix for you.
        </p>
      </motion.div>

      <div className="grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] sm:gap-4">
        {RECOMMENDED_CATEGORIES.map((category, index) => {
          const selected = isSelected(category.engineCategory)
          const wordCount = wordCountByEngineCategory.get(category.engineCategory) ?? 0

          return (
            <CategoryCard
              key={category.id}
              emoji={category.emoji}
              name={category.name}
              wordCount={wordCount}
              selected={selected}
              index={index}
              onClick={() => toggleCategory(category.engineCategory)}
            />
          )
        })}
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-3 pb-4">
        <div
          className="text-center text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {selectedCategories.length === 0
            ? 'Select at least one category to start.'
            : `${selectedCategories.length} categories selected`}
        </div>
        <GlowButton variant="secondary" onClick={handleSurpriseMe}>
          🎲 Surprise Me
        </GlowButton>
        <GlowButton onClick={handleStartRound} disabled={selectedCategories.length === 0}>
          Start Game
        </GlowButton>
      </div>
    </div>
  )
}
