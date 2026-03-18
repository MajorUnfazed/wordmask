/**
 * Thin wrapper around the Web Audio API for UI sound effects.
 * All methods are no-ops when autoplay policy blocks audio.
 */

let ctx: AudioContext | null = null

function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue = 0.15,
): void {
  try {
    const c = getContext()
    const osc = c.createOscillator()
    const gain = c.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(frequency, c.currentTime)
    gain.gain.setValueAtTime(gainValue, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)

    osc.connect(gain)
    gain.connect(c.destination)
    osc.start()
    osc.stop(c.currentTime + duration)
  } catch {
    // Autoplay policy or unsupported — silently ignore
  }
}

export const sounds = {
  cardFlip: () => playTone(440, 0.12, 'triangle', 0.1),
  voteConfirm: () => playTone(660, 0.18, 'sine', 0.12),
  roundStart: () => playTone(220, 0.4, 'sawtooth', 0.08),
  elimination: () => playTone(110, 0.6, 'sawtooth', 0.15),
  victory: () => {
    playTone(523, 0.15, 'sine', 0.12)
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 150)
    setTimeout(() => playTone(784, 0.3, 'sine', 0.14), 300)
  },
}
