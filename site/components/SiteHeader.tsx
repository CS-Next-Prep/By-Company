'use client';

/**
 * SiteHeader — unified search for companies AND questions.
 *
 * Issue #21: extend company search to also search question titles.
 * - No UI change to the search bar (same input, no tabs).
 * - Dropdown gains a second "Questions" section below the existing Companies section.
 * - Each question result shows: id, title, difficulty badge, and company count.
 * - Selecting a question navigates to /question/[id]/.
 * - Full arrow-key navigation across both sections.
 *
 * Compare page added to nav.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CompanyLogo from './CompanyLogo';
import DifficultyBadge from './DifficultyBadge';
import type { QuestionIndex } from '@/lib/types';

interface CompanyIndex {
  slug: string;
  displayName: string;
  logo: string | null;
  questionCount: number;
}

interface SiteHeaderProps {
  companies: CompanyIndex[];
}

const MAX_COMPANY_RESULTS = 5;
const MAX_QUESTION_RESULTS = 5;
const MAX_COMPANIES_SHOWN_PER_Q = 3;

// Module-level cache so questions index is downloaded at most once per session
let questionsCache: Promise<QuestionIndex[]> | null = null;

function fetchQuestionsIndex(): Promise<QuestionIndex[]> {
  if (!questionsCache) {
    questionsCache = fetch('/data/questions-index.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load questions-index.json');
        return res.json();
      })
      .then(data => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (data.questions || []).map((q: any) => ({
          id: q.id,
          title: q.title,
          difficulty: q.difficulty || 'Unknown',
          companyCount: q.companies?.length || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          companies: (q.companies || []).slice(0, 3).map((c: any) => ({
            slug: c.slug,
            displayName: c.displayName,
            logo: c.logo || null,
            frequency: c.frequency || 0,
          })),
        }));
      })
      .catch(err => {
        console.error('[SiteHeader] Error loading questions index:', err);
        return [];
      });
  }
  return questionsCache;
}

export default function SiteHeader({ companies }: SiteHeaderProps) {
  const [query, setQuery] = useState('');
  const [companyResults, setCompanyResults] = useState<CompanyIndex[]>([]);
  const [questionResults, setQuestionResults] = useState<QuestionIndex[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [ready, setReady] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const companyFuseRef = useRef<unknown>(null);
  const questionFuseRef = useRef<unknown>(null);
  const fuseLoaded = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  const totalResults = companyResults.length + questionResults.length;

  const loadFuse = useCallback(async () => {
    if (fuseLoaded.current) return;
    const [FuseModule, questionItems] = await Promise.all([
      import('fuse.js'),
      fetchQuestionsIndex(),
    ]);
    const Fuse = FuseModule.default;
    companyFuseRef.current = new Fuse(companies, {
      keys: ['displayName', 'slug'],
      threshold: 0.35,
      includeScore: true,
      ignoreLocation: true,
    });
    questionFuseRef.current = new Fuse(questionItems, {
      keys: ['title'],
      threshold: 0.35,
      includeScore: true,
      ignoreLocation: true,
    });
    fuseLoaded.current = true;
    setReady(true);
  }, [companies]);

  const search = useCallback((value: string) => {
    const q = value.trim();
    if (!q || !companyFuseRef.current || !questionFuseRef.current) {
      setCompanyResults([]);
      setQuestionResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cRes = (companyFuseRef.current as any).search(q).slice(0, MAX_COMPANY_RESULTS)
      .map((r: { item: CompanyIndex }) => r.item);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qRes = (questionFuseRef.current as any).search(q).slice(0, MAX_QUESTION_RESULTS)
      .map((r: { item: QuestionIndex }) => r.item);

    setCompanyResults(cRes);
    setQuestionResults(qRes);
    setIsOpen(cRes.length > 0 || qRes.length > 0);
    setSelectedIndex(-1);
  }, []);

  const handleFocus = useCallback(async () => {
    setIsFocused(true);
    await loadFuse();
    search(inputRef.current?.value ?? '');
  }, [loadFuse, search]);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setIsFocused(false);
    setCompanyResults([]);
    setQuestionResults([]);
    setSelectedIndex(-1);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll active item into view when selectedIndex changes
  useEffect(() => {
    if (selectedIndex < 0 || !dropdownRef.current) return;
    const activeEl = dropdownRef.current.querySelector<HTMLElement>('[aria-selected="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      closeSearch();
      inputRef.current?.blur();
      return;
    }

    if (totalResults === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1 < totalResults ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : totalResults - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
      if (targetIndex < companyResults.length) {
        router.push(`/company/${companyResults[targetIndex].slug}/`);
      } else {
        const qIndex = targetIndex - companyResults.length;
        router.push(`/question/${questionResults[qIndex].id}/`);
      }
      closeSearch();
    }
  };

  const showDropdown = isFocused && (isOpen || (query.trim().length > 0 && ready));

  const activeDescendantId = selectedIndex >= 0
    ? (selectedIndex < companyResults.length
        ? `search-opt-c-${companyResults[selectedIndex].slug}`
        : `search-opt-q-${questionResults[selectedIndex - companyResults.length].id}`)
    : undefined;

  return (
    <header className="site-header" role="banner">
      <div className="container">
        <Link href="/" className="header-brand" aria-label="CS-Next ByCompany — Home">
          <span className="header-brand-lockup">
            <span className="header-brand-text">ByCompany</span>
            <span className="header-brand-sub">by CS-Next</span>
          </span>
        </Link>

        <div className="search-wrap" role="search">
          <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className="search-input"
            placeholder="Search companies or questions…"
            value={query}
            aria-label="Search companies or questions"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls="search-results"
            aria-activedescendant={activeDescendantId}
            role="combobox"
            onChange={e => { setQuery(e.target.value); search(e.target.value); }}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
          />

          {showDropdown && (
            <div
              id="search-results"
              ref={dropdownRef}
              className="search-results"
              role="listbox"
              aria-label="Search results"
            >
              {/* ── Companies section ────────────────────────────────── */}
              {companyResults.length > 0 && (
                <>
                  <div className="search-section-header">Companies</div>
                  {companyResults.map((c, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <Link
                        key={c.slug}
                        id={`search-opt-c-${c.slug}`}
                        href={`/company/${c.slug}/`}
                        className={`search-result-item ${isSelected ? 'selected' : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={closeSearch}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <CompanyLogo logo={c.logo} displayName={c.displayName} size="sm" />
                        <span className="search-result-name">{highlightMatch(c.displayName, query.trim())}</span>
                        <span className="search-result-count">{c.questionCount} questions</span>
                      </Link>
                    );
                  })}
                </>
              )}

              {/* ── Questions section ────────────────────────────────── */}
              {questionResults.length > 0 && (
                <>
                  <div className="search-section-header">Questions</div>
                  {questionResults.map((q, idx) => {
                    const globalIdx = companyResults.length + idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <Link
                        key={q.id}
                        id={`search-opt-q-${q.id}`}
                        href={`/question/${q.id}/`}
                        className={`search-result-item q-result-block ${isSelected ? 'selected' : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={closeSearch}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      >
                        {/* Title row */}
                        <div className="q-result-title-link">
                          <span className="q-result-id">#{q.id}</span>
                          <span className="q-result-title">{highlightMatch(q.title, query.trim())}</span>
                          <DifficultyBadge difficulty={q.difficulty} />
                          <span className="search-result-count">
                            {q.companyCount} {q.companyCount === 1 ? 'company' : 'companies'}
                          </span>
                        </div>
                        {/* Companies row */}
                        <div className="q-result-companies">
                          <span className="q-result-companies-label">Asked by:</span>
                          {q.companies.slice(0, MAX_COMPANIES_SHOWN_PER_Q).map((c, i) => (
                            <span key={c.slug}>
                              {i > 0 && <span className="q-result-sep">, </span>}
                              <span className="q-result-company-link">{c.displayName}</span>
                            </span>
                          ))}
                          {q.companyCount > MAX_COMPANIES_SHOWN_PER_Q && (
                            <span className="q-result-sep">
                              {' '}+{q.companyCount - MAX_COMPANIES_SHOWN_PER_Q} more
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}

              {/* ── No results ──────────────────────────────────────── */}
              {query.trim() && companyResults.length === 0 && questionResults.length === 0 && ready && (
                <div className="search-empty">No results for &ldquo;{query}&rdquo;</div>
              )}
            </div>
          )}
        </div>

        <nav className="header-nav" aria-label="Site navigation">
          <Link href="/" className={pathname === '/' ? 'active' : ''} aria-current={pathname === '/' ? 'page' : undefined}>
            Companies
          </Link>
          <Link href="/compare/" className={pathname.startsWith('/compare') ? 'active' : ''} aria-current={pathname.startsWith('/compare') ? 'page' : undefined}>
            Compare
          </Link>
          <Link href="/about/" className={pathname === '/about/' ? 'active' : ''} aria-current={pathname === '/about/' ? 'page' : undefined}>
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

function highlightMatch(name: string, query: string) {
  if (!query) return <>{name}</>;
  const idx = name.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{name}</>;
  return (
    <>
      {name.slice(0, idx)}
      <mark>{name.slice(idx, idx + query.length)}</mark>
      {name.slice(idx + query.length)}
    </>
  );
}
