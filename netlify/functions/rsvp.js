// Netlify Function: POST /.netlify/functions/rsvp
//
// There is no invite code or guest-list gate — anyone with the link
// can RSVP under any name. (The guest list still powers live name
// suggestions as people type, see netlify/functions/guest-suggest.js.)
// The only spam defense is the honeypot field below.
//
// Every attending person gets their own row in `rsvps` (so a party of
// three shows up as three rows sharing the same party_key and
// submitted_name) rather than a single row with a headcount column.
// Resubmitting under the same name replaces that party's previous
// rows, so guests can change their mind without creating duplicates.
//
// Requires these Netlify environment variables (Site settings ->
// Environment variables), never exposed to the browser:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
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

async function assignTable(partySize) {
  const result = await supabaseFetch("rpc/assign_table", {
    method: "POST",
    body: JSON.stringify({ party_size: partySize }),
  });
  return result; // int or null
}

async function releaseTable(tableNumber, seats) {
  if (!tableNumber || !seats) return;
  await supabaseFetch("rpc/release_table", {
    method: "POST",
    body: JSON.stringify({ t_number: tableNumber, seats }),
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, error: "method_not_allowed" });
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return jsonResponse(500, { ok: false, error: "server_not_configured" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { ok: false, error: "invalid_json" });
  }

  const name = (payload.name || "").trim();
  const email = (payload.email || "").trim().toLowerCase();
  const attending = payload.attending === "yes" || payload.attending === true;
  const message = (payload.message || "").trim();
  const guestCount = Math.max(1, parseInt(payload.guests, 10) || 1);

  // Honeypot: silently accept-and-drop bot submissions.
  if (payload.botField) {
    return jsonResponse(200, { ok: true, dropped: true });
  }

  if (!name) {
    return jsonResponse(400, { ok: false, error: "missing_fields" });
  }

  // Identifies this party across submissions, so resubmitting under the
  // same name updates their response instead of creating duplicates.
  const partyKey = name.toLowerCase();

  try {
    const existingRows = await supabaseFetch(
      `rsvps?party_key=eq.${encodeURIComponent(partyKey)}&select=*`
    );
    const previousCount = existingRows ? existingRows.length : 0;
    const previousTable = existingRows && existingRows[0] ? existingRows[0].table_number : null;

    let tableNumber = null;
    let tableWarning = null;

    if (attending) {
      const sameAsBefore = previousTable && previousCount === guestCount;
      if (sameAsBefore) {
        tableNumber = previousTable;
      } else {
        if (previousTable) {
          await releaseTable(previousTable, previousCount);
        }
        tableNumber = await assignTable(guestCount);
        if (!tableNumber) {
          tableWarning = "no_table_capacity";
        }
      }
    } else if (previousTable) {
      await releaseTable(previousTable, previousCount);
    }

    if (previousCount > 0) {
      await supabaseFetch(`rsvps?party_key=eq.${encodeURIComponent(partyKey)}`, {
        method: "DELETE",
      });
    }

    const responded_at = new Date().toISOString();
    const rows = attending
      ? Array.from({ length: guestCount }, () => ({
          party_key: partyKey,
          submitted_name: name,
          submitted_email: email || null,
          attending: true,
          table_number: tableNumber,
          message,
          responded_at,
        }))
      : [
          {
            party_key: partyKey,
            submitted_name: name,
            submitted_email: email || null,
            attending: false,
            table_number: null,
            message,
            responded_at,
          },
        ];

    await supabaseFetch("rsvps", { method: "POST", body: JSON.stringify(rows) });

    return jsonResponse(200, {
      ok: true,
      attending,
      guestCount,
      tableNumber,
      tableWarning,
      submittedName: name,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { ok: false, error: "server_error" });
  }
};
