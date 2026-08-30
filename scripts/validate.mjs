import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'site', 'public', 'data');
const COMPANIES_FILE = process.env.TEST_COMPANIES_FILE || path.join(DATA_DIR, 'companies.json');
const COMPANIES_INDEX_FILE = process.env.TEST_COMPANIES_INDEX_FILE || path.join(DATA_DIR, 'companies-index.json');
const QUESTIONS_INDEX_FILE = process.env.TEST_QUESTIONS_INDEX_FILE || path.join(DATA_DIR, 'questions-index.json');
const GLOBAL_SURPRISE_FILE = process.env.TEST_GLOBAL_SURPRISE_FILE || path.join(DATA_DIR, 'global-surprise.json');

let hasError = false;

function reportError(message) {
  console.error(`[ERROR] ${message}`);
  hasError = true;
}

function checkExists(filePath) {
  if (!fs.existsSync(filePath)) {
    reportError(`File not found at ${filePath}`);
    return false;
  }
  return true;
}

const validSlugs = new Set();

// 1. Validate companies.json (Main Source Data)
console.log('--- Validating companies.json ---');
if (checkExists(COMPANIES_FILE)) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(COMPANIES_FILE, 'utf8'));
  } catch (e) {
    reportError(`Failed to parse JSON in ${COMPANIES_FILE}: ${e.message}`);
  }

  if (data) {
    if (!data.companies || !Array.isArray(data.companies)) {
      reportError("Root object in companies.json must have a 'companies' array.");
    } else {
      const validDifficulties = ['Easy', 'Medium', 'Hard', 'Unknown'];
      data.companies.forEach((company, index) => {
        if (!company || typeof company !== 'object') {
          reportError(`companies.json -> Company at index ${index} is null or not an object.`);
          return;
        }

        if (typeof company.slug !== 'string' || company.slug.trim() === '' || typeof company.displayName !== 'string' || company.displayName.trim() === '') {
          reportError(`companies.json -> Company at index ${index} missing required 'slug' or 'displayName' fields.`);
        }
        
        if (!Array.isArray(company.questions)) {
          reportError(`companies.json -> Company '${company.slug}' has no 'questions' array.`);
          return;
        }

        const seenQuestions = new Set();
        company.questions.forEach((q, qIndex) => {
          if (!q || typeof q !== 'object') {
            reportError(`companies.json -> Company '${company.slug}' has a null/non-object question at index ${qIndex}.`);
            return;
          }

          const missingOrInvalid = [];
          if (typeof q.id !== 'number' || !Number.isFinite(q.id)) missingOrInvalid.push('id');
          if (typeof q.title !== 'string' || q.title.trim() === '') missingOrInvalid.push('title');
          if (typeof q.difficulty !== 'string' || q.difficulty.trim() === '') missingOrInvalid.push('difficulty');
          if (typeof q.frequency !== 'number' || !Number.isFinite(q.frequency)) missingOrInvalid.push('frequency');
          if (typeof q.acceptance !== 'number' || !Number.isFinite(q.acceptance)) missingOrInvalid.push('acceptance');
          if (typeof q.leetcode_url !== 'string' || q.leetcode_url.trim() === '') missingOrInvalid.push('leetcode_url');

          if (missingOrInvalid.length) {
            reportError(`companies.json -> Company '${company.slug}' has a question missing/invalid fields (${missingOrInvalid.join(', ')}): ${JSON.stringify(q)}`);
            return;
          }

          if (!validDifficulties.includes(q.difficulty)) {
            reportError(`companies.json -> Company '${company.slug}' has invalid difficulty '${q.difficulty}' for question '${q.title}'.`);
          }

          if (q.frequency < 0 || q.frequency > 100) {
            reportError(`companies.json -> Company '${company.slug}' has out-of-range frequency '${q.frequency}' for question '${q.title}' (expected 0-100).`);
          }

          if (q.acceptance < 0 || q.acceptance > 100) {
            reportError(`companies.json -> Company '${company.slug}' has out-of-range acceptance '${q.acceptance}' for question '${q.title}' (expected 0-100).`);
          }

          if (!q.leetcode_url.startsWith('https://leetcode.com/problems/')) {
            reportError(`companies.json -> Company '${company.slug}' has invalid LeetCode URL format '${q.leetcode_url}' for question '${q.title}'.`);
          }

          const identifier = String(q.id);
          if (seenQuestions.has(identifier)) {
            reportError(`companies.json -> Company '${company.slug}' has duplicate question entry: ${identifier}`);
          }
          seenQuestions.add(identifier);
        });
      });
    }
  }
}

