/**
 * Shared house photos.
 *
 * Photos live in a Vercel Blob store so every phone and laptop that opens the site
 * sees the same set. The store is optional: without BLOB_READ_WRITE_TOKEN the
 * endpoints report that sharing is off and the page falls back to browser storage.
 *
 * To turn sharing on: Vercel dashboard → Storage → Create Blob store → connect it to
 * this project. Vercel injects the token, and the next deploy picks it up.
 */
import { put, list, del } from '@vercel/blob';

const PREFIX = 'houses/';
const MAX_BYTES = 4 * 1024 * 1024;

const enabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function offline(res) {
  return res.status(200).json({ enabled: false, photos: {} });
}

/** houses/<n>/<id>.jpg → house number */
function houseOf(pathname) {
  const m = pathname.match(/^houses\/(\d+)\//);
  return m ? m[1] : null;
}

async function readAll() {
  const photos = {};
  let cursor;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 500 });
    for (const blob of page.blobs) {
      const n = houseOf(blob.pathname);
      if (!n) continue;
      (photos[n] ||= []).push({ url: blob.url, at: blob.uploadedAt });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  for (const n of Object.keys(photos)) {
    photos[n].sort((a, b) => new Date(a.at) - new Date(b.at));
    photos[n] = photos[n].map((p) => p.url);
  }
  return photos;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new Error('too-large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (!enabled()) return offline(res);

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ enabled: true, photos: await readAll() });
    }

    if (req.method === 'POST') {
      const house = String(req.query.house || '').replace(/\D/g, '');
      if (!house || +house < 1 || +house > 14) {
        return res.status(400).json({ error: 'Which house? Pass ?house=1 through 14.' });
      }
      const body = await readBody(req);
      if (!body.length) return res.status(400).json({ error: 'No image data received.' });

      const name = `${PREFIX}${house}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const blob = await put(name, body, {
        access: 'public',
        contentType: req.headers['content-type'] || 'image/jpeg',
        addRandomSuffix: false,
      });
      return res.status(200).json({ enabled: true, url: blob.url, house });
    }

    if (req.method === 'DELETE') {
      const url = req.query.url;
      if (!url) return res.status(400).json({ error: 'Pass ?url= of the photo to remove.' });
      await del(url);
      return res.status(200).json({ enabled: true, deleted: url });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: `${req.method} is not supported here.` });
  } catch (err) {
    const tooLarge = err && err.message === 'too-large';
    return res.status(tooLarge ? 413 : 500).json({
      error: tooLarge ? 'That photo is over 4 MB — it is resized before upload, so this usually means the file never shrank.'
                      : 'The photo store could not be reached.',
    });
  }
}
