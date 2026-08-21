'use client';

/**
 * SiteHeader — company-only search.
 * Questions search removed per user request (tab switching caused UX confusion).
 * Compare page added to nav.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CompanyLogo from './CompanyLogo';


interface CompanyIndex {
  slug: string;
  displayName: string;
  logo: string | null;
  questionCount: number;
}

export default function SiteHeader({ companies }: { companies: CompanyIndex[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CompanyIndex[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [ready, setReady] = useState(false);

  const fuseRef = useRef<unknown>(null);
  const fuseLoaded = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  const loadFuse = useCallback(async () => {
    if (fuseLoaded.current) return;
    const Fuse = (await import('fuse.js')).default;
    fuseRef.current = new Fuse(companies, {
      keys: ['displayName', 'slug'],
      threshold: 0.35,
      includeScore: true,
      ignoreLocation: true,
    });
    fuseLoaded.current = true;
    setReady(true);
  }, [companies]);

  const search = useCallback((value: string) => {
    const q = value.trim();
    if (!q || !fuseRef.current) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (fuseRef.current as any).search(q).slice(0, 8)
      .map((r: { item: CompanyIndex }) => r.item);
    setResults(res);
    setIsOpen(res.length > 0);
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
    setResults([]);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      closeSearch();
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && results.length > 0) {
      router.push(`/company/${results[0].slug}/`);
      closeSearch();
    }
  };

  const showDropdown = isFocused && (isOpen || (query.trim().length > 0 && ready));

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
            placeholder="Search companies…"
            value={query}
            aria-label="Search companies"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls="search-results"
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
              aria-label="Company search results"
            >
              {results.map(c => (
                <Link
                  key={c.slug}
                  href={`/company/${c.slug}/`}
                  className="search-result-item"
                  role="option"
                  aria-selected="false"
                  onClick={closeSearch}
                >
                  <CompanyLogo logo={c.logo} displayName={c.displayName} size="sm" />
                  <span className="search-result-name">{highlightMatch(c.displayName, query.trim())}</span>
                  <span className="search-result-count">{c.questionCount} questions</span>
                </Link>
              ))}

              {query.trim() && results.length === 0 && ready && (
                <div className="search-empty">No companies found for &ldquo;{query}&rdquo;</div>
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
