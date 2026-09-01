# Fort Worth House Run

Interactive map + check-off list for 14 house showings across north Fort Worth,
Keller and Haslet over Labor Day weekend 2026.

- **Map** — OpenStreetMap road geometry (I-35W, US-287, TX-170, FM 156, Golden
  Triangle, Heritage Trace) rendered as inline SVG. Pan, wheel zoom, fit-to-pins,
  scale bar. No tile server, no API key, no runtime dependencies.
- **Three day routes** — pins colored by day and joined in the visiting order from
  the agent's email: Saturday east of I-35W, Sunday northwest, Monday southwest.
- **Check off as you go** — each house takes a visited tick, a Yes / Maybe / No
  verdict and free-text notes. State lives in `localStorage` on the device that
  entered it; nothing is sent anywhere. "Copy notes" exports the lot as plain text.
- **Google Maps hand-off** — every house and restaurant links out to Maps, and each
  day has a single multi-stop driving route link.
- **Food and detours** — nearby restaurants with rating, review count and the
  platform each figure came from, plus non-house stops worth the drive.

## Run it

Static single file. Anything that serves a directory will do:

```bash
npx serve public          # or: python3 -m http.server -d public 8000
```

## Deploy

Zero-config on Vercel — `vercel.json` points the build at `public/` and there is no
build step. Import the repo in the Vercel dashboard, or from the project root:

```bash
vercel        # preview
vercel --prod # production
```

## Editing the data

Houses, restaurants and stops are JSON literals at the top of the inline `<script>`
in `public/index.html` (`HOUSES`, `FOOD`, `STOPS`). Coordinates are decimal degrees.
Road geometry is a delta-encoded array in the same script, generated from an
Overpass API query over the bounding box `32.86,-97.42,33.00,-97.20`.

### Known data gap

House #2, Colonial Trace, could not be geocoded — the email says
"Colonial Trace Ln, Fort Worth 76244" while the Realtor listing says
"Colonial Trace Rd, Keller 76244". Its pin is a placeholder between #1 and #3 and
is flagged in the UI. Fix the coordinates once the real address is confirmed.

Restaurant ratings were captured the week of Sep 1, 2026 and differ by platform;
each row names its source. Treat them as a starting point, not live data.

Map data © OpenStreetMap contributors, ODbL.
