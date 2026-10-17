/**
 * Data loading utilities — read the static JSON file built by the ingest script.
 * These functions run only at build time (Next.js static generation).
 * AGENTS.md Section 5: "the site must ship with pre-built data — never fetch external data at request time"
 */

import fs from 'fs';
import path from 'path';
import type { CompaniesData, Company, CompanyIndex, QuestionIndex } from './types';

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'companies.json');

let _cache: CompaniesData | null = null;

export function loadData(): CompaniesData {
  if (_cache) return _cache;
  
  if (!fs.existsSync(DATA_FILE)) {
    // Return empty structure if ingest hasn't run yet (dev mode before first ingest)
    console.warn('[data] companies.json not found — run: node scripts/ingest.mjs');
    return {
      generatedAt: new Date().toISOString(),
      source: '',
      sourceDate: '',
      totalCompanies: 0,
      companies: [],
    };
  }
  
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  _cache = JSON.parse(raw) as CompaniesData;
  return _cache;
}

export function getAllCompanies(): CompanyIndex[] {
  const data = loadData();
  return data.companies.map(({ slug, displayName, logo, questionCount }) => ({
    slug,
    displayName,
    logo,
    questionCount,
  }));
}

export function getCompany(slug: string): Company | undefined {
  const data = loadData();
  return data.companies.find(c => c.slug === slug);
}

export function getAllSlugs(): string[] {
  const data = loadData();
  return data.companies.map(c => c.slug);
}

export function getDataMeta(): { generatedAt: string; source: string; sourceDate: string; totalCompanies: number } {
  const data = loadData();
  return {
    generatedAt: data.generatedAt,
    source: data.source,
    sourceDate: data.sourceDate,
    totalCompanies: data.totalCompanies,
  };
}

let _questionIndexCache: QuestionIndex[] | null = null;

/**
 * Builds a cross-company question index from companies.json.
 * Each entry contains the question's id, title, difficulty, leetcode_url, and the companies
 * that asked it (sorted by frequency desc).
 *
 * This runs at build time only (static generation).
 */
export function getAllQuestionsIndex(): QuestionIndex[] {
  if (_questionIndexCache) return _questionIndexCache;

  const data = loadData();

  // Accumulate per-question data across all companies
  const questionMap = new Map<number, QuestionIndex>();

  for (const company of data.companies) {
    for (const q of company.questions) {
      if (!questionMap.has(q.id)) {
        questionMap.set(q.id, {
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          leetcode_url: q.leetcode_url,
          companyCount: 0,
          companies: [],
        });
      }
      const entry = questionMap.get(q.id)!;
      entry.companies.push({
        slug: company.slug,
        displayName: company.displayName,
        logo: company.logo,
        frequency: q.frequency,
      });
    }
  }

  // Sort each question's company list by frequency desc, then set companyCount
  const result: QuestionIndex[] = [];
  for (const entry of questionMap.values()) {
    entry.companies.sort((a, b) => b.frequency - a.frequency);
    entry.companyCount = entry.companies.length;
    result.push(entry);
  }

  // Sort questions by company count desc (most cross-company first) for stable UX
  result.sort((a, b) => b.companyCount - a.companyCount);
  _questionIndexCache = result;
  return _questionIndexCache;
}

/**
 * Returns a single question index entry by id, or undefined if not found.
 */
export function getQuestion(id: number): QuestionIndex | undefined {
  return getAllQuestionsIndex().find(q => q.id === id);
}

export function getAllQuestionIds(): number[] {
  return getAllQuestionsIndex().map(q => q.id);
}
