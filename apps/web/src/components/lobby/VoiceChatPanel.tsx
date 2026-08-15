import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceChat } from '../../hooks/useVoiceChat'
import { useLobbyStore } from '../../store/lobbyStore'

export function VoiceChatPanel() {
  const lobbyCode = useLobbyStore((s) => s.code)
  const displayName = useLobbyStore((s) => s.displayName)

  const {
    isConnected,
    isConnecting,
    isReconnecting,
    isMuted,
    isDeafened,
    isConfigured,
    error,
    audioDevices,
    speakerDevices,
    selectedMicId,
    selectedSpeakerId,
    activeSpeakers,
    toggleMute,
    toggleDeafen,
    selectMic,
    selectSpeaker,
    connect,
    disconnect,
  } = useVoiceChat(lobbyCode, displayName)

  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-xl text-accent">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-bold text-white">Voice Chat</h3>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : isConnecting || isReconnecting
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-white/20'
                }`}
              />
            </div>
            <p className="text-xs text-white/50">
              {isConnected
                ? isReconnecting
                  ? 'Reconnecting voice…'
                  : 'Connected · Echo & Noise suppressed'
                : isConnecting
                ? 'Connecting to voice room…'
                : isConfigured
                ? 'Voice chat available'
                : 'LiveKit server not configured'}
            </p>
          </div>
        </div>

        {isConnected ? (
          <button
            onClick={disconnect}
            className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={() => void connect()}
            disabled={isConnecting}
            className="rounded-2xl bg-accent px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent/80 disabled:opacity-50"
          >
            {isConnecting ? 'Joining…' : 'Join Voice'}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
          ⚠️ {error}
        </div>
      )}

      {/* Connected Voice Controls */}
      {isConnected && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => void toggleMute()}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                isMuted
                  ? 'border border-red-500/40 bg-red-500/20 text-red-200'
                  : 'border border-white/10 bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <span>{isMuted ? '🔇' : '🎤'}</span>
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              onClick={toggleDeafen}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                isDeafened
                  ? 'border border-red-500/40 bg-red-500/20 text-red-200'
                  : 'border border-white/10 bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <span>{isDeafened ? '🔕' : '🎧'}</span>
              <span>{isDeafened ? 'Undeafen' : 'Deafen'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            title="Audio Device Settings"
          >
            ⚙️
          </button>
        </div>
      )}

      {/* Active Speakers Indicators */}
      {isConnected && activeSpeakers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 pt-1">
          {activeSpeakers.map((speaker) => (
            <div
              key={speaker.id}
              className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{speaker.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Device Settings Modal Dropdown */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex flex-col gap-3 overflow-hidden border-t border-white/10 pt-4 text-xs"
          >
            <label className="flex flex-col gap-1">
              <span className="text-white/60">Microphone</span>
              <select
                value={selectedMicId}
                onChange={(e) => void selectMic(e.target.value)}
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none"
              >
                {audioDevices.map((device, i) => (
                  <option key={device.deviceId || i} value={device.deviceId} className="bg-void text-white">
                    {device.label || `Microphone ${i + 1}`}
                  </option>
                ))}
              </select>
            </label>

            {speakerDevices.length > 0 && (
              <label className="flex flex-col gap-1">
                <span className="text-white/60">Speakers / Output</span>
                <select
                  value={selectedSpeakerId}
                  onChange={(e) => void selectSpeaker(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none"
                >
                  {speakerDevices.map((device, i) => (
                    <option key={device.deviceId || i} value={device.deviceId} className="bg-void text-white">
                      {device.label || `Speaker ${i + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
