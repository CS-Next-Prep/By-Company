/**
 * Shared TypeScript types for the CS-Next ByCompany site.
 * AGENTS.md Section 5: normalized schema.
 */

export interface Question {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Unknown';
  frequency: number;     // percentage 0-100
  acceptance: number;    // percentage 0-100
  leetcode_url: string;
  // Note: LeetCode problem statements are NOT stored — legal boundary (AGENTS.md Section 3.3)
}

export interface Company {
  slug: string;
  displayName: string;
  logo: string | null;   // path like /logos/google.png, or null → monogram fallback
  questionCount: number;
  questions: Question[];
}

export interface CompaniesData {
  generatedAt: string;
  source: string;
  sourceDate: string;
  totalCompanies: number;
  companies: Company[];
}

export interface CompanyIndex {
  slug: string;
  displayName: string;
  logo: string | null;
  questionCount: number;
}
