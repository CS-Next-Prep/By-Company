/**
 * generate-index.mjs — extracts a compact company index from companies.json.
 *
 * The full companies.json (4.6MB) is used at build time only.
 * The compact index (companies-index.json) is what the frontend actually serves:
 *   { slug, displayName, logo, questionCount } per company
 *
 * This runs as part of the build pipeline to ensure the search widget only
 * loads a small payload (typically <100KB) rather than the full dataset.
 *
 * AGENTS.md Section 3.1: "must load and be usable in under 1 second on slow connection"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'site', 'public', 'data', 'companies.json');
const OUTPUT = path.join(ROOT, 'site', 'public', 'data', 'companies-index.json');

if (!fs.existsSync(INPUT)) {
  console.error('companies.json not found — run ingest.mjs first');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

const index = {
  generatedAt: data.generatedAt,
  source: data.source,
  sourceDate: data.sourceDate,
  totalCompanies: data.totalCompanies,
  companies: data.companies.map(c => ({
    slug: c.slug,
    displayName: c.displayName,
    logo: c.logo,
    questionCount: c.questionCount,
  })),
};

fs.writeFileSync(OUTPUT, JSON.stringify(index), 'utf8');
const size = fs.statSync(OUTPUT).size;
console.log(`✅ Compact index written: ${OUTPUT}`);
console.log(`   Size: ${(size / 1024).toFixed(1)} KB`);
console.log(`   Companies: ${index.totalCompanies}`);
