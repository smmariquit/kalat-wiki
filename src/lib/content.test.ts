// Style lint for entries. The schema checks structure at build time; this checks
// the writing rules in STYLE.md that a schema can't express.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const DIR = join(import.meta.dirname, '../content/memes');
const files = readdirSync(DIR).filter((f) => f.endsWith('.md'));

const BANNED = [
  // hype
  /\biconic\b/i,
  /\blegendary\b/i,
  /viral sensation/i,
  /took the internet by storm/i,
  /\bunforgettable\b/i,
  // literary Tagalog
  /\bkumpirmado\b/i,
  /\bnagmula\b/i,
  /\btanyag\b/i,
  /\bpinagmulan\b/i,
  /\bsapagkat\b/i,
  /\bupang\b/i,
];

function split(file: string) {
  const raw = readFileSync(join(DIR, file), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(m, `${file}: missing frontmatter`);
  return { front: m[1], body: m[2] };
}

test('entries exist', () => {
  assert.ok(files.length > 0);
});

test('no em dashes or interpuncts anywhere', () => {
  const bad = files.filter((f) => /[—·]/.test(readFileSync(join(DIR, f), 'utf8')));
  assert.deepEqual(bad, []);
});

test('no banned words in entry text', () => {
  const bad: string[] = [];
  for (const f of files) {
    const { front, body: raw } = split(f);
    // Quoted example posts show how people really talk, so they're exempt.
    const body = raw.replace(/^>.*$/gm, '');
    const summary = front.match(/^summary:(.*)$/m)?.[1] ?? '';
    for (const re of BANNED) if (re.test(body) || re.test(summary)) bad.push(`${f}: ${re}`);
  }
  assert.deepEqual(bad, []);
});

test('body has the sections, in order', () => {
  // "Paano kumalat" is optional; everything else is required.
  const ORDER = ["Ano 'to", 'Saan galing', 'Paano kumalat', 'Halimbawa'];
  const bad = files.filter((f) => {
    const heads = [...split(f).body.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
    const expected = ORDER.filter((h) => h !== 'Paano kumalat' || heads.includes(h));
    return heads.join('|') !== expected.join('|');
  });
  assert.deepEqual(bad, []);
});

test('no bold lead-ins in body', () => {
  const bad = files.filter((f) => /\*\*[^*]+\*\*/.test(split(f).body));
  assert.deepEqual(bad, []);
});

test('example lines are separate quote paragraphs', () => {
  // "> a\n> b" renders as one line; examples need a blank ">" between them.
  const bad = files.filter((f) => /^> ?\S.*\n> ?\S/m.test(split(f).body));
  assert.deepEqual(bad, []);
});

test('tags are url-safe slugs', () => {
  const bad: string[] = [];
  for (const f of files) {
    const tags = split(f).front.match(/^tags:\s*\[(.*)\]\s*$/m)?.[1] ?? '';
    for (const t of tags.split(',').map((x) => x.trim()).filter(Boolean)) {
      if (!/^[a-z0-9-]+$/.test(t)) bad.push(`${f}: ${t}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('titles are unique', () => {
  const seen = new Map<string, string>();
  const dupes: string[] = [];
  for (const f of files) {
    const t = split(f).front.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1]?.toLowerCase().trim();
    assert.ok(t, `${f}: no title`);
    if (seen.has(t)) dupes.push(`${f} = ${seen.get(t)}`);
    seen.set(t, f);
  }
  assert.deepEqual(dupes, []);
});
