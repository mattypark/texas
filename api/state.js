/**
 * Shared trip state: who has seen which house, everyone's rating, verdicts, notes.
 *
 * One JSON document in the same Vercel Blob store the photos use. Every field is
 * stored as { v: value, t: timestamp }, so two people editing different things at the
 * same time both keep their edit — the newer timestamp wins per field, not per
 * document. Without a Blob store the endpoint reports sharing off and the page keeps
 * its own copy in the browser.
 */
import { put, list } from '@vercel/blob';

const PATH = 'state/trip.json';
const enabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function readState() {
  const { blobs } = await list({ prefix: PATH, limit: 1 });
  if (!blobs.length) return { houses: {} };
  const res = await fetch(blobs[0].url, { cache: 'no-store' });
  if (!res.ok) return { houses: {} };
  try {
    return await res.json();
  } catch {
    return { houses: {} };
  }
}

async function writeState(state) {
  await put(PATH, JSON.stringify(state), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

/** newest timestamp wins, field by field */
function mergeField(mine, theirs) {
  if (!mine) return theirs;
  if (!theirs) return mine;
  return (theirs.t || 0) > (mine.t || 0) ? theirs : mine;
}

function mergeHouse(a = {}, b = {}) {
  const out = { ...a };
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (key === 'r') {
      const ratings = { ...(a.r || {}) };
      for (const person of Object.keys(b.r || {})) {
        ratings[person] = mergeField(ratings[person], b.r[person]);
      }
      out.r = ratings;
    } else {
      out[key] = mergeField(a[key], b[key]);
    }
  }
  return out;
}

function mergeState(a, b) {
  const houses = { ...(a.houses || {}) };
  for (const n of Object.keys(b.houses || {})) {
    houses[n] = mergeHouse(houses[n], b.houses[n]);
  }
  return { houses };
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (!enabled()) return res.status(200).json({ enabled: false, state: { houses: {} } });

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ enabled: true, state: await readState() });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const incoming = await readBody(req);
      if (!incoming || typeof incoming !== 'object') {
        return res.status(400).json({ error: 'Send the state document as JSON.' });
      }
      const merged = mergeState(await readState(), { houses: incoming.houses || {} });
      await writeState(merged);
      return res.status(200).json({ enabled: true, state: merged });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: `${req.method} is not supported here.` });
  } catch {
    return res.status(500).json({ error: 'The shared trip store could not be reached.' });
  }
}
