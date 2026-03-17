/**
 * Thin wrapper around the Web Audio API for UI sound effects.
 * All methods are no-ops when autoplay policy blocks audio.
 */

let ctx: AudioContext | null = null
let _soundEnabled = true

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
  if (!_soundEnabled) return
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
  timerEnd: () => {
    playTone(880, 0.15, 'square', 0.08)
    setTimeout(() => playTone(880, 0.15, 'square', 0.08), 200)
    setTimeout(() => playTone(880, 0.25, 'square', 0.1), 400)
  },
  buttonClick: () => playTone(600, 0.06, 'triangle', 0.06),
  transition: () => {
    playTone(330, 0.08, 'sine', 0.05)
    setTimeout(() => playTone(440, 0.1, 'sine', 0.06), 80)
  },
  impostorReveal: () => {
    playTone(150, 0.3, 'sawtooth', 0.12)
    setTimeout(() => playTone(120, 0.4, 'sawtooth', 0.1), 300)
  },

  get enabled() {
    return _soundEnabled
  },
  setEnabled(v: boolean) {
    _soundEnabled = v
    try {
      localStorage.setItem('wordmask-sound', v ? '1' : '0')
    } catch { /* noop */ }
  },
  init() {
    try {
      const stored = localStorage.getItem('wordmask-sound')
      if (stored !== null) _soundEnabled = stored === '1'
    } catch { /* noop */ }
  },
}

// Auto-init on load
sounds.init()
