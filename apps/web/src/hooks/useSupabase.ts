import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Subscribes to a Supabase Realtime channel and returns the channel ref.
 * Automatically cleans up on unmount.
 */
export function useSupabase(channelName: string, onEvent: (payload: unknown) => void) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: '*' }, (payload) => onEvent(payload))
      .subscribe()

    channelRef.current = channel

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [channelName, onEvent])

  return channelRef
}
