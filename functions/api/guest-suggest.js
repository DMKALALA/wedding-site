// Cloudflare Pages Function: GET /api/guest-suggest?q=<partial name>
//
// Powers live name suggestions on the RSVP form as a guest types, so
// they can find the exact spelling the couple has on file for them.
// This is a convenience, not a gate -- the RSVP function itself never
// rejects a name that isn't in this list.
//
// Requires the same SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars
// as functions/api/rsvp.js. Only returns names (never email or party
// size), since this endpoint has no invite-code check.

import { jsonResponse } from "../_lib/supabase.js";

export async function onRequestGet({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(500, { ok: false, error: "server_not_configured" });
  }

  const url = new URL(request.url);
  const term = (url.searchParams.get("q") || "").trim();

  if (term.length < 2) {
    return jsonResponse(200, { names: [] });
  }

  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/guests?full_name=ilike.*${encodeURIComponent(term)}*&select=full_name&limit=8&order=full_name.asc`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (!res.ok) throw new Error(`Supabase guests lookup failed: ${res.status}`);
    const rows = await res.json();
    const names = [...new Set(rows.map((row) => row.full_name))];
    return jsonResponse(200, { names });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { ok: false, error: "server_error" });
  }
}
