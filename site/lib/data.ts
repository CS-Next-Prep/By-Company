/**
 * Data loading utilities — read the static JSON file built by the ingest script.
 * These functions run only at build time (Next.js static generation).
 * AGENTS.md Section 5: "the site must ship with pre-built data — never fetch external data at request time"
 */

import fs from 'fs';
import path from 'path';
import type { CompaniesData, Company, CompanyIndex } from './types';

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
