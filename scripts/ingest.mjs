/**
 * ingest.mjs — one-time, re-runnable data pipeline for CS-Next ByCompany site.
 *
 * Source: snehasishroy/leetcode-companywise-interview-questions (snapshot July 2026, most recent)
 * Data is fully static — this script runs at build time, never at request time.
 *
 * Output schema per question:
 *   { id, title, difficulty, frequency, leetcode_url }
 *
 * Output per company (companies.json):
 *   { slug, displayName, logo, questionCount, questions[] }
 *
 * Logos: fetched from logo.clearbit.com (fallback: favicon, then monogram flag)
 * and cached to /site/public/logos/<slug>.png at ingestion time.
 *
 * AGENTS.md Section 3.2: MUST self-host logos; MUST NOT hot-link at runtime.
 * AGENTS.md Section 3.3: MUST NOT reproduce LeetCode problem statements — title/difficulty/url/frequency only.
 * AGENTS.md Section 5: MUST NOT scrape leetcode.com directly.
 */

import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LOGOS_DIR = path.join(ROOT, 'site', 'public', 'logos');
const OUTPUT_DIR = path.join(ROOT, 'site', 'public', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'companies.json');

// GitHub raw base — using the primary source (July 2026 snapshot)
const GITHUB_API_BASE = 'https://api.github.com/repos/snehasishroy/leetcode-companywise-interview-questions/contents';
const RAW_BASE = 'https://raw.githubusercontent.com/snehasishroy/leetcode-companywise-interview-questions/master';

// Rate-limit awareness: GitHub API allows 60 unauthenticated req/hour.
// We use raw.githubusercontent.com for CSV files (no auth limit).
const DELAY_MS = 50; // Small delay between requests

fs.mkdirSync(LOGOS_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Fetch text from a URL, following redirects.
 */
function fetchText(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: {
        'User-Agent': 'CS-Next-ByCompany-Ingest/1.0',
        'Accept': 'text/plain,application/json,*/*',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchText(res.headers.location));
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(new Error(`Timeout: ${url}`)); });
  });
}

/**
 * Fetch a binary URL and save to dest file path.
 */
function fetchBinary(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: { 'User-Agent': 'CS-Next-ByCompany-Ingest/1.0' },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchBinary(res.headers.location, destPath));
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const fileStream = createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => resolve(true));
      fileStream.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(new Error('Timeout')); });
  });
}

/**
 * Parse CSV text into array of row objects.
 * Handles quoted fields with commas inside.
 */
function parseCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = parseCsvRow(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCsvRow(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCsvRow(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Convert company folder name to a display name.
 * e.g. "american-express" → "American Express"
 */
function toDisplayName(slug) {
  // Special cases for well-known acronyms
  const overrides = {
    'ibm': 'IBM', 'amd': 'AMD', 'jpmorgan': 'JPMorgan',
    'adp': 'ADP', 'sap': 'SAP', 'hpe': 'HPE', 'vmware': 'VMware',
    'ntt-data': 'NTT Data', 'bmc': 'BMC', 'dbs': 'DBS', 'dhl': 'DHL',
    'ge-healthcare': 'GE Healthcare', 'hcl': 'HCL', 'bnp-paribas': 'BNP Paribas',
    'jpmorgan-chase': 'JPMorgan Chase', 'usaa': 'USAA', 'td': 'TD',
    'att': 'AT&T', 'yelp': 'Yelp', 'lyft': 'Lyft', 'uber': 'Uber',
    'doordash': 'DoorDash', 'airbnb': 'Airbnb',
  };
  if (overrides[slug]) return overrides[slug];
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Attempt to fetch and cache a company logo.
 * Strategy: Clearbit → Google favicon → skip (monogram fallback in UI).
 * AGENTS.md Section 3.2: MUST self-host fetched logos.
 */
async function fetchLogo(slug, displayName) {
  const destPng = path.join(LOGOS_DIR, `${slug}.png`);
  const destSvg = path.join(LOGOS_DIR, `${slug}.svg`);
  
  // Already cached — skip
  if (fs.existsSync(destPng) || fs.existsSync(destSvg)) {
    return fs.existsSync(destPng) ? `/logos/${slug}.png` : `/logos/${slug}.svg`;
  }
  
  // Build domain guess from slug
  const domainGuess = slug.replace(/-/g, '') + '.com';
  const altDomainGuess = slug.replace(/-inc$/, '').replace(/-/g, '') + '.com';
  
  // 1. Try Clearbit logo API (high-quality PNG)
  const clearbitCandidates = [
    `https://logo.clearbit.com/${domainGuess}?size=128`,
    `https://logo.clearbit.com/${altDomainGuess}?size=128`,
    // Special slug→domain mappings for common mismatches
    ...getSpecialDomains(slug),
  ].filter(Boolean);
  
  for (const url of clearbitCandidates) {
    try {
      await fetchBinary(url, destPng);
      // Verify it's actually an image (>500 bytes)
      const stat = fs.statSync(destPng);
      if (stat.size > 500) {
        return `/logos/${slug}.png`;
      }
      fs.unlinkSync(destPng);
    } catch (e) {
      // try next
    }
  }
  
  // 2. Try Google favicon (fallback, lower quality but broad coverage)
  try {
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domainGuess}&sz=64`;
    await fetchBinary(faviconUrl, destPng);
    const stat = fs.statSync(destPng);
    if (stat.size > 200) {
      return `/logos/${slug}.png`;
    }
    fs.unlinkSync(destPng);
  } catch (e) {
    // no favicon
  }
  
  // No logo found — UI will use monogram fallback
  return null;
}

/**
 * Special-case domain mappings for slugs that don't map cleanly to .com domains.
 */
function getSpecialDomains(slug) {
  const map = {
    'google': ['https://logo.clearbit.com/google.com?size=128'],
    'amazon': ['https://logo.clearbit.com/amazon.com?size=128'],
    'facebook': ['https://logo.clearbit.com/facebook.com?size=128'],
    'meta': ['https://logo.clearbit.com/meta.com?size=128'],
    'apple': ['https://logo.clearbit.com/apple.com?size=128'],
    'microsoft': ['https://logo.clearbit.com/microsoft.com?size=128'],
    'netflix': ['https://logo.clearbit.com/netflix.com?size=128'],
    'uber': ['https://logo.clearbit.com/uber.com?size=128'],
    'lyft': ['https://logo.clearbit.com/lyft.com?size=128'],
    'airbnb': ['https://logo.clearbit.com/airbnb.com?size=128'],
    'twitter': ['https://logo.clearbit.com/twitter.com?size=128'],
    'linkedin': ['https://logo.clearbit.com/linkedin.com?size=128'],
    'salesforce': ['https://logo.clearbit.com/salesforce.com?size=128'],
    'oracle': ['https://logo.clearbit.com/oracle.com?size=128'],
    'adobe': ['https://logo.clearbit.com/adobe.com?size=128'],
    'intel': ['https://logo.clearbit.com/intel.com?size=128'],
    'nvidia': ['https://logo.clearbit.com/nvidia.com?size=128'],
    'ibm': ['https://logo.clearbit.com/ibm.com?size=128'],
    'atlassian': ['https://logo.clearbit.com/atlassian.com?size=128'],
    'slack': ['https://logo.clearbit.com/slack.com?size=128'],
    'stripe': ['https://logo.clearbit.com/stripe.com?size=128'],
    'shopify': ['https://logo.clearbit.com/shopify.com?size=128'],
    'spotify': ['https://logo.clearbit.com/spotify.com?size=128'],
    'tiktok': ['https://logo.clearbit.com/tiktok.com?size=128'],
    'bytedance': ['https://logo.clearbit.com/bytedance.com?size=128'],
    'doordash': ['https://logo.clearbit.com/doordash.com?size=128'],
    'coinbase': ['https://logo.clearbit.com/coinbase.com?size=128'],
    'robinhood': ['https://logo.clearbit.com/robinhood.com?size=128'],
    'snap': ['https://logo.clearbit.com/snap.com?size=128'],
    'snapchat': ['https://logo.clearbit.com/snap.com?size=128'],
    'pinterest': ['https://logo.clearbit.com/pinterest.com?size=128'],
    'reddit': ['https://logo.clearbit.com/reddit.com?size=128'],
    'dropbox': ['https://logo.clearbit.com/dropbox.com?size=128'],
    'box': ['https://logo.clearbit.com/box.com?size=128'],
    'twilio': ['https://logo.clearbit.com/twilio.com?size=128'],
    'zoom': ['https://logo.clearbit.com/zoom.us?size=128'],
    'palantir': ['https://logo.clearbit.com/palantir.com?size=128'],
    'databricks': ['https://logo.clearbit.com/databricks.com?size=128'],
    'snowflake': ['https://logo.clearbit.com/snowflake.com?size=128'],
    'datadog': ['https://logo.clearbit.com/datadoghq.com?size=128'],
    'confluent': ['https://logo.clearbit.com/confluent.io?size=128'],
    'elastic': ['https://logo.clearbit.com/elastic.co?size=128'],
    'mongodb': ['https://logo.clearbit.com/mongodb.com?size=128'],
    'cloudflare': ['https://logo.clearbit.com/cloudflare.com?size=128'],
    'palo-alto-networks': ['https://logo.clearbit.com/paloaltonetworks.com?size=128'],
    'crowdstrike': ['https://logo.clearbit.com/crowdstrike.com?size=128'],
    'servicenow': ['https://logo.clearbit.com/servicenow.com?size=128'],
    'workday': ['https://logo.clearbit.com/workday.com?size=128'],
    'jpmorgan': ['https://logo.clearbit.com/jpmorganchase.com?size=128'],
    'jpmorgan-chase': ['https://logo.clearbit.com/jpmorganchase.com?size=128'],
    'goldman-sachs': ['https://logo.clearbit.com/goldmansachs.com?size=128'],
    'morgan-stanley': ['https://logo.clearbit.com/morganstanley.com?size=128'],
    'american-express': ['https://logo.clearbit.com/americanexpress.com?size=128'],
    'bank-of-america': ['https://logo.clearbit.com/bankofamerica.com?size=128'],
    'wells-fargo': ['https://logo.clearbit.com/wellsfargo.com?size=128'],
    'cisco': ['https://logo.clearbit.com/cisco.com?size=128'],
    'vmware': ['https://logo.clearbit.com/vmware.com?size=128'],
    'tesla': ['https://logo.clearbit.com/tesla.com?size=128'],
    'samsung': ['https://logo.clearbit.com/samsung.com?size=128'],
    'huawei': ['https://logo.clearbit.com/huawei.com?size=128'],
    'tata-consultancy-services': ['https://logo.clearbit.com/tcs.com?size=128'],
    'infosys': ['https://logo.clearbit.com/infosys.com?size=128'],
    'wipro': ['https://logo.clearbit.com/wipro.com?size=128'],
    'accenture': ['https://logo.clearbit.com/accenture.com?size=128'],
    'capgemini': ['https://logo.clearbit.com/capgemini.com?size=128'],
    'deloitte': ['https://logo.clearbit.com/deloitte.com?size=128'],
    'pwc': ['https://logo.clearbit.com/pwc.com?size=128'],
    'kpmg': ['https://logo.clearbit.com/kpmg.com?size=128'],
    'mckinsey': ['https://logo.clearbit.com/mckinsey.com?size=128'],
    'akuna-capital': ['https://logo.clearbit.com/akunacapital.com?size=128'],
    'jane-street': ['https://logo.clearbit.com/janestreet.com?size=128'],
    'two-sigma': ['https://logo.clearbit.com/twosigma.com?size=128'],
    'de-shaw': ['https://logo.clearbit.com/deshaw.com?size=128'],
    'citadel': ['https://logo.clearbit.com/citadel.com?size=128'],
    'optiver': ['https://logo.clearbit.com/optiver.com?size=128'],
    'hudson-river-trading': ['https://logo.clearbit.com/hudson-trading.com?size=128'],
    'imc': ['https://logo.clearbit.com/imc.com?size=128'],
    'aqr-capital-management': ['https://logo.clearbit.com/aqr.com?size=128'],
    'uber-eats': ['https://logo.clearbit.com/ubereats.com?size=128'],
    'grammarly': ['https://logo.clearbit.com/grammarly.com?size=128'],
    'anthropic': ['https://logo.clearbit.com/anthropic.com?size=128'],
    'openai': ['https://logo.clearbit.com/openai.com?size=128'],
    'cohere': ['https://logo.clearbit.com/cohere.com?size=128'],
    'mistral': ['https://logo.clearbit.com/mistral.ai?size=128'],
  };
  return map[slug] || [];
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 CS-Next ByCompany ingest starting...');
  console.log('📡 Source: snehasishroy/leetcode-companywise-interview-questions (July 2026)');
  
  // Step 1: Get the list of company directories from GitHub API
  console.log('\n📂 Fetching company directory list...');
  let contents;
  try {
    const json = await fetchText(GITHUB_API_BASE);
    contents = JSON.parse(json);
  } catch (e) {
    console.error('Failed to fetch repo contents:', e.message);
    process.exit(1);
  }
  
  // Filter to only directories (skip files like README.md, .gitignore)
  const companyDirs = contents
    .filter(item => item.type === 'dir')
    .map(item => item.name)
    .sort();
  
  console.log(`✅ Found ${companyDirs.length} company directories`);
  
  const companies = [];
  const errors = [];
  
  for (let i = 0; i < companyDirs.length; i++) {
    const slug = companyDirs[i];
    const displayName = toDisplayName(slug);
    
    process.stdout.write(`  [${i + 1}/${companyDirs.length}] ${displayName}... `);
    
    // Step 2: Fetch the all.csv for this company
    const csvUrl = `${RAW_BASE}/${slug}/all.csv`;
    let csvText;
    try {
      csvText = await fetchText(csvUrl);
    } catch (e) {
      console.log(`⚠️  no all.csv (${e.message})`);
      errors.push({ slug, error: e.message });
      continue;
    }
    
    // Step 3: Parse CSV → normalize to our schema
    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      console.log('⚠️  empty CSV');
      continue;
    }
    
    const questions = rows
      .filter(row => row['Title'] && row['URL'])
      .map(row => ({
        id: parseInt(row['ID'] || '0', 10) || 0,
        title: row['Title'] || '',
        difficulty: row['Difficulty'] || 'Unknown',
        frequency: parseFloat((row['Frequency %'] || '0').replace('%', '')) || 0,
        acceptance: parseFloat((row['Acceptance %'] || '0').replace('%', '')) || 0,
        leetcode_url: row['URL'] || '',
      }))
      // Dedupe by problem ID (keep highest frequency)
      .reduce((acc, q) => {
        const existing = acc.find(x => x.id === q.id);
        if (!existing || q.frequency > existing.frequency) {
          return acc.filter(x => x.id !== q.id).concat(q);
        }
        return acc;
      }, [])
      // Sort by frequency desc
      .sort((a, b) => b.frequency - a.frequency);
    
    // Step 4: Fetch and cache logo
    let logoPath = null;
    try {
      logoPath = await fetchLogo(slug, displayName);
    } catch (e) {
      // Logo fetch failure is non-fatal — UI shows monogram
    }
    
    companies.push({
      slug,
      displayName,
      logo: logoPath,
      questionCount: questions.length,
      questions,
    });
    
    console.log(`✅ ${questions.length} questions${logoPath ? ', logo cached' : ', no logo'}`);
    
    // Small delay to be polite to servers
    await sleep(DELAY_MS);
  }
  
  // Step 5: Write output JSON
  // Sort companies alphabetically by displayName
  companies.sort((a, b) => a.displayName.localeCompare(b.displayName));
  
  const output = {
    generatedAt: new Date().toISOString(),
    source: 'snehasishroy/leetcode-companywise-interview-questions',
    sourceDate: '2026-07-12',
    totalCompanies: companies.length,
    companies,
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  
  console.log('\n🎉 Ingest complete!');
  console.log(`   Companies: ${companies.length}`);
  console.log(`   Errors/skipped: ${errors.length}`);
  console.log(`   Output: ${OUTPUT_FILE}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors:');
    errors.forEach(e => console.log(`   ${e.slug}: ${e.error}`));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
