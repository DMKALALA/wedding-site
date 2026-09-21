// Netlify Function: POST /.netlify/functions/rsvp
//
// Verifies the submitting guest against the `guests` table (by email),
// records their response in `rsvps`, and auto-assigns a reception table
// (via the assign_table() Postgres function) when they're attending.
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
  if (!tableNumber) return;
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
  const requestedGuests = Math.max(1, parseInt(payload.guests, 10) || 1);

  // Honeypot: silently accept-and-drop bot submissions.
  if (payload.botField) {
    return jsonResponse(200, { ok: true, dropped: true });
  }

  if (!name || !email) {
    return jsonResponse(400, { ok: false, error: "missing_fields" });
  }

  try {
    // 1. Verify against the invite list, by email.
    const guests = await supabaseFetch(
      `guests?email=eq.${encodeURIComponent(email)}&select=*`
    );
    const guest = guests && guests[0];

    if (!guest) {
      return jsonResponse(404, { ok: false, error: "not_found" });
    }

    const guestCount = Math.min(requestedGuests, guest.party_size);

    // 2. Look up any prior response from this guest (so re-submitting
    //    updates rather than duplicates, and table seats aren't double
    //    counted).
    const existingRows = await supabaseFetch(
      `rsvps?guest_id=eq.${guest.id}&select=*`
    );
    const existing = existingRows && existingRows[0];

    let tableNumber = null;
    let tableWarning = null;

    if (attending) {
      const sameAsBefore =
        existing &&
        existing.attending &&
        existing.table_number &&
        existing.guest_count === guestCount;

      if (sameAsBefore) {
        tableNumber = existing.table_number;
      } else {
        if (existing && existing.attending && existing.table_number) {
          await releaseTable(existing.table_number, existing.guest_count);
        }
        tableNumber = await assignTable(guestCount);
        if (!tableNumber) {
          tableWarning = "no_table_capacity";
        }
      }
    } else if (existing && existing.attending && existing.table_number) {
      // Was attending, now declining — free up their seats.
      await releaseTable(existing.table_number, existing.guest_count);
    }

    // 3. Upsert the RSVP record.
    await supabaseFetch("rsvps?on_conflict=guest_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        guest_id: guest.id,
        submitted_name: name,
        submitted_email: email,
        attending,
        guest_count: guestCount,
        message,
        table_number: tableNumber,
        responded_at: new Date().toISOString(),
      }),
    });

    return jsonResponse(200, {
      ok: true,
      attending,
      guestCount,
      tableNumber,
      tableWarning,
      inviteName: guest.full_name,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { ok: false, error: "server_error" });
  }
};
