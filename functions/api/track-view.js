// Cloudflare Pages Function: POST /api/track-view
//
// Fire-and-forget page view logging for the wedding-dashboard app
// (separate repo) to read. Never blocks or errors out the page that
// calls it — a tracking failure should never be visible to a guest.
//
// Requires these Cloudflare Pages environment variables/secrets
// (Project > Settings > Environment variables), never exposed to the
// browser:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { jsonResponse, supabaseFetch } from "../_lib/supabase.js";

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(500, { ok: false, error: "server_not_configured" });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const path = (payload.path || "/").slice(0, 200);

  try {
    await supabaseFetch(env, "page_views", {
      method: "POST",
      body: JSON.stringify([{ path }]),
    });
    return jsonResponse(200, { ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { ok: false, error: "server_error" });
  }
}
