import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import type { PlayerRole } from "@impostor/core"
import { sounds } from "../../lib/sounds"

const HOLD_MS = 600
const FLIP_DURATION = 0.6

const HIDDEN_SHADOW = "0 15px 40px rgba(0,0,0,0.4)"
const REVEALED_SHADOW = "0 30px 80px rgba(124,58,237,0.35)"
const REVEALED_GLOW = "drop-shadow(0 0 20px rgba(168,85,247,0.8))"

interface RoleCardProps {
  playerName: string
  role: PlayerRole
  word: string
  hint: string
  revealed: boolean
  disabled?: boolean
  onReveal?: () => void
}

export function RoleCard({
  playerName,
  role,
  word,
  hint,
  revealed,
  disabled = false,
  onReveal,
}: RoleCardProps) {
  const [isPressed, setIsPressed] = useState(false)

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousRevealed = useRef(revealed)

  const isImpostor = role === "IMPOSTOR"

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current)
    }
  }, [])

  useEffect(() => {
    if (previousRevealed.current !== revealed) {
      sounds.cardFlip()
      previousRevealed.current = revealed
    }
  }, [revealed])

  const startHold = useCallback(() => {
    if (revealed || disabled || holdTimer.current) return

    setIsPressed(true)

    holdTimer.current = setTimeout(() => {
      holdTimer.current = null
      setIsPressed(false)
      onReveal?.()
    }, HOLD_MS)
  }, [disabled, onReveal, revealed])

  const endHold = useCallback(() => {
    setIsPressed(false)
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
  }, [])

  return (
    <>
      {/* Background blur when revealed */}
      <motion.div
        className="fixed inset-0 z-10 pointer-events-none"
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      />

      {/* Perspective container */}
      <div
        className="relative z-20 select-none"
        style={{ perspective: "1200px", width: 280, height: 440 }}
      >
        <motion.div
          animate={{
            scale: isPressed && !revealed ? 0.95 : 1,
            boxShadow: revealed ? REVEALED_SHADOW : HIDDEN_SHADOW,
            filter: revealed ? REVEALED_GLOW : "none",
          }}
          transition={{
            scale: { duration: 0.12 },
            boxShadow: { duration: FLIP_DURATION, ease: "easeInOut" },
            filter: { duration: FLIP_DURATION, ease: "easeInOut" },
          }}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            cursor: disabled || revealed ? "default" : "pointer",
            touchAction: "none",
          }}
        >
          <motion.div
            animate={{ rotateY: revealed ? 180 : 0 }}
            transition={{ duration: FLIP_DURATION, ease: "easeInOut" }}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            <div
              className="rounded-3xl flex flex-col items-center justify-center gap-5 overflow-hidden"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="text-7xl">🂠</div>

              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                Secret Role
              </p>

              <p className="text-xs text-gray-300">{playerName}</p>

              <p className="font-display text-base font-bold tracking-wide text-gray-200">
                {isPressed ? "Revealing..." : "Press & hold to reveal"}
              </p>

              {isPressed && (
                <motion.div
                  className="absolute bottom-8 rounded-full overflow-hidden"
                  style={{
                    width: 120,
                    height: 3,
                    background: "rgba(255,255,255,0.1)",
                  }}
                >
                  <motion.div
                    className="h-full rounded-full bg-purple-400"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: HOLD_MS / 1000,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              )}
            </div>

            <div
              className="rounded-3xl flex flex-col items-center justify-center gap-4 overflow-hidden p-8 text-center"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                background: isImpostor
                  ? "linear-gradient(135deg,#1a0a2e 0%,#3b0764 100%)"
                  : "linear-gradient(135deg,#0a1530 0%,#0d2b6b 100%)",
                border: isImpostor
                  ? "1px solid rgba(167,86,247,0.5)"
                  : "1px solid rgba(59,130,246,0.45)",
              }}
            >
              <div className="text-6xl">{isImpostor ? "😈" : "🕵️"}</div>

              <h3 className="font-display text-3xl font-black">
                {isImpostor ? "Impostor" : "Player"}
              </h3>

              {isImpostor ? (
                <>
                  <p className="text-sm text-gray-300">Your only clue</p>
                  <p className="font-display text-2xl font-bold text-red-400">
                    {hint}
                  </p>
                  <p className="text-xs text-gray-400">
                    Blend in. Don't get caught.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-300">The word is</p>
                  <p className="font-display text-2xl font-bold text-purple-300">
                    {word}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
