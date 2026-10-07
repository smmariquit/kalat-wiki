# Kalat

Encyclopedia ng Pinoy memes, slang, at mga linya. Live at <https://kalat.wiki>.

Static Astro site. Each entry is a markdown file in `src/content/memes/`, validated by the schema in `src/content.config.ts` (every entry needs at least one source, or the build fails). The only server code is `src/pages/api/submit.ts`, which turns the public form into a PR on a private submissions repo.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm test         # submission validation tests
npm run build
```

## Write an entry

Read [STYLE.md](STYLE.md) first. It covers the casual Taglish voice and the legal rules (no private individuals, source every origin). Copy any file in `src/content/memes/`, edit it, open a PR. CI runs the tests and the build.

## Deploy

Vercel, from `main`. The submit endpoint needs two env vars, both server-only:

- `GITHUB_TOKEN`, a fine-grained token for the submissions repo only, with Contents and Pull requests write.
- `SUBMISSIONS_REPO`, the private repo that receives submissions, as `owner/repo`.

Without them the site still works and the form returns "Sarado muna ang submissions".
