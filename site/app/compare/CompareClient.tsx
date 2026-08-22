'use client';

/**
 * CompareClient — client component for the Compare page.
 * Lets the user pick two companies and shows the intersection of their question lists.
 * Fetches the full companies.json lazily (module-level cache, loaded once per session).
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import CompanyLogo from '@/components/CompanyLogo';
import DifficultyBadge from '@/components/DifficultyBadge';

interface CompanyIndex {
  slug: string;
  displayName: string;
  logo: string | null;
  questionCount: number;
}

interface Question {
  id: number;
  title: string;
  difficulty: string;
  frequency: number;
  leetcode_url: string;
}

interface CompanyFull extends CompanyIndex {
  questions: Question[];
}

// Module-level cache — full JSON loaded once per session, never re-fetched
let dataCache: Promise<{ companies: CompanyFull[] }> | null = null;
function getCompanyData() {
  if (!dataCache) {
    dataCache = fetch('/data/companies.json').then(r => r.json());
  }
  return dataCache;
}

export default function CompareClient({ companies }: { companies: CompanyIndex[] }) {
  const [companyA, setCompanyA] = useState<CompanyIndex | null>(null);
  const [companyB, setCompanyB] = useState<CompanyIndex | null>(null);
  const [fullA, setFullA]       = useState<CompanyFull | null>(null);
  const [fullB, setFullB]       = useState<CompanyFull | null>(null);
  const [loading, setLoading]   = useState(false);

  // Fetch full question lists when both companies are selected
  useEffect(() => {
    let ignore = false;
    if (!companyA || !companyB) {
      Promise.resolve().then(() => {
        if (!ignore) {
          setFullA(null);
          setFullB(null);
        }
      });
      return;
    }
    Promise.resolve().then(() => { if (!ignore) setLoading(true); });
    getCompanyData().then(data => {
      if (!ignore) {
        setFullA(data.companies.find(c => c.slug === companyA.slug) ?? null);
        setFullB(data.companies.find(c => c.slug === companyB.slug) ?? null);
        setLoading(false);
      }
    });
    return () => { ignore = true; };
  }, [companyA, companyB]);

  // Intersection: questions asked by both companies
  const overlap = useMemo(() => {
    if (!fullA || !fullB) return [];
    const bMap = new Map(fullB.questions.map(q => [q.id, q]));
    return fullA.questions
      .filter(q => bMap.has(q.id))
      .map(q => ({
        ...q,
        freqA: q.frequency,
        freqB: bMap.get(q.id)!.frequency,
      }))
      .sort((a, b) => (b.freqA + b.freqB) - (a.freqA + a.freqB));
  }, [fullA, fullB]);

  const bothPicked = companyA && companyB;

  return (
    <div className="container compare-page">
      <h1>Compare Companies</h1>
      <p className="compare-subtitle">
        Pick two companies to see which LeetCode problems they both ask — sorted by combined frequency.
      </p>

      <div className="compare-pickers">
        <CompanyPicker
          label="Company A"
          companies={companies}
          selected={companyA}
          exclude={companyB?.slug}
          onSelect={setCompanyA}
        />
        <div className="compare-vs" aria-hidden="true">vs</div>
        <CompanyPicker
          label="Company B"
          companies={companies}
          selected={companyB}
          exclude={companyA?.slug}
          onSelect={setCompanyB}
        />
      </div>

      {bothPicked && (
        <div className="compare-results">
          {loading && <p className="compare-loading">Loading question data…</p>}

          {!loading && fullA && fullB && (
            <>
              <div className="compare-summary">
                <span>
                  <strong>{fullA.displayName}</strong> — {fullA.questions.length} questions
                </span>
                <span className="compare-overlap-count">
                  <strong>{overlap.length}</strong> in common
                </span>
                <span>
                  <strong>{fullB.displayName}</strong> — {fullB.questions.length} questions
                </span>
              </div>

              {overlap.length === 0 ? (
                <p className="compare-empty">
                  No overlapping questions found between {fullA.displayName} and {fullB.displayName}.
                </p>
              ) : (
                <div className="question-table-wrap">
                  <table className="question-table" aria-label="Overlapping questions">
                    <thead>
                      <tr>
                        <th scope="col" className="th-num">No.</th>
                        <th scope="col">Problem</th>
                        <th scope="col" className="th-diff">Difficulty</th>
                        <th scope="col" className="th-freq">{fullA.displayName} %</th>
                        <th scope="col" className="th-freq">{fullB.displayName} %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overlap.map(q => (
                        <tr key={q.id}>
                          <td className="td-num">{q.id ?? '—'}</td>
                          <td className="td-title">
                            <a
                              href={q.leetcode_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="compare-q-link"
                            >
                              {q.title}
                            </a>
                          </td>
                          <td><DifficultyBadge difficulty={q.difficulty} /></td>
                          <td className="td-freq">
                            <span className="compare-freq">{q.freqA.toFixed(1)}%</span>
                          </td>
                          <td className="td-freq">
                            <span className="compare-freq">{q.freqB.toFixed(1)}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!bothPicked && (
        <p className="compare-hint">Select two companies above to see their overlapping questions.</p>
      )}
    </div>
  );
}

/* ── Company Picker ── */
function CompanyPicker({
  label,
  companies,
  selected,
  exclude,
  onSelect,
}: {
  label: string;
  companies: CompanyIndex[];
  selected: CompanyIndex | null;
  exclude?: string;
  onSelect: (c: CompanyIndex | null) => void;
}) {
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState<CompanyIndex[]>([]);
  const [isOpen, setIsOpen]  = useState(false);

  const fuseRef     = useRef<unknown>(null);
  const fuseLoaded  = useRef(false);
  const inputRef    = useRef<HTMLInputElement>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);

  const loadFuse = useCallback(async () => {
    if (fuseLoaded.current) return;
    const Fuse = (await import('fuse.js')).default;
    fuseRef.current = new Fuse(companies, {
      keys: ['displayName', 'slug'],
      threshold: 0.35,
      ignoreLocation: true,
    });
    fuseLoaded.current = true;
  }, [companies]);

  const doSearch = useCallback((val: string) => {
    const q = val.trim();
    if (!q || !fuseRef.current) { setResults([]); setIsOpen(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (fuseRef.current as any).search(q)
      .map((r: { item: CompanyIndex }) => r.item)
      .filter((c: CompanyIndex) => c.slug !== exclude)
      .slice(0, 7);
    setResults(res);
    setIsOpen(res.length > 0);
  }, [exclude]);

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (selected) {
    return (
      <div className="picker-wrap">
        <div className="picker-label">{label}</div>
        <div className="picker-selected">
          <CompanyLogo logo={selected.logo} displayName={selected.displayName} size="sm" />
          <span className="picker-selected-name">{selected.displayName}</span>
          <button
            type="button"
            className="picker-clear"
            onClick={() => onSelect(null)}
            aria-label={`Remove ${selected.displayName}`}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="picker-wrap" ref={wrapRef}>
      <div className="picker-label">{label}</div>
      <input
        ref={inputRef}
        type="search"
        className="picker-input"
        placeholder="Search company…"
        value={query}
        onChange={e => { setQuery(e.target.value); doSearch(e.target.value); }}
        onFocus={async () => { await loadFuse(); doSearch(query); }}
      />
      {isOpen && (
        <div className="picker-dropdown">
          {results.map(c => (
            <button
              key={c.slug}
              type="button"
              className="picker-option"
              onClick={() => { onSelect(c); setQuery(''); setIsOpen(false); }}
            >
              <CompanyLogo logo={c.logo} displayName={c.displayName} size="sm" />
              <span className="picker-option-name">{c.displayName}</span>
              <span className="picker-option-count">{c.questionCount}q</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
