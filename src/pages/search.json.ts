import type { APIRoute } from 'astro';
import { allEntries } from '../lib/entries';

// Small static index for the home search box. Titles, aliases and summaries only.
// ponytail: fine up to a few thousand entries (~100 bytes each); switch to Pagefind past that.
export const GET: APIRoute = async () => {
  const index = (await allEntries()).map((e) => ({
    i: e.id,
    t: e.data.title,
    a: e.data.aliases,
    s: e.data.summary,
  }));
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
