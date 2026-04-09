/**
 * Optional API key check. When MASTER_API_KEY is set, requests must send header x-master-api-key.
 * Used for webhooks (Sentry, generic) and optionally for /api/jarvis in production.
 */
export function requireMasterApiKey(req: Request): Response | null {
  const masterKey = process.env.MASTER_API_KEY?.trim();
  if (!masterKey) return null;
  const headerKey = req.headers.get('x-master-api-key');
  if (headerKey !== masterKey) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized', message: 'Invalid or missing x-master-api-key' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return null;
}
