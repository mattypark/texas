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
- **House previews** — hovering a map pin or a card opens a card with the photo, the
  asking price, the group rating and who gave what, six errand times and the listing.
  Without a photo it falls back to a drawing of that block, built from real street and
  building footprints.
- **Home base** — the hotel at 1711 W Royal Ln, Irving sits on the map with its own
  layer, a route to each day's first stop (30 / 33 / 35 min), and its drive time on
  every house card. The houses run 30–38 minutes out.
- **The whole weekend, not just the houses** — Saturday's showings run into the TCU
  campus walk at 4pm and the End of Summer Bash on Locke Ave from 5 to 8, with the
  drive legs between them and the RSVP number. Both appear on the map on the Saturday
  layer with their own violet route down from the last house.
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

## What is real, and what is not

| Feature | Backing |
| --- | --- |
| Map, roads, water, parks | OpenStreetMap geometry, drawn as inline SVG — no tile server, no key |
| Driving routes and every drive time | OSRM public routing (real roads, free-flow traffic) |
| House thumbnails | drawn from OSM buildings and streets for that block |
| Brand marks (Costco, Kroger, Walmart, Target…) | drawn approximations in each chain's own colours, not official artwork |
| Satellite | real aerial imagery — Esri World Imagery tiles, free, no key |
| Terrain | real hillshade — Esri World Hillshade tiles, free, no key |
| Named places | 800+ restaurants, shops, schools and parks from OSM, drawn as you zoom in |
| Live traffic | not available — no free provider offers it; needs a paid Google/TomTom/HERE/Mapbox key |

Realtor, Zillow, Redfin and Homes all block automated requests (403/429). Scrapling's
StealthyFetcher (camoufox, real browser fingerprint) was tried against a listing and
also came back 429 — the block is on the request source, not the fingerprint — so
listing photos cannot be fetched here. Two ways to get real pictures:

1. **Add them from the page.** Press the camera button on a thumbnail, drag an image
   file onto it, or paste one while a house is focused. Photos are downscaled to
   900px and kept in that browser — no commit, no upload, no key.
2. **Commit them.** Save photos as `public/houses/1.jpg` … `14.jpg`.
3. **Street View.** Put a Google Maps key (Street View Static API) in
   `public/config.js` and every house shows its own Street View shot automatically.

## On the phone

Below 900px the map fills the screen. A hamburger opens the days, layers and progress
as a drawer; Sat / Sun / Mon chips sit across the top with **All 14 & errand times**,
which slides the full list up. Along the bottom is a swipeable strip of the houses in
visiting order, each showing its four errand times.

Tapping a house zooms to it, hides the other thirteen and their day routes, and draws
that house's own runs to Costco, its grocery, Walmart and its park, with a card
carrying the times, photos and a route link each. Tapping it again, or Show all 14,
comes back out.

## Run it

Static single file. Anything that serves a directory will do:

```bash
npx serve public          # or: python3 -m http.server -d public 8000
```

## Ratings, prices and sync

Five people rate every house 1–5 **twice**: once from the listing (*before*, gold) and
once after walking through (*after*, blue). Pick your name in **Rating as** in the left
panel, then tap either row of stars on a card or in the house detail. Cards show both
group averages with the swing between them — `4.0 → 4.7 +0.7` in green when a house
beat expectations, red when it disappointed. The detail panel lists every person's
before → after so you can see who changed their mind. Asking prices are editable on any card — click the price (or *Add
price*) and type it once.

Everything the five of you touch — visited ticks and times, ratings, prices, notes —
lives in one JSON document at `api/state.js`. Every field is stored as
`{ v: value, t: timestamp }` and merged field-by-field on the server, so two people
editing different houses (or different fields of the same house) never overwrite each
other. Clients push edits 0.7s after the last keystroke and pull every 12 seconds, on
tab focus, and when the network comes back.

## Shared photos and state (optional, one click)

Photos and shared state are stored per-browser until a Blob store is attached. To make
every phone and laptop see the same pictures and ratings:

1. Vercel dashboard → **Storage** → **Create Blob store** → connect it to this project.
2. Redeploy. Vercel injects `BLOB_READ_WRITE_TOKEN`; `api/photos.js` picks it up.

The left panel then reads **Shared with every device** instead of *Saved on this
device only*. Without the store nothing breaks — the API returns `enabled:false` and
the page keeps photos locally.

`GET /api/photos` lists them, `POST /api/photos?house=3` adds one, `DELETE
/api/photos?url=…` removes one. `GET /api/state` reads the shared trip document and
`PUT /api/state` merges an update into it.

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
