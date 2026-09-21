# Wedding Site

This is my wedding website — Denis Kalala & Clèda Mputu.

**Live site:** https://heroic-mousse-e52254.netlify.app

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
├── netlify/functions/
│   └── rsvp.js              # Guest verification + table assignment (see below)
├── supabase/
│   └── schema.sql            # Run once in Supabase to set up the RSVP database
├── guests-template.csv       # Fill in and import as your guest list
├── netlify.toml
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

The RSVP form verifies each submission against a real guest list (200
invites), tracks every response, and auto-assigns each attending
guest/family a reception table — all via a Netlify Function
(`netlify/functions/rsvp.js`) backed by a free Supabase Postgres
database. This replaces the earlier Netlify Forms setup.

**One-time setup, before you go live:**

1. **Create a Supabase project.** Go to [supabase.com](https://supabase.com),
   sign up free, and create a new project. Save the database password
   somewhere safe.
2. **Run the schema.** In your Supabase project, open *SQL Editor >
   New query*, paste the contents of `supabase/schema.sql`, and run it.
   This creates the `guests`, `rsvps`, and `reception_tables` tables
   plus the table-assignment logic. It seeds 20 tables x 10 seats = 200
   capacity — edit the seed values at the bottom of the file first if
   your actual floor plan differs (e.g. 25 tables x 8 seats).
3. **Import your guest list.** Fill in `guests-template.csv` with your
   real 200 guests: one row per invite (a person or a whole family),
   with `full_name`, `email`, and `party_size` (how many people that
   invite covers). In Supabase, go to *Table Editor > guests > Insert >
   Import data from CSV* and upload it.
4. **Get your API credentials.** In Supabase, go to *Project Settings >
   API*. You'll need the **Project URL** and the **service_role**
   secret key (not the `anon` key — the service role key is what lets
   the server-side function verify guests and write RSVPs; it must
   never be exposed in frontend code, which is why this lives in a
   Netlify Function instead of `js/rsvp.js`).
5. **Set Netlify environment variables.** In your Netlify site
   dashboard: *Site configuration > Environment variables*, add:
   - `SUPABASE_URL` — your Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — your service_role key
6. **Redeploy** so the function picks up the new environment variables.

**How it verifies guests:** a submission is matched by **email**
against the `guests` table (case-insensitive). If no match is found,
the guest sees a friendly "we couldn't find your invitation" message
instead of the confirmation. Name matching is intentionally lenient
(whatever they type is just recorded) since real guests often type
their own name differently than however you listed the invite — email
is the reliable identifier here.

**Tracking responses:** every response lands in the `rsvps` table in
Supabase (Table Editor, or export to CSV anytime via *Export data* for
your own records) — name, email, attending yes/no, guest count,
message, and assigned table number.

**Local testing:** install the [Netlify CLI](https://docs.netlify.com/cli/get-started/)
(`npm install -g netlify-cli`), then run `netlify dev` from the project
folder — it serves the static site and the function together at
`http://localhost:8888`, reading `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`
from your Netlify site's environment variables (or a local `.env` file,
gitignored).

## Deploying

The site needs Netlify (or another host with serverless functions) for
the RSVP backend above; a plain static host would only work for the
rest of the site.

1. Push this repo to GitHub.
2. Create a new site on Netlify from the repo.
3. Leave the build command empty and the publish directory as `.`.
   Netlify auto-detects functions in `netlify/functions` from
   `netlify.toml`.
4. Complete the Supabase setup above and add the environment variables
   before guests start RSVPing.

## Accessibility notes

- The envelope intro respects `prefers-reduced-motion`.
- Keyboard support: `Enter`/`Space` opens the envelope and proceeds,
  `Esc` skips straight to the homepage.
- A "Skip" link in the top corner is always available for repeat
  visitors.
