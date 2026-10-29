// Unit tests for site/lib/company-data.ts.
// Needs a Node.js that strips TypeScript types (22.18+): `node scripts/test-company-data.mjs`
import assert from 'node:assert/strict';
import { createCompanyDataLoader } from '../site/lib/company-data.ts';

const payload = { companies: [{ slug: 'acme', displayName: 'Acme', logo: null, questionCount: 0, questions: [] }] };
const okResponse = () => ({ ok: true, status: 200, json: async () => payload });

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test('caches a successful response', async () => {
  let calls = 0;
  const load = createCompanyDataLoader(async () => { calls += 1; return okResponse(); });
  assert.deepEqual(await load(), payload);
  assert.deepEqual(await load(), payload);
  assert.equal(calls, 1);
});

test('does not cache a failed request, so the next attempt retries', async () => {
  let calls = 0;
  const load = createCompanyDataLoader(async () => {
    calls += 1;
    if (calls === 1) throw new Error('offline');
    return okResponse();
  });
  await assert.rejects(load(), /offline/);
  assert.deepEqual(await load(), payload);
  assert.equal(calls, 2);
});

test('rejects an HTTP error instead of parsing it as data', async () => {
  const load = createCompanyDataLoader(async () => ({ ok: false, status: 503, json: async () => ({}) }));
  await assert.rejects(load(), /503/);
});

let failures = 0;
for (const { name, fn } of tests) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    failures += 1;
    console.log(`not ok - ${name}\n  ${error.message.split('\n')[0]}`);
  }
}
console.log(`\n${tests.length - failures}/${tests.length} passed`);
if (failures > 0) process.exitCode = 1;
