# Wedding Site

This is my wedding website — Denis Kalala & Clèda Mputu.

The site opens with a Greenvelope-style envelope animation (click or tap to
break the seal and reveal the invitation), then leads into the homepage with
the couple's details, a countdown, a photo gallery, FAQ, and an RSVP form.

## Structure

```
wedding-site/
├── index.html              # All markup, no inline styles or scripts
├── css/
│   ├── base.css            # Variables, reset, typography, utilities
│   ├── layout.css          # Nav, hero, sections, footer, responsive
│   └── components.css      # Envelope, countdown, gallery, FAQ, RSVP
├── js/
│   ├── config.js           # ← Your wedding details live here
│   ├── envelope.js
│   ├── countdown.js
│   ├── gallery.js
│   ├── faq.js
│   └── rsvp.js
├── assets/images/
├── netlify.toml
├── .gitignore
└── README.md
```

## Set your details

Everything specific to the wedding — names, date, time, location, venue,
RSVP deadline — lives in `js/config.js`. Edit that file and the hero,
details section, countdown, and envelope card all update automatically:

```js
date: '2027-06-12T16:00:00',
location: 'Cincinnati, Ohio',
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

## RSVP form

The RSVP form is wired for **Netlify Forms** out of the box — once
deployed on Netlify, submissions just work (AJAX, so guests stay on the
page), with a spam honeypot field. Hosting somewhere else? `js/rsvp.js`
has a two-line switch near the top to point at Formspree instead.

## Deploying

### GitHub Pages

This repo includes `.github/workflows/deploy-pages.yml`, which deploys the site
to GitHub Pages on every push to `main`.

1. Push this repo to GitHub.
2. In GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` (or run the workflow manually from the Actions tab).

Once complete, your site will be live at:
`https://<your-username>.github.io/wedding-site/`

> Note: GitHub Pages does not support Netlify Forms. If you stay on GitHub
> Pages, switch `js/rsvp.js` to Formspree mode.

### Netlify (optional)

If you prefer Netlify, keep using `netlify.toml`:

1. Push this repo to GitHub.
2. Create a new site on Netlify from the repo.
3. Leave the build command empty and publish directory as `.`.
4. Netlify will automatically pick up the RSVP form.

## Accessibility notes

- The envelope intro respects `prefers-reduced-motion`.
- Keyboard support: `Enter`/`Space` opens the envelope and proceeds,
  `Esc` skips straight to the homepage.
- A "Skip" link in the top corner is always available for repeat
  visitors.
