import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Room,
  RoomEvent,
  type Participant,
} from 'livekit-client'

export interface VoiceSpeaker {
  id: string
  name: string
  isSpeaking: boolean
  isMuted: boolean
}

export interface VoiceChatState {
  isConnected: boolean
  isConnecting: boolean
  isReconnecting: boolean
  isMuted: boolean
  isDeafened: boolean
  isConfigured: boolean
  error: string | null
  audioDevices: MediaDeviceInfo[]
  speakerDevices: MediaDeviceInfo[]
  selectedMicId: string
  selectedSpeakerId: string
  activeSpeakers: VoiceSpeaker[]
  toggleMute: () => Promise<void>
  toggleDeafen: () => void
  selectMic: (deviceId: string) => Promise<void>
  selectSpeaker: (deviceId: string) => Promise<void>
  connect: () => Promise<void>
  disconnect: () => void
}

export function useVoiceChat(lobbyCode: string | null, playerName: string | null): VoiceChatState {
  const roomRef = useRef<Room | null>(null)

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedMicId, setSelectedMicId] = useState<string>('')
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>('')
  const [activeSpeakers, setActiveSpeakers] = useState<VoiceSpeaker[]>([])

  const livekitUrl = (import.meta.env['VITE_LIVEKIT_URL'] as string | undefined)?.trim() ?? ''
  const isConfigured = Boolean(livekitUrl)

  // Fetch available media input & output devices
  const refreshDevices = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) return
      const devices = await navigator.mediaDevices.enumerateDevices()
      const mics = devices.filter((d) => d.kind === 'audioinput')
      const speakers = devices.filter((d) => d.kind === 'audiooutput')
      setAudioDevices(mics)
      setSpeakerDevices(speakers)
      if (mics[0] && !selectedMicId) setSelectedMicId(mics[0].deviceId)
      if (speakers[0] && !selectedSpeakerId) setSelectedSpeakerId(speakers[0].deviceId)
    } catch {
      // Ignore device enumeration failures gracefully
    }
  }, [selectedMicId, selectedSpeakerId])

  useEffect(() => {
    void refreshDevices()
  }, [refreshDevices])

  // Disconnect & cleanup
  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect()
      roomRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
    setIsReconnecting(false)
    setActiveSpeakers([])
  }, [])

  // Auto-disconnect on lobby leave or unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect, lobbyCode])

  // Connect to LiveKit Room
  const connect = useCallback(async () => {
    if (!lobbyCode || !playerName) {
      setError('Lobby code and player name are required for voice chat.')
      return
    }

    if (!isConfigured) {
      setError('LiveKit URL not configured in environment variables (VITE_LIVEKIT_URL).')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      roomRef.current = room

      // Setup event handlers
      room
        .on(RoomEvent.Connected, () => {
          setIsConnected(true)
          setIsConnecting(false)
          setIsReconnecting(false)
        })
        .on(RoomEvent.Reconnecting, () => {
          setIsReconnecting(true)
        })
        .on(RoomEvent.Reconnected, () => {
          setIsReconnecting(false)
        })
        .on(RoomEvent.Disconnected, () => {
          disconnect()
        })
        .on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
          setActiveSpeakers(
            speakers.map((s) => ({
              id: s.identity,
              name: s.name || s.identity,
              isSpeaking: s.isSpeaking,
              isMuted: !s.isMicrophoneEnabled,
            }))
          )
        })

      // Request token from API endpoint or server
      const tokenUrl = `/api/voice-token?room=${encodeURIComponent(lobbyCode)}&identity=${encodeURIComponent(playerName)}`
      let token = ''
      try {
        const res = await fetch(tokenUrl)
        if (res.ok) {
          const json = (await res.json()) as { token?: string }
          token = json.token ?? ''
        }
      } catch {
        // Fallback token path
      }

      if (!token) {
        token = `mock-token-${lobbyCode}-${Date.now()}`
      }

      await room.connect(livekitUrl, token)

      // Automatically enable microphone with echo cancellation and noise suppression
      await room.localParticipant.setMicrophoneEnabled(true, {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        ...(selectedMicId ? { deviceId: selectedMicId } : {}),
      })

      setIsMuted(false)
    } catch (err) {
      disconnect()
      setError(err instanceof Error ? err.message : 'Could not connect to voice server.')
    } finally {
      setIsConnecting(false)
    }
  }, [lobbyCode, playerName, isConfigured, livekitUrl, selectedMicId, disconnect])

  // Mute / Unmute microphone
  const toggleMute = useCallback(async () => {
    if (!roomRef.current) return
    const nextMute = !isMuted
    await roomRef.current.localParticipant.setMicrophoneEnabled(!nextMute)
    setIsMuted(nextMute)
  }, [isMuted])

  // Deafen / Undeafen (mute incoming audio)
  const toggleDeafen = useCallback(() => {
    const nextDeafen = !isDeafened
    setIsDeafened(nextDeafen)

    if (roomRef.current) {
      for (const participant of roomRef.current.remoteParticipants.values()) {
        for (const publication of participant.audioTrackPublications.values()) {
          if (publication.track) {
            if (nextDeafen) {
              publication.track.detach()
            } else {
              publication.track.attach()
            }
          }
        }
      }
    }
  }, [isDeafened])

  // Select input microphone
  const selectMic = useCallback(
    async (deviceId: string) => {
      setSelectedMicId(deviceId)
      if (roomRef.current) {
        await roomRef.current.switchActiveDevice('audioinput', deviceId)
      }
    },
    []
  )

  // Select output speaker
  const selectSpeaker = useCallback(
    async (deviceId: string) => {
      setSelectedSpeakerId(deviceId)
      if (roomRef.current) {
        await roomRef.current.switchActiveDevice('audiooutput', deviceId)
      }
    },
    []
  )

  return {
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
  }
}
