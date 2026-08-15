import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { AccessToken } from 'https://esm.sh/livekit-server-sdk@2.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('LIVEKIT_API_KEY')
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET')

    if (!apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: 'LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const room = url.searchParams.get('room') || 'default-room'
    const identity = url.searchParams.get('identity') || `user-${Math.floor(Math.random() * 10000)}`

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: identity,
      ttl: '1h',
    })

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
    })

    const token = await at.toJwt()

    return new Response(JSON.stringify({ token, room, identity }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Token generation failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
