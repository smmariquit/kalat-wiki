// Checks every source URL in the entries. Run locally (network): npm run check:links
// 404/410 and DNS failures are real problems. 401/403/429 usually mean the site
// blocks bots, so they're listed separately for a human to open.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/memes';
const urls = new Map(); // url -> [files]
for (const f of readdirSync(DIR).filter((f) => f.endsWith('.md'))) {
  for (const [, url] of readFileSync(join(DIR, f), 'utf8').matchAll(/^\s+url:\s*"?(\S+?)"?\s*$/gm)) {
    urls.set(url, [...(urls.get(url) ?? []), f]);
  }
}

async function check(url) {
  const opts = {
    redirect: 'follow',
    signal: AbortSignal.timeout(30000),
    headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' },
  };
  try {
    let res = await fetch(url, { ...opts, method: 'HEAD' });
    if (res.status === 405 || res.status === 403) res = await fetch(url, opts);
    return res.status;
  } catch (e) {
    return e.cause?.code ?? e.name;
  }
}

const list = [...urls.keys()];
const results = [];
for (let i = 0; i < list.length; i += 8) {
  const batch = list.slice(i, i + 8);
  results.push(...(await Promise.all(batch.map(async (u) => [u, await check(u)]))));
}

const broken = results.filter(([, s]) => typeof s !== 'number' || s === 404 || s === 410 || s >= 500);
const blocked = results.filter(([, s]) => [401, 403, 429].includes(s));
for (const [u, s] of broken) console.log(`BROKEN ${s} ${u} (${urls.get(u).join(', ')})`);
for (const [u, s] of blocked) console.log(`blocked ${s} ${u}`);
console.log(`${list.length} urls, ${broken.length} broken, ${blocked.length} blocked`);
process.exit(broken.length ? 1 : 0);
