import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'memes'>;

export const KIND_LABEL: Record<Entry['data']['kind'], string> = {
  meme: 'Meme',
  slang: 'Slang',
  quote: 'Linya',
};

const byTitle = (a: Entry, b: Entry) =>
  a.data.title.localeCompare(b.data.title, 'en', { sensitivity: 'base' });

export async function allEntries(): Promise<Entry[]> {
  return (await getCollection('memes')).sort(byTitle);
}

// First character bucket for the A-Z index; digits and symbols go under "#".
export function letterOf(title: string): string {
  const c = title
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9]/g, '')
    .charAt(0)
    .toUpperCase();
  return c >= 'A' && c <= 'Z' ? c : '#';
}

export function tagCounts(entries: Entry[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const e of entries) for (const t of e.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

// Entries sharing the most tags with `entry`, excluding itself.
export function related(entry: Entry, entries: Entry[], n = 6): Entry[] {
  const tags = new Set(entry.data.tags);
  return entries
    .filter((e) => e.id !== entry.id)
    .map((e) => ({ e, score: e.data.tags.filter((t) => tags.has(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || byTitle(a.e, b.e))
    .slice(0, n)
    .map((x) => x.e);
}

// Stable "random" pick that changes once per build day, so the home page rotates
// without client JS and without reshuffling on every request.
export function dailyPick(entries: Entry[], n: number, seed = new Date().toISOString().slice(0, 10)): Entry[] {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return [...entries]
    .map((e, i) => ({ e, k: (Math.imul(h ^ (i + 1), 2654435761) >>> 0) % 100003 }))
    .sort((a, b) => a.k - b.k)
    .slice(0, n)
    .map((x) => x.e);
}
