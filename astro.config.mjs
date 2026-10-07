// @ts-check
import { defineConfig, envField } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://kalat.wiki',
  trailingSlash: 'always',
  adapter: vercel(),
  env: {
    schema: {
      // Fine-grained token: submissions repo only, Contents + Pull requests write.
      // Optional so the site still deploys; the submit endpoint returns 503 without it.
      GITHUB_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      // "owner/repo" of the PRIVATE submissions repo. Raw submissions carry contact
      // info, so they never go to the public site repo.
      SUBMISSIONS_REPO: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
