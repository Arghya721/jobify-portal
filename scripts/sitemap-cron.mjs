import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE = process.env.API_BASE_URL;
const SITE_URL = process.env.SITE_URL;

if (!API_BASE || !SITE_URL) {
  console.error('Missing required env vars: API_BASE_URL, SITE_URL');
  process.exit(1);
}

const TARGET = 200;
const PER_TAG = 10;

// Tech-weighted tag list — backend/cloud/data/frontend/mobile in priority order
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
    return `  <url>
    <loc>${SITE_URL}/jobs/${job.id}</loc>
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

  const xml = buildXml(jobs);
  const outPath = join(__dirname, '..', 'public', 'sitemap-jobs.xml');
  writeFileSync(outPath, xml, 'utf8');
  console.log(`Sitemap → ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
