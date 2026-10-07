import type { APIRoute } from 'astro';
import { GITHUB_TOKEN, SUBMISSIONS_REPO } from 'astro:env/server';
import { openSubmissionPR } from '../../lib/github';
import { TYPES, parseSubmission, slugify, toMarkdown } from '../../lib/submission';

export const prerender = false;

const text = (body: string, status: number) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

// ponytail: no rate limit yet. Add a Vercel Firewall rate-limit rule or Turnstile once spam shows up.
export const POST: APIRoute = async ({ request, redirect }) => {
  if (!GITHUB_TOKEN || !SUBMISSIONS_REPO) {
    return text('Sarado muna ang submissions. Balik ka mamaya.', 503);
  }

  const parsed = parseSubmission(await request.formData());
  // Pretend success to bots so they don't retry.
  if (!parsed.ok && parsed.spam) return redirect('/submit/thanks/', 303);
  if (!parsed.ok) return text(`${parsed.error}\n\nBumalik ka at subukan ulit.`, 400);

  const { data } = parsed;
  const now = new Date();
  const id = `${data.type}-${slugify(data.name)}-${now.getTime()}`;
  try {
    await openSubmissionPR({
      token: GITHUB_TOKEN,
      repo: SUBMISSIONS_REPO,
      branch: `submission/${id}`,
      filePath: `submissions/${id}.md`,
      content: toMarkdown(data, now),
      title: `${TYPES[data.type]}: ${data.name.slice(0, 80)}`,
    });
  } catch (err) {
    console.error(err);
    return text('May error sa pag-save. Subukan ulit mamaya.', 502);
  }
  return redirect('/submit/thanks/', 303);
};
