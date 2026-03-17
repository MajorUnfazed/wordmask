import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import type { PlayerRole } from "@impostor/core"
import { sounds } from "../../lib/sounds"

const FLIP_DURATION = 0.6
const REVEAL_THRESHOLD = -130

const HIDDEN_SHADOW = "0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"
const REVEALED_SHADOW = "0 24px 60px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
const REVEALED_GLOW = "drop-shadow(0 0 30px rgba(168,85,247,0.6))"

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
  const previousRevealed = useRef(revealed)
  const isImpostor = role === "IMPOSTOR"

  // Drag physics
  const y = useMotionValue(0)
  
  // Map negative drag distance to visual progress and card tilt
  const dragProgressWidth = useTransform(y, [0, REVEAL_THRESHOLD], ["0%", "100%"])
  const dragRotateX = useTransform(y, [0, REVEAL_THRESHOLD], [0, 45])
  const dragOpacity = useTransform(y, [0, REVEAL_THRESHOLD / 2], [1, 0])

  useEffect(() => {
    if (previousRevealed.current !== revealed) {
      sounds.cardFlip()
      previousRevealed.current = revealed
    }
  }, [revealed])

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
            boxShadow: revealed ? REVEALED_SHADOW : HIDDEN_SHADOW,
            filter: revealed ? REVEALED_GLOW : "none",
          }}
          transition={{
            boxShadow: { duration: FLIP_DURATION, ease: "easeInOut" },
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
              className="rounded-[32px] flex flex-col items-center justify-center gap-6 overflow-hidden glass-panel"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div className="text-7xl drop-shadow-lg">🂠</div>

              <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-blue">
                  Secret Role
                </p>
                <p className="text-xl font-medium tracking-wide text-white">{playerName}</p>
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
                    width: 120,
                    height: 3,
                    background: "rgba(255,255,255,0.1)",
                    opacity: dragOpacity
                  }}
                >
                  <motion.div
                    className="h-full rounded-full bg-accent-purple"
                    style={{ width: dragProgressWidth }}
                  />
                </motion.div>
              )}
            </div>

            <div
              className="rounded-[32px] flex flex-col items-center justify-center gap-5 overflow-hidden p-8 text-center"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                background: isImpostor
                  ? "linear-gradient(135deg, rgba(30,10,40,0.9) 0%, rgba(80,10,60,0.95) 100%)"
                  : "linear-gradient(135deg, rgba(10,20,40,0.9) 0%, rgba(10,40,80,0.95) 100%)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2)",
                backdropFilter: "blur(24px)",
              }}
            >
              <div className="text-6xl drop-shadow-xl mb-2">{isImpostor ? "😈" : "🕵️"}</div>

              <h3 className={`font-display text-4xl font-black tracking-wide ${isImpostor ? 'text-danger' : 'text-accent-blue'}`}>
                {isImpostor ? "IMPOSTOR" : "PLAYER"}
              </h3>

              {isImpostor ? (
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">Your only clue</p>
                  <p className="font-display text-3xl font-bold text-white drop-shadow-md">
                    {hint}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-danger mt-2">
                    Blend in. Don't get caught.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">The word is</p>
                  <p className="font-display text-3xl font-bold text-white drop-shadow-md">
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
