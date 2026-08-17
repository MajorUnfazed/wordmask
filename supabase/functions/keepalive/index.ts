import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-keepalive-secret',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const expectedSecret = Deno.env.get('KEEPALIVE_SECRET')
  if (expectedSecret) {
    const providedSecret = req.headers.get('x-keepalive-secret')
    if (providedSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response(JSON.stringify({ ok: true, timestamp: new Date().toISOString() }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})