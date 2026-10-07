import type { APIRoute } from 'astro';
import { allEntries, tagCounts } from '../lib/entries';
import { KINDS } from '../content.config';

export const GET: APIRoute = async ({ site }) => {
  const entries = await allEntries();
  const paths = [
    '/',
    '/a-z/',
    '/about/',
    '/submit/',
    '/contact/',
    '/privacy/',
    ...KINDS.map((k) => `/kind/${k}/`),
    ...tagCounts(entries).map(([t]) => `/tag/${t}/`),
    ...entries.map((e) => `/m/${e.id}/`),
  ];
  const lastmod = new Map(entries.map((e) => [`/m/${e.id}/`, e.data.updated.toISOString().slice(0, 10)]));
  const urls = paths
    .map((p) => {
      const mod = lastmod.get(p);
      return `<url><loc>${new URL(p, site)}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`;
    })
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
