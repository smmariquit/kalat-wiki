import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseSubmission, slugify, toMarkdown } from './submission.ts';

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};
const valid = {
  type: 'new',
  name: 'Pano mo nasabe',
  details: 'Asking how someone reached a conclusion.',
  sources: 'https://example.com/a\nhttps://example.com/b',
};

test('accepts a valid submission and splits links', () => {
  const r = parseSubmission(form(valid));
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.data.sources, ['https://example.com/a', 'https://example.com/b']);
});

test('flags honeypot as spam', () => {
  const r = parseSubmission(form({ ...valid, website: 'x' }));
  assert.ok(!r.ok && r.spam);
});

test('new entries need links, removals do not', () => {
  assert.ok(!parseSubmission(form({ ...valid, sources: '' })).ok);
  assert.ok(parseSubmission(form({ ...valid, type: 'remove', sources: '' })).ok);
});

test('rejects non-http links and unknown types', () => {
  assert.ok(!parseSubmission(form({ ...valid, sources: 'javascript:alert(1)' })).ok);
  assert.ok(!parseSubmission(form({ ...valid, type: '__proto__' })).ok);
});

test('rejects oversized fields', () => {
  assert.ok(!parseSubmission(form({ ...valid, details: 'a'.repeat(4001) })).ok);
});

test('slugify strips accents and junk', () => {
  assert.equal(slugify('Ñaks! Pano mo nasabe?'), 'naks-pano-mo-nasabe');
  assert.equal(slugify('!!!'), 'untitled');
});

test('markdown has no frontmatter', () => {
  const r = parseSubmission(form(valid));
  assert.ok(r.ok);
  if (r.ok) assert.ok(!toMarkdown(r.data, new Date(0)).startsWith('---'));
});
