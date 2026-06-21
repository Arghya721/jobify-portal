import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createSign } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE = process.env.API_BASE_URL;
const SITE_URL = process.env.SITE_URL;
// Optional: SERVICE_ACCOUNT_JSON for Google Indexing API.
// Prerequisite: the service account must be a verified owner in Google Search Console.
const GOOGLE_SA_JSON = process.env.GOOGLE_SA_JSON;

if (!API_BASE || !SITE_URL) {
  console.error('Missing required env vars: API_BASE_URL, SITE_URL');
  process.exit(1);
}

const TARGET = 200;
const PER_TAG = 10;

// ─── Slug helpers (mirrors src/lib/utils.ts) ──────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateJobSlug(job) {
  const titlePart = slugify(job.title || 'job');
  // REST API may return company as object or flat string
  const companyName = job.company?.name ?? job.company_name ?? '';
  const companyPart = slugify(companyName);
  const parts = [titlePart, companyPart].filter(Boolean);
  return `${parts.join('-')}-${job.id}`;
}

// ─── Tech-weighted tag list — backend/cloud/data/frontend/mobile in priority order
const TECH_TAGS = [
  'java',       'python',     'react',        'nodejs',         'typescript',
  'golang',     'rust',       'kubernetes',   'docker',         'aws',
  'gcp',        'azure',      'devops',       'terraform',      'spring',
  'nextjs',     'angular',    'machine-learning', 'data-engineer', 'spark',
  'kafka',      'elasticsearch', 'android',   'ios',            'flutter',
];

async function fetchJobs(params) {
  const url = new URL(`${API_BASE}/jobs`);
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) v.forEach(vi => url.searchParams.append(k, vi));
    else url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(60000) });
  if (!res.ok) {
    console.warn(`  API ${res.status} for ?${url.searchParams}`);
    return [];
  }
  const json = await res.json();
  return json.data || [];
}

async function collectJobs(jobMap, since, perTag = PER_TAG) {
  for (const tag of TECH_TAGS) {
    if (jobMap.size >= TARGET) break;
    try {
      const jobs = await fetchJobs({
        description_tags: tag,
        is_active: 'true',
        since,
        page: 1,
        limit: perTag,
        sort: 'desc',
      });
      let added = 0;
      for (const job of jobs) {
        if (!jobMap.has(job.id)) { jobMap.set(job.id, job); added++; }
      }
      if (added > 0) console.log(`  [${tag}] +${added} → ${jobMap.size}`);
    } catch (e) {
      console.warn(`  [${tag}] ${e.message}`);
    }
  }
}

function buildXml(jobs) {
  const today = new Date().toISOString().split('T')[0];
  const entries = jobs.map(job => {
    const lastmod = job.created_at ? job.created_at.split('T')[0] : today;
    // Use the canonical slug URL (same as what the job detail page renders at)
    const slug = generateJobSlug(job);
    return `  <url>
    <loc>${SITE_URL}/jobs/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;
}

// ─── Google Indexing API ──────────────────────────────────────────────────────
// Prerequisite: the service account email must be added as a verified owner
// in Google Search Console → Settings → Users and permissions.
// Without that, the API returns 403 and notifications are silently skipped.

async function getGoogleAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claims  = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/indexing',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${claims}`);
  const signature = sign.sign(sa.private_key, 'base64url');
  const jwt = `${header}.${claims}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);
  return (await res.json()).access_token;
}

async function notifyGoogleIndexing(jobs) {
  if (!GOOGLE_SA_JSON) {
    console.log('\nGOOGLE_SA_JSON not set — skipping Indexing API');
    return;
  }

  let sa;
  try { sa = JSON.parse(GOOGLE_SA_JSON); }
  catch (e) { console.warn('Could not parse GOOGLE_SA_JSON:', e.message); return; }

  console.log('\n=== Google Indexing API ===');
  let accessToken;
  try {
    accessToken = await getGoogleAccessToken(sa);
    console.log('Access token obtained ✓');
  } catch (e) {
    console.warn('Could not get Google access token:', e.message);
    return;
  }

  // Default quota: 200 URL_UPDATED notifications/day — exactly matches TARGET.
  const urls = jobs.map(job => `${SITE_URL}/jobs/${generateJobSlug(job)}`);
  let notified = 0, failed = 0;

  // 10 concurrent requests per batch, 200 ms pause between batches
  const CONCURRENT = 10;
  for (let i = 0; i < urls.length; i += CONCURRENT) {
    await Promise.all(urls.slice(i, i + CONCURRENT).map(async (url) => {
      try {
        const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, type: 'URL_UPDATED' }),
          signal: AbortSignal.timeout(15_000),
        });
        if (res.ok) { notified++; }
        else { console.warn(`  FAIL [${res.status}] ${url}`); failed++; }
      } catch (e) {
        console.warn(`  ERROR ${url}: ${e.message}`); failed++;
      }
    }));
    if (i + CONCURRENT < urls.length) await new Promise(r => setTimeout(r, 200));
  }

  console.log(`Indexing API: ${notified}/${urls.length} notified, ${failed} failed`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7d  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString();

  const jobMap = new Map();

  console.log('=== Collecting jobs (24h window) ===');
  await collectJobs(jobMap, since24h);

  if (jobMap.size < TARGET) {
    console.log(`\n=== Under target (${jobMap.size}/${TARGET}), expanding to 7d ===`);
    await collectJobs(jobMap, since7d, 20);
  }

  const jobs = Array.from(jobMap.values()).slice(0, TARGET);
  console.log(`\nTotal: ${jobs.length} unique jobs`);

  // 1. Write sitemap with canonical slug URLs
  const xml = buildXml(jobs);
  const outPath = join(__dirname, '..', 'public', 'sitemap-jobs.xml');
  writeFileSync(outPath, xml, 'utf8');
  console.log(`Sitemap → ${outPath}`);

  // 2. Ping Google Indexing API for every new job URL (runs after sitemap write
  //    so the cron still commits the sitemap even if the API call fails)
  await notifyGoogleIndexing(jobs);
}

main().catch(e => { console.error(e); process.exit(1); });
