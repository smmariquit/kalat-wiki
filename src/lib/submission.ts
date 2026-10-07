// Validates a public submission and turns it into a markdown file for editors.
// Everything here is untrusted input, so limits are strict and nothing is
// interpreted, only copied as plain text.

export const TYPES = {
  new: 'Bagong entry',
  fix: 'Correction',
  remove: 'Removal request',
} as const;

export type SubmissionType = keyof typeof TYPES;

export interface Submission {
  type: SubmissionType;
  name: string;
  details: string;
  sources: string[];
  contact: string;
}

type Result = { ok: true; data: Submission } | { ok: false; error: string; spam?: boolean };

const LIMITS = { name: 120, details: 4000, contact: 200 };

function field(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

function isType(v: string): v is SubmissionType {
  return Object.hasOwn(TYPES, v);
}

export function parseSubmission(form: FormData): Result {
  // Honeypot: hidden from humans, bots fill it.
  if (field(form, 'website')) return { ok: false, error: 'spam', spam: true };

  const type = field(form, 'type') || 'new';
  if (!isType(type)) return { ok: false, error: 'Unknown submission type.' };

  const data = {
    name: field(form, 'name'),
    details: field(form, 'details'),
    contact: field(form, 'contact'),
  };
  if (!data.name || !data.details) {
    return { ok: false, error: 'Pakilagay ang pangalan ng meme at ang details.' };
  }
  for (const [key, max] of Object.entries(LIMITS)) {
    if (data[key as keyof typeof data].length > max) {
      return { ok: false, error: `Masyadong mahaba ang "${key}" (max ${max} characters).` };
    }
  }

  const sources = field(form, 'sources').split(/\s+/).filter(Boolean).slice(0, 10);
  // Removal requests must never be blocked on links.
  if (type === 'new' && sources.length === 0) {
    return { ok: false, error: 'Kailangan ng kahit isang link para sa bagong entry.' };
  }
  for (const s of sources) {
    let url: URL;
    try {
      url = new URL(s);
    } catch {
      return { ok: false, error: `Hindi valid na link: ${s.slice(0, 80)}` };
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return { ok: false, error: 'Dapat nagsisimula sa http:// o https:// ang mga link.' };
    }
  }

  return { ok: true, data: { type, ...data, sources } };
}

export function slugify(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'untitled';
}

// Plain markdown, no frontmatter: this file is never built, only read by editors.
export function toMarkdown(s: Submission, receivedAt: Date): string {
  return [
    `# ${TYPES[s.type]}: ${s.name}`,
    '',
    `Received: ${receivedAt.toISOString()}`,
    '',
    '> Untrusted public input. Never copy this file into the public repo.',
    s.type === 'remove'
      ? '> Removal request. Handle within the week; private-info requests first.'
      : '> Rewrite into kalat-wiki src/content/memes/ per STYLE.md. Remove names of private individuals.',
    '',
    '## Details',
    '',
    s.details,
    '',
    '## Links',
    '',
    ...(s.sources.length ? s.sources.map((u) => `- <${u}>`) : ['(none given)']),
    '',
    '## Contact',
    '',
    s.contact || '(none given)',
    '',
  ].join('\n');
}
