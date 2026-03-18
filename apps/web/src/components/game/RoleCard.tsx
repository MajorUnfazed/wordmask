import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import type { PlayerRole } from "@impostor/core"

const FLIP_DURATION = 0.5
const REVEAL_THRESHOLD = -100

interface RoleCardProps {
  playerName: string
  role: PlayerRole
  word: string
  hint: string
  revealed: boolean
  disabled?: boolean
  bluffMode?: boolean
  onReveal?: () => void
}

export function RoleCard({
  playerName,
  role,
  word,
  hint,
  revealed,
  disabled = false,
  bluffMode = false,
  onReveal,
}: RoleCardProps) {
  const isImpostor = role === "IMPOSTOR"

  // Drag physics
  const y = useMotionValue(0)
  
  // Map negative drag distance to visual progress
  const dragProgressWidth = useTransform(y, [0, REVEAL_THRESHOLD], ["0%", "100%"])
  const dragRotateX = useTransform(y, [0, REVEAL_THRESHOLD], [0, 45])
  const dragOpacity = useTransform(y, [0, REVEAL_THRESHOLD / 2], [1, 0])

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (!revealed && !disabled && info.offset.y <= REVEAL_THRESHOLD) {
      onReveal?.()
    }
  }

  return (
    <>
      {/* Background blur when revealed */}
      <motion.div
        className="fixed inset-0 z-10 pointer-events-none"
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* Perspective container */}
      <div
        className="relative z-20 select-none"
        style={{ perspective: "1000px", width: 260, height: 400 }}
      >
        <motion.div
          drag={!revealed && !disabled ? "y" : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.8, bottom: 0 }}
          onDragEnd={handleDragEnd}
          style={{
            y,
            width: "100%",
            height: "100%",
            position: "relative",
            cursor: disabled || revealed ? "default" : "grab",
            touchAction: "none",
          }}
          whileDrag={{ cursor: "grabbing" }}
          animate={{
            filter: revealed ? "drop-shadow(0 0 20px rgba(124,58,237,0.4))" : "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
          }}
          transition={{
            filter: { duration: FLIP_DURATION, ease: "easeInOut" },
          }}
        >
          <motion.div
            animate={{ rotateY: revealed ? 180 : 0 }}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transformStyle: "preserve-3d",
              rotateX: revealed ? 0 : dragRotateX,
            }}
            transition={{ duration: FLIP_DURATION, ease: "easeInOut" }}
          >
            <div
              className="rounded-3xl flex flex-col items-center justify-center gap-6 overflow-hidden bg-surface border border-white/10"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div className="text-6xl">🂠</div>

              <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
                  Secret Role
                </p>
                <p className="text-xl font-semibold text-white">{playerName}</p>
              </div>

              <motion.p 
                style={{ opacity: dragOpacity }}
                className="font-display text-sm font-bold tracking-widest text-white/50 uppercase mt-4"
              >
                Swipe Up To Reveal
              </motion.p>

              {!revealed && !disabled && (
                <motion.div
                  className="absolute bottom-8 rounded-full overflow-hidden"
                  style={{
                    width: 100,
                    height: 4,
                    background: "rgba(255,255,255,0.1)",
                    opacity: dragOpacity
                  }}
                >
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    style={{ width: dragProgressWidth }}
                  />
                </motion.div>
              )}
            </div>

            <div
              className="rounded-3xl flex flex-col items-center justify-center gap-5 overflow-hidden p-8 text-center bg-surface border border-white/10"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div className="text-5xl mb-2">{isImpostor ? "😈" : "🕵️"}</div>

              <h3 className={`font-display text-3xl font-bold tracking-wide ${isImpostor ? 'text-danger' : 'text-accent'}`}>
                {isImpostor ? "IMPOSTOR" : "PLAYER"}
              </h3>

              {isImpostor ? (
                <div className="flex flex-col gap-2 mt-4">
                  {bluffMode ? (
                    <>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>The word is</p>
                      <p className="font-display text-2xl font-bold text-white">{word}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-yellow-400 mt-2">⚡ Bluff Mode — category hidden</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-danger">Blend in. Don't get caught.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>Your only clue</p>
                      <p className="font-display text-2xl font-bold text-white">{hint}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-danger mt-2">Blend in. Don't get caught.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>The word is</p>
                  <p className="font-display text-2xl font-bold text-white">
                    {word}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
