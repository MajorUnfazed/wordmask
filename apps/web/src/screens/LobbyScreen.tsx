import { motion } from 'framer-motion'
import { LobbyCode } from '../components/lobby/LobbyCode'
import { PlayerList } from '../components/lobby/PlayerList'
import { GlowButton } from '../components/ui/GlowButton'
import { getDisplayCategoryName } from '../lib/categoryUI'
import { useLobby } from '../hooks/useLobby'

export default function LobbyScreen() {
  const {
    code,
    players,
    localPlayerId,
    isHost,
    status,
    isBusy,
    error,
    selectedCategories,
    onlineCategoryOptions,
    setSelectedCategories,
    startGame,
    disconnectLobby,
  } = useLobby()

  function toggleCategory(category: string) {
    const nextCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((value) => value !== category)
      : [...selectedCategories, category]

    setSelectedCategories(nextCategories)
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-6 py-12">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-display text-3xl font-bold">Online Lobby</h2>
        <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {status === 'playing'
            ? 'A round is in progress.'
            : 'Share the code and wait for everyone to join.'}
        </p>
      </motion.div>

      {code && <LobbyCode code={code} />}

      {error && (
        <div
          className="w-full max-w-md rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: 'rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)',
            color: 'rgb(252,165,165)',
          }}
        >
          {error}
        </div>
      )}

      <div className="w-full max-w-md">
        <PlayerList players={players} localPlayerId={localPlayerId ?? ''} />
      </div>

      {isHost && status === 'waiting' && (
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/40">Round Category</p>
              <h3 className="mt-1 font-display text-2xl font-bold">
                {selectedCategories.length === 1
                  ? getDisplayCategoryName(selectedCategories[0])
                  : `${selectedCategories.length} categories selected`}
              </h3>
              <p className="mt-2 text-sm text-white/55">
                Pick one or more categories. The round word will be drawn from that combined pool.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {onlineCategoryOptions.map((category) => {
              const isSelected = selectedCategories.includes(category.engineCategory)

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.engineCategory)}
                  className="rounded-2xl border px-3 py-3 text-left transition"
                  style={{
                    borderColor: isSelected ? 'rgba(124,58,237,0.7)' : 'rgba(255,255,255,0.08)',
                    background: isSelected ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.03)',
                    boxShadow: isSelected ? '0 0 0 1px rgba(124,58,237,0.35)' : 'none',
                  }}
                >
                  <div className="text-lg">{category.emoji}</div>
                  <div className="mt-2 text-sm font-semibold text-white">{category.name}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex w-full max-w-md flex-col gap-3">
        {isHost ? (
          <GlowButton
            onClick={() => {
              void startGame()
            }}
            disabled={players.length < 3 || selectedCategories.length === 0 || isBusy}
          >
            {isBusy ? 'Starting…' : 'Start Round'}
          </GlowButton>
        ) : (
          <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Waiting for the host to start the round…
          </p>
        )}

        <GlowButton variant="secondary" onClick={disconnectLobby}>
          Leave Lobby
        </GlowButton>
      </div>
    </div>
  )
}
