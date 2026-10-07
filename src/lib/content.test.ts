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

test('no em dashes anywhere', () => {
  const bad = files.filter((f) => readFileSync(join(DIR, f), 'utf8').includes('—'));
  assert.deepEqual(bad, []);
});

test('no banned words in entry text', () => {
  const bad: string[] = [];
  for (const f of files) {
    const { front, body } = split(f);
    const summary = front.match(/^summary:(.*)$/m)?.[1] ?? '';
    for (const re of BANNED) if (re.test(body) || re.test(summary)) bad.push(`${f}: ${re}`);
  }
  assert.deepEqual(bad, []);
});

test('body has the three sections', () => {
  const bad = files.filter((f) => {
    const { body } = split(f);
    return !(/^## Ano 'to$/m.test(body) && /^## Saan galing$/m.test(body) && /^## Halimbawa$/m.test(body));
  });
  assert.deepEqual(bad, []);
});

test('no bold lead-ins in body', () => {
  const bad = files.filter((f) => /\*\*[^*]+\*\*/.test(split(f).body));
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
