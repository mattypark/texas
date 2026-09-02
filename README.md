# Fort Worth House Run

Interactive map + check-off list for 14 house showings across north Fort Worth,
Keller and Haslet over Labor Day weekend 2026.

- **Map** — a Google-Maps-style vector map drawn from OpenStreetMap geometry:
  road casings and fills, water, parks and green space, city labels. Pan, wheel
  zoom, fit-to-pins, scale bar. No tile server, no API key, no dependencies.
- **Icon markers** — houses carry a house marker with their visiting number as a
  badge, coloured by day; Costco, groceries, Walmart/Target, parks, pharmacies,
  restaurants and things to do each get their own marker.
- **Three-pane layout** — a collapsible left panel with full-row layer toggles, the
  map, and a collapsible route list on the right.
- **House previews** — each house shows a drawing of its own block (real streets and
  building footprints within 0.2 mi); hovering opens a larger preview with its
  errand times. Drop `public/houses/<n>.jpg` to use a real photo instead.
- **Three day routes** — pins colored by day and joined in the visiting order from
  the agent's email: Saturday east of I-35W, Sunday northwest, Monday southwest.
- **Check off as you go** — each house takes a visited tick, a Yes / Maybe / No
  verdict and free-text notes. State lives in `localStorage` on the device that
  entered it; nothing is sent anywhere. "Copy notes" exports the lot as plain text.
- **Google Maps hand-off** — every house and restaurant links out to Maps, and each
  day has a single multi-stop driving route link.
- **Food and detours** — nearby restaurants with rating, review count and the
  platform each figure came from, plus non-house stops worth the drive.

## Errand times

Every house carries real driving times to the stops the family actually uses, so a
house that looks fine on the map can be checked against the weekly Costco run:

| Stop | Source |
| --- | --- |
| Costco / Sam's Club | Overpass, brand-filtered |
| Grocery | Kroger, Tom Thumb, Albertsons, Aldi, Sprouts, H-E-B, WinCo, Whole Foods |
| Walmart / Target | Supercenter, Neighborhood Market, Target |
| Park | named `leisure=park` |
| Pharmacy | CVS, Walgreens, in-store counters |
| Urgent care | urgent care, ER, hospital |

Times come from the public OSRM demo server (`/table/v1/driving`), which routes over
real road geometry but assumes **free-flow traffic** — add a few minutes for a 5pm or
Saturday-morning run. Distances are road miles, not straight lines.

The comparison table under the map sorts on any column and carries a weighted
convenience score (Costco and grocery 30% each, big box 15%, park 10%, pharmacy 10%,
urgent care 5%; lower is better). Every house on the list uses the same Costco on
Presidio Vista Dr off I-35W, and the worst Costco run in the set is 13.9 minutes —
nothing here is anywhere near an hour.

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
Overpass API query over the bounding box `32.86,-97.42,33.00,-97.20`. Errand times
and amenity pins are the `ERR` and `AMEN` literals, built from Overpass plus an OSRM
distance-matrix call per category.

### Known data gap

House #2, Colonial Trace, could not be geocoded — the email says
"Colonial Trace Ln, Fort Worth 76244" while the Realtor listing says
"Colonial Trace Rd, Keller 76244". Its pin is a placeholder between #1 and #3 and
is flagged in the UI. Fix the coordinates once the real address is confirmed.

Restaurant ratings were captured the week of Sep 1, 2026 and differ by platform;
each row names its source. Treat them as a starting point, not live data.

Map data © OpenStreetMap contributors, ODbL.
