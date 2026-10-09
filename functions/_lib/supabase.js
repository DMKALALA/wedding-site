// Shared Supabase REST helper for Cloudflare Pages Functions.
// A file/directory under functions/ starting with "_" is never treated
// as a route, so this is safe to import from functions/api/*.js.

export function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function supabaseFetch(env, path, options = {}) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Supabase ${path} failed: ${res.status} ${text}`);
  }
  // PostgREST returns an empty body (not just on 204) for inserts/updates
  // unless `Prefer: return=representation` is set, so guard against that
  // rather than assuming a non-204 status always has a JSON body.
  return text ? JSON.parse(text) : null;
}
