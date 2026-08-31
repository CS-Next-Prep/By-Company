/**
 * generate-index.mjs — extracts compact indexes from companies.json.
 *
 * The full companies.json is used at build time only. The compact indexes
 * served by the frontend keep the home page fast while providing the data
 * needed for company and global Surprise Me actions.
 *
 * AGENTS.md Section 3.1: "must load and be usable in under 1 second on slow connection"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'site', 'public', 'data');
const INPUT = path.join(DATA_DIR, 'companies.json');
const COMPANIES_OUTPUT = path.join(DATA_DIR, 'companies-index.json');
const QUESTIONS_OUTPUT = path.join(DATA_DIR, 'questions-index.json');
const GLOBAL_OUTPUT = path.join(DATA_DIR, 'global-surprise.json');

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

fs.writeFileSync(COMPANIES_OUTPUT, JSON.stringify(index), 'utf8');

function questionKey(question) {
  const url = String(question.leetcode_url || '').trim().toLowerCase().replace(/\/$/, '');
  if (url) return `url:${url}`;
  return `title:${String(question.title || '').trim().toLowerCase()}`;
}

function questionId(question) {
  return Number.isFinite(question.id) ? question.id : 0;
}

// A frequency of zero means that the source did not provide a useful signal.
// Giving that entry a unit contribution implements the agreed question-count fallback.
function companyWeight(company) {
  return company.questions.reduce(
    (sum, question) => sum + (Number.isFinite(question.frequency) && question.frequency > 0 ? question.frequency : 1),
    0,
  );
}

const companyWeights = new Map(data.companies.map(company => [company.slug, companyWeight(company)]));
const questionAggregates = new Map();

for (const company of data.companies) {
  const weight = companyWeights.get(company.slug) || 1;
  const seenInCompany = new Set();

  for (const question of company.questions) {
    const key = questionKey(question);
    if (seenInCompany.has(key)) continue;
    seenInCompany.add(key);

    const existing = questionAggregates.get(key);
    const companyReference = {
      slug: company.slug,
      displayName: company.displayName,
      logo: company.logo,
      frequency: question.frequency,
    };

    if (existing) {
      existing.questionWeight += weight;
      existing.companyCount += 1;
      existing.frequency = Math.max(existing.frequency, question.frequency);
      existing.companies.push(companyReference);
      continue;
    }

    questionAggregates.set(key, {
      id: questionId(question),
      title: question.title,
      difficulty: question.difficulty,
      frequency: question.frequency,
      leetcode_url: question.leetcode_url,
      questionWeight: weight,
      companyCount: 1,
      companies: [companyReference],
    });
  }
}

const globalQuestions = [...questionAggregates.values()]
  .map(question => ({
    ...question,
    // Log scaling preserves randomness while preventing a few ubiquitous
    // questions from making the rest of the dataset practically unreachable.
    finalWeight: Math.log1p(question.questionWeight),
  }))
  .sort((a, b) => b.finalWeight - a.finalWeight || a.title.localeCompare(b.title));

const globalSurprise = {
  generatedAt: data.generatedAt,
  source: data.source,
  weighting: 'log1p(sum of company weights across distinct companies)',
  questions: globalQuestions.map(({ id, title, difficulty, frequency, leetcode_url, finalWeight }) => ({
    id,
    title,
    difficulty,
    frequency,
    leetcode_url,
    finalWeight,
  })),
};

fs.writeFileSync(GLOBAL_OUTPUT, JSON.stringify(globalSurprise), 'utf8');

const questions = globalQuestions.map(q => ({
  id: q.id,
  title: q.title,
  companies: q.companies,
}));
fs.writeFileSync(QUESTIONS_OUTPUT, JSON.stringify({ questions }), 'utf8');

const companySize = fs.statSync(COMPANIES_OUTPUT).size;
const globalSize = fs.statSync(GLOBAL_OUTPUT).size;
console.log(`✅ Compact company index written: ${COMPANIES_OUTPUT}`);
console.log(`   Size: ${(companySize / 1024).toFixed(1)} KB`);
console.log(`   Companies: ${index.totalCompanies}`);
console.log(`✅ Global Surprise Me index written: ${GLOBAL_OUTPUT}`);
console.log(`   Size: ${(globalSize / 1024).toFixed(1)} KB`);
console.log(`   Unique questions: ${globalQuestions.length}`);
console.log('\nTop 20 global Surprise Me questions by finalWeight:');
for (const [position, question] of globalQuestions.slice(0, 20).entries()) {
  console.log(`${String(position + 1).padStart(2, ' ')}. ${question.title} | companies=${question.companyCount} | questionWeight=${question.questionWeight.toFixed(2)} | finalWeight=${question.finalWeight.toFixed(4)}`);
}
