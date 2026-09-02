/* Optional keys. The page works fully without this file.
 *
 * mapsKey — a Google Maps Platform key with the "Street View Static API" enabled.
 *   With it, every house card and hover preview shows a real Street View photo of
 *   that house instead of the drawn block map. 14 houses = 14 image requests, which
 *   sits inside Google's free monthly allowance, but Google still requires a billing
 *   profile on the account before it will issue a key.
 *
 * Satellite and Terrain need no key at all — they use Esri's free public tiles.
 * Live traffic is the one thing no free provider offers; it needs a paid key from
 * Google, TomTom, HERE or Mapbox.
 */
window.HOUSE_RUN_CONFIG = { mapsKey: "" };
