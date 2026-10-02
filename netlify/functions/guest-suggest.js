// Netlify Function: GET /.netlify/functions/guest-suggest?q=<partial name>
//
// Powers live name suggestions on the RSVP form as a guest types, so
// they can find the exact spelling the couple has on file for them.
// This is a convenience, not a gate -- the RSVP function itself never
// rejects a name that isn't in this list.
//
// Requires the same SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars
// as netlify/functions/rsvp.js. Only returns names (never email or
// party size), since this endpoint has no invite-code check.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { ok: false, error: "method_not_allowed" });
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return jsonResponse(500, { ok: false, error: "server_not_configured" });
  }

  const query = (event.queryStringParameters && event.queryStringParameters.q) || "";
  const term = query.trim();

  if (term.length < 2) {
    return jsonResponse(200, { names: [] });
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/guests?full_name=ilike.*${encodeURIComponent(term)}*&select=full_name&limit=8&order=full_name.asc`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
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
};
