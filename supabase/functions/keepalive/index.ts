import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// This is a server-to-server health/keep-alive endpoint (hit by a scheduled job via curl),
// not a browser API. It therefore advertises NO cross-origin access — dropping the former
// `Access-Control-Allow-Origin: *` removes the only surface a browser could abuse it from
// (audit finding L1). When KEEPALIVE_SECRET is configured the shared-secret header is also
// required; it is intentionally optional so the endpoint still works before the secret is set.
const baseHeaders = {
  'Content-Type': 'application/json',
}

serve((req) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: baseHeaders,
    })
  }

  const expectedSecret = Deno.env.get('KEEPALIVE_SECRET')
  if (expectedSecret) {
    const providedSecret = req.headers.get('x-keepalive-secret')
    if (providedSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: baseHeaders,
      })
    }
  }

  return new Response(JSON.stringify({ ok: true, timestamp: new Date().toISOString() }), {
    headers: baseHeaders,
  })
})