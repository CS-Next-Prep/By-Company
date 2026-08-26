import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validateScript = path.join(__dirname, 'validate.mjs');
const tempDir = path.join(__dirname, 'temp-test-data');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

function runTest(name, dataFiles, expectedToFail) {
  console.log(`\nRunning test: ${name}`);
  const env = { ...process.env };
  
  if (dataFiles.companies) {
    const p = path.join(tempDir, 'companies.json');
    fs.writeFileSync(p, JSON.stringify(dataFiles.companies));
    env.TEST_COMPANIES_FILE = p;
  }
  if (dataFiles.companiesIndex) {
    const p = path.join(tempDir, 'companies-index.json');
    fs.writeFileSync(p, JSON.stringify(dataFiles.companiesIndex));
    env.TEST_COMPANIES_INDEX_FILE = p;
  }
  if (dataFiles.questionsIndex) {
    const p = path.join(tempDir, 'questions-index.json');
    fs.writeFileSync(p, JSON.stringify(dataFiles.questionsIndex));
    env.TEST_QUESTIONS_INDEX_FILE = p;
  }

  try {
    const output = execSync(`node ${validateScript}`, { env, encoding: 'utf8', stdio: 'pipe' });
    if (expectedToFail) {
      console.error(`[ERROR] Test "${name}" failed. Expected validation to fail, but it passed.`);
      process.exit(1);
    } else {
      console.log(`[SUCCESS] Test "${name}" passed.`);
    }
  } catch (err) {
    if (expectedToFail) {
      console.log(`[SUCCESS] Test "${name}" passed. Validation correctly caught the errors:\n  -> ${err.stderr.trim().split('\n')[0]}`);
    } else {
      console.error(`[ERROR] Test "${name}" failed. Expected validation to pass, but it failed with:\n${err.stderr}`);
      process.exit(1);
    }
  }
}

// 1. Negative questionCount in companies-index.json
runTest('Negative questionCount', {
  companies: { companies: [] },
  companiesIndex: {
    companies: [{ slug: 'test', displayName: 'Test', questionCount: -1 }]
  },
  questionsIndex: { questions: [] }
}, true);

// 2. Empty slug in companies-index.json
runTest('Empty slug string', {
  companies: { companies: [] },
  companiesIndex: {
    companies: [{ slug: '   ', displayName: 'Test', questionCount: 1 }]
  },
  questionsIndex: { questions: [] }
}, true);

// 3. Null entry in questions-index.json array
runTest('Null question in questions-index.json', {
  companies: { companies: [] },
  companiesIndex: { companies: [] },
  questionsIndex: {
    questions: [null]
  }
}, true);

// 4. Missing company reference in questions-index.json
runTest('Company reference does not exist in validSlugs', {
  companies: { companies: [] },
  companiesIndex: {
    companies: [{ slug: 'google', displayName: 'Google', questionCount: 1 }]
  },
  questionsIndex: {
    questions: [
      {
        id: 1,
        title: 'Two Sum',
        companies: [{ slug: 'facebook' }] // facebook is not in companiesIndex
      }
    ]
  }
}, true);

// 5. Empty companies array in questions-index.json
runTest('Empty companies array in questions-index.json', {
  companies: { companies: [] },
  companiesIndex: { companies: [] },
  questionsIndex: {
    questions: [
      { id: 1, title: 'Two Sum', companies: [] }
    ]
  }
}, true);

// 6. Valid case
runTest('Valid data should pass', {
  companies: {
    companies: [
      {
        slug: 'google',
        displayName: 'Google',
        questions: [
          { id: 1, title: 'Two Sum', difficulty: 'Easy', frequency: 100, acceptance: 50.5, leetcode_url: 'https://leetcode.com/problems/two-sum' }
        ]
      }
    ]
  },
  companiesIndex: {
    companies: [{ slug: 'google', displayName: 'Google', questionCount: 1 }]
  },
  questionsIndex: {
    questions: [
      {
        id: 1,
        title: 'Two Sum',
        companies: [{ slug: 'google' }]
      }
    ]
  }
}, false);

fs.rmSync(tempDir, { recursive: true, force: true });
console.log('\n🎉 All tests passed successfully!');
