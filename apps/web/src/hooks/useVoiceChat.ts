import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Room,
  RoomEvent,
  type Participant,
} from 'livekit-client'
import { getSupabaseRestConfig, getSupabaseClient } from '../lib/supabase'

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
  isLocalTest: boolean
  isMuted: boolean
  isDeafened: boolean
  isConfigured: boolean
  micLevel: number
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
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number | null>(null)

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [isLocalTest, setIsLocalTest] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedMicId, setSelectedMicId] = useState<string>('')
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>('')
  const [activeSpeakers, setActiveSpeakers] = useState<VoiceSpeaker[]>([])

  const livekitUrl = (import.meta.env['VITE_LIVEKIT_URL'] as string | undefined)?.trim() ?? ''
  const isConfigured = Boolean(livekitUrl)

  // Fetch available media devices
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
      // Ignore device enumeration failures
    }
  }, [selectedMicId, selectedSpeakerId])

  useEffect(() => {
    void refreshDevices()
  }, [refreshDevices])

  // Cleanup local audio context analyzer
  const cleanupAudioAnalyzer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close()
      audioContextRef.current = null
    }
    setMicLevel(0)
  }, [])

  // Disconnect & cleanup
  const disconnect = useCallback(() => {
    cleanupAudioAnalyzer()

    if (roomRef.current) {
      roomRef.current.disconnect()
      roomRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
    setIsReconnecting(false)
    setIsLocalTest(false)
    setActiveSpeakers([])
    setError(null)
  }, [cleanupAudioAnalyzer])

  // Auto-disconnect on lobby leave or unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect, lobbyCode])

  // Start local mic analyzer loop
  const startMicAnalyzer = useCallback((stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyzer = audioCtx.createAnalyser()
      analyzer.fftSize = 64
      source.connect(analyzer)

      const dataArray = new Uint8Array(analyzer.frequencyBinCount)
      const checkLevel = () => {
        analyzer.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]!
        }
        const avg = sum / dataArray.length
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)))
        animFrameRef.current = requestAnimationFrame(checkLevel)
      }
      checkLevel()
    } catch {
      // Ignore audio context errors
    }
  }, [])

  // Connect to LiveKit Room (or start local mic test mode if LiveKit URL not set)
  const connect = useCallback(async () => {
    if (!lobbyCode || !playerName) {
      setError('Lobby code and player name are required.')
      return
    }

    setIsConnecting(true)
    setError(null)

    // If LiveKit URL is configured, connect to LiveKit server
    if (isConfigured) {
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

        const restConfig = getSupabaseRestConfig()
        if (!restConfig) {
          throw new Error('Voice chat is unavailable because Supabase is not configured.')
        }

        // Authenticate the token request with the current (anonymous) session when available,
        // falling back to the anon key so the Supabase edge function's JWT check passes.
        let accessToken = restConfig.anonKey
        try {
          const { data } = await getSupabaseClient()!.auth.getSession()
          if (data.session?.access_token) {
            accessToken = data.session.access_token
          }
        } catch {
          // Fall back to the anon key.
        }

        const tokenUrl = `${restConfig.url}/functions/v1/voice-token?room=${encodeURIComponent(lobbyCode)}&identity=${encodeURIComponent(playerName)}`
        const res = await fetch(tokenUrl, {
          headers: {
            apikey: restConfig.anonKey,
            Authorization: `Bearer ${accessToken}`,
          },
        })
        if (!res.ok) {
          throw new Error(`Voice token request failed (${res.status}).`)
        }
        const json = (await res.json()) as { token?: string }
        const token = json.token ?? ''
        if (!token) {
          throw new Error('Voice server did not return a token.')
        }

        await room.connect(livekitUrl, token)

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
      return
    }

    // Local Mic Test mode when LiveKit URL is unconfigured
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(selectedMicId ? { deviceId: { exact: selectedMicId } } : {}),
        },
      })

      localStreamRef.current = stream
      startMicAnalyzer(stream)

      setIsLocalTest(true)
      setIsConnected(true)
      setIsMuted(false)
      setActiveSpeakers([{ id: 'local', name: playerName, isSpeaking: true, isMuted: false }])
    } catch (err) {
      disconnect()
      setError(err instanceof Error ? err.message : 'Microphone access denied.')
    } finally {
      setIsConnecting(false)
    }
  }, [lobbyCode, playerName, isConfigured, livekitUrl, selectedMicId, startMicAnalyzer, disconnect])

  // Mute / Unmute
  const toggleMute = useCallback(async () => {
    const nextMute = !isMuted

    if (roomRef.current) {
      await roomRef.current.localParticipant.setMicrophoneEnabled(!nextMute)
    }

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !nextMute
      })
    }

    setIsMuted(nextMute)
  }, [isMuted])

  // Deafen / Undeafen
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
    isLocalTest,
    isMuted,
    isDeafened,
    isConfigured,
    micLevel,
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
