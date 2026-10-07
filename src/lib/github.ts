// Opens a PR with one new file in the private submissions repo (GitHub REST API).
// Not a draft: draft PRs on private repos need a paid plan, and these PRs are never merged.

const API = 'https://api.github.com';

async function gh(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`GitHub ${init.method ?? 'GET'} ${path}: ${res.status}`);
  return res.json();
}

export async function openSubmissionPR(opts: {
  token: string;
  repo: string; // owner/repo
  branch: string;
  filePath: string;
  content: string;
  title: string;
}) {
  const { token, repo, branch, filePath, content, title } = opts;

  const main = await gh(token, `/repos/${repo}/git/ref/heads/main`);
  await gh(token, `/repos/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: main.object.sha }),
  });
  await gh(token, `/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `docs(submissions): add ${filePath}`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch,
    }),
  });
  // Body has no user text on purpose (no @-mention pings, no tracking images).
  await gh(token, `/repos/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      head: branch,
      base: 'main',
      body: `Public submission: \`${filePath}\`.\n\nEditor: write the entry in the public kalat-wiki repo, then close this PR.`,
    }),
  });
}
