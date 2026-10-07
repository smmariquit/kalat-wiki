import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const KINDS = ['meme', 'slang', 'quote'] as const;

const memes = defineCollection({
  loader: glob({ base: './src/content/memes', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(KINDS),
    summary: z.string().max(160),
    // researching = origin not yet verified; shown with a warning
    status: z.enum(['confirmed', 'researching']),
    originYear: z.number().int().min(1950).max(2030).optional(),
    aliases: z.array(z.string()).default([]),
    // Policy lives here: no entry builds without at least one source.
    sources: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .min(1),
    tags: z.array(z.string()).default([]),
    updated: z.coerce.date(),
  }),
});

export const collections = { memes };