// 2. Validate companies-index.json (Generated Data)
console.log('--- Validating companies-index.json ---');
if (checkExists(COMPANIES_INDEX_FILE)) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(COMPANIES_INDEX_FILE, 'utf8'));
  } catch (e) {
    reportError(`Failed to parse JSON in ${COMPANIES_INDEX_FILE}: ${e.message}`);
  }

  if (data) {
    if (!data.companies || !Array.isArray(data.companies)) {
      reportError("Root object in companies-index.json must have a 'companies' array.");
    } else {
      data.companies.forEach((c, i) => {
        if (!c || typeof c !== 'object') {
          reportError(`companies-index.json -> Entry at index ${i} is null or not an object.`);
          return;
        }

        if (
          typeof c.slug !== 'string' ||
          c.slug.trim() === '' ||
          typeof c.displayName !== 'string' ||
          c.displayName.trim() === '' ||
          typeof c.questionCount !== 'number' ||
          !Number.isFinite(c.questionCount) ||
          c.questionCount < 0
        ) {
          reportError(`companies-index.json -> Entry at index ${i} missing/invalid required fields (slug, displayName, questionCount). Data: ${JSON.stringify(c)}`);
        } else {
          validSlugs.add(c.slug);
        }
      });
    }
  }
}

// 3. Validate questions-index.json (Generated Data)
console.log('--- Validating questions-index.json ---');
if (checkExists(QUESTIONS_INDEX_FILE)) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(QUESTIONS_INDEX_FILE, 'utf8'));
  } catch (e) {
    reportError(`Failed to parse JSON in ${QUESTIONS_INDEX_FILE}: ${e.message}`);
  }

  if (data) {
    if (!data.questions || !Array.isArray(data.questions)) {
      reportError("Root object in questions-index.json must have a 'questions' array.");
    } else {
      data.questions.forEach((q, i) => {
        if (!q || typeof q !== 'object') {
          reportError(`questions-index.json -> Question at index ${i} is null or not an object.`);
          return;
        }

        if (
          typeof q.id !== 'number' ||
          !Number.isFinite(q.id) ||
          typeof q.title !== 'string' ||
          q.title.trim() === '' ||
          !Array.isArray(q.companies) ||
          q.companies.length === 0
        ) {
          reportError(`questions-index.json -> Question at index ${i} missing/invalid required fields (id, title, companies array). Data: ${JSON.stringify(q).substring(0, 100)}...`);
        } else {
          // Check that every company reference exists in companies-index.json
          q.companies.forEach(companyRef => {
            if (!companyRef || typeof companyRef !== 'object') {
              reportError(`questions-index.json -> Question '${q.title}' has a malformed company reference.`);
              return;
            }
            if (typeof companyRef.slug !== 'string' || !validSlugs.has(companyRef.slug)) {
              reportError(`questions-index.json -> Question '${q.title}' references a company slug '${companyRef.slug}' that does not exist in companies-index.json.`);
            }
          });
        }
      });
    }
  }
}

// 4. Validate global Surprise Me index (Generated Data)
console.log('--- Validating global-surprise.json ---');
if (checkExists(GLOBAL_SURPRISE_FILE)) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(GLOBAL_SURPRISE_FILE, 'utf8'));
  } catch (e) {
    reportError(`Failed to parse JSON in ${GLOBAL_SURPRISE_FILE}: ${e.message}`);
  }

  if (data) {
    if (!Array.isArray(data.questions)) {
      reportError("global-surprise.json must have a 'questions' array.");
    } else {
      data.questions.forEach((q, i) => {
        if (
          !q || typeof q !== 'object' ||
          typeof q.id !== 'number' || !Number.isFinite(q.id) ||
          typeof q.title !== 'string' || q.title.trim() === '' ||
          typeof q.difficulty !== 'string' ||
          typeof q.frequency !== 'number' || !Number.isFinite(q.frequency) ||
          typeof q.leetcode_url !== 'string' || q.leetcode_url.trim() === '' ||
          typeof q.finalWeight !== 'number' || !Number.isFinite(q.finalWeight) || q.finalWeight <= 0
        ) {
          reportError(`global-surprise.json -> Question at index ${i} has invalid required fields.`);
        }
      });
    }
  }
}

if (hasError) {
  console.error('\n[ERROR] Data validation failed. Please review the errors above.');
  process.exit(1);
} else {
  console.log('\n[SUCCESS] All data validations passed successfully!');
}
