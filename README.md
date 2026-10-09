# Wedding Site

This is my wedding website — Denis Kalala & Clèda Mputu.

**Live site:** https://denisandcledaweddingday.pages.dev

The site opens with a Greenvelope-style envelope animation (click or tap to
break the seal and reveal the invitation), then leads into the homepage with
the couple's details, a countdown, a photo gallery, FAQ, and an RSVP form.

## Structure

```
wedding-site/
├── index.html              # Homepage: hero, details, gallery teaser, FAQ, RSVP
├── gallery-full.html        # All photos from the shoot
├── bridal-party.html        # Bride/groom, groomsmen, bridesmaids, planners
├── css/
│   ├── base.css            # Variables, reset, typography, utilities
│   ├── layout.css          # Nav, hero, sections, footer, responsive
│   └── components.css      # Envelope, countdown, gallery, FAQ, RSVP, party cards
├── js/
│   ├── config.js           # ← Your wedding details live here
│   ├── nav.js               # Mobile hamburger menu
│   ├── envelope.js
│   ├── countdown.js
│   ├── lightbox.js           # Shared photo lightbox
│   ├── gallery-grid.js       # Shared gallery grid builder
│   ├── gallery.js            # Homepage gallery teaser
│   ├── full-gallery.js       # gallery-full.html's full grid
│   ├── bridal-party.js       # ← Bridal party roster lives here
│   ├── faq.js
│   └── rsvp.js
├── assets/images/
├── functions/
│   ├── _lib/supabase.js     # Shared Supabase REST helper
│   └── api/
│       ├── rsvp.js          # Records RSVPs + table assignment (see below)
│       └── guest-suggest.js # Live name suggestions for the RSVP form
├── supabase/
│   ├── schema.sql            # Run once in Supabase to set up the RSVP database
│   └── migration_open_rsvp.sql # Updates an existing project to the current schema
├── guests-template.csv       # Fill in and import as your guest list
├── .gitignore
└── README.md
```

## Set your details

Everything specific to the wedding — names, date, time, location, venue,
RSVP deadline — lives in `js/config.js`. Edit that file and the hero,
details section, countdown, and envelope card all update automatically:

```js
date: '2026-11-14T14:00:00',
location: 'Louisville, Kentucky',
```

## Add photos

Drop image files into `assets/images/`, then list their filenames in the
`photos` array near the top of `js/gallery.js`:

```js
const photos = ["engagement-1.jpg", "engagement-2.jpg"];
```

## Run locally

Opening `index.html` directly in a browser works fine for a quick look.
If you add features that need a server (or switch to ES modules later),
serve the folder instead:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## RSVP form + guest list backend

The RSVP form suggests names as guests type (from the couple's real
guest list), tracks every response, and auto-assigns each attending
party a reception table — all via two Cloudflare Pages Functions
(`functions/api/rsvp.js` and `functions/api/guest-suggest.js`) backed
by a free Supabase Postgres database.

**One-time setup, before you go live:**

1. **Create a Supabase project.** Go to [supabase.com](https://supabase.com),
   sign up free, and create a new project. Save the database password
   somewhere safe.
2. **Run the schema.** In your Supabase project, open *SQL Editor >
   New query*, paste the contents of `supabase/schema.sql`, and run it.
   This creates the `guests`, `rsvps`, and `reception_tables` tables
   plus the table-assignment logic. It seeds 20 tables x 10 seats = 200
   capacity — edit the seed values at the bottom of the file first if
   your actual floor plan differs (e.g. 25 tables x 8 seats). (If you
   already ran an earlier version of this file against a live project,
   run `supabase/migration_open_rsvp.sql` instead — it updates the old
   schema in place without losing data.)
3. **Import your guest list.** Fill in `guests-template.csv` with your
   guests — one row per invite, with `full_name`, `email` (optional),
   and `party_size` (informational only now). This list only powers
   the live name suggestions on the form as a guest types; it's never
   a hard gate (see below), so near-enough spelling is fine. In
   Supabase, go to *Table Editor > guests > Insert > Import data from
   CSV* and upload it.
4. **Get your API credentials.** In Supabase, go to *Project Settings >
   API Keys > Legacy anon, service_role API keys*. You'll need the
   **Project URL** and the **service_role** secret key (not the `anon`
   key — the service role key is what lets the server-side functions
   read the guest list and write RSVPs; it must never be exposed in
   frontend code, which is why this lives in Pages Functions instead
   of `js/rsvp.js`).
5. **Set Cloudflare Pages environment variables.** In your Cloudflare
   dashboard: *Workers & Pages > your project > Settings > Variables
   and secrets*, add:
   - `SUPABASE_URL` — your Project URL (type: Text)
   - `SUPABASE_SERVICE_ROLE_KEY` — your service_role key (type: Secret)
6. **Redeploy** so the functions pick up the new environment variables.

**How it verifies guests:** it doesn't — there's no invite code or
password, so anyone with the link can RSVP under any name (this was a
deliberate choice after guests had trouble with an earlier invite-code
step; the honeypot field is the only spam defense). As they type, the
form calls `guest-suggest.js`, which looks up names in `guests` that
contain what they've typed so far and offers them as suggestions, so
guests can find the exact spelling the couple has on file — but
picking a suggestion is optional. Email is optional too, and never
used for matching — just recorded if they give it, for your own
contact records.

**Tracking responses:** every response lands in the `rsvps` table in
Supabase (Table Editor, or export to CSV anytime via *Export data* for
your own records). Each row is one **attendee**, not one party — a
family of three attending RSVPs as three rows sharing the same
`party_key` and `submitted_name`, so the exported CSV is already a
seating headcount rather than something you have to expand yourself.
Resubmitting under the same name replaces that party's previous rows
rather than duplicating them.

**Local testing:** install the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
(`npm install -g wrangler`), then run `wrangler pages dev .` from the
project folder — it serves the static site and the functions together,
reading `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` from a local `.dev.vars`
file (gitignored) or passed with `--binding`.

## Deploying

The site needs Cloudflare Pages (or another host with serverless
functions) for the RSVP backend above; a plain static host would only
work for the rest of the site.

1. Push this repo to GitHub.
2. In the Cloudflare dashboard, go to *Workers & Pages > Create
   application > Pages > Import an existing Git repository*, connect
   GitHub (scoped to just this repo), and select it.
3. Leave the build command empty and the build output directory as
   the repo root (`/`). Cloudflare auto-detects the Pages Functions in
   `functions/api/`.
4. Complete the Supabase setup above and add the environment variables
   before guests start RSVPing.

## Accessibility notes

- The envelope intro respects `prefers-reduced-motion`.
- Keyboard support: `Enter`/`Space` opens the envelope and proceeds,
  `Esc` skips straight to the homepage.
- A "Skip" link in the top corner is always available for repeat
  visitors.
