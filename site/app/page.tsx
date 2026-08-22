/**
 * Home page — featured companies + A–Z company index.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCompanies } from '@/lib/data';
import CompanyLogo from '@/components/CompanyLogo';
import FeaturedLogo from '@/components/FeaturedLogo';

export const metadata: Metadata = {
  title: 'ByCompany — CS-Next',
  description: 'Pick a company and see what they\'ve asked in interviews.',
};

const FEATURED_SLUGS = [
  'google', 'amazon', 'meta', 'apple',
  'microsoft', 'netflix', 'uber', 'linkedin',
  'airbnb', 'stripe', 'tiktok', 'nvidia',
];

export default function HomePage() {
  const companies = getAllCompanies();
  const companyMap = new Map(companies.map(c => [c.slug, c]));

  const grouped = companies.reduce<Record<string, typeof companies>>((acc, c) => {
    const letter = c.displayName[0]?.toUpperCase() || '#';
    const key = /[A-Z]/.test(letter) ? letter : '#';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div className="container home-shell">
      {/* Hero — simplified to one line per user request */}
      <section className="home-hero" aria-labelledby="home-title">
        <h1 id="home-title">Pick a company and see what they&apos;ve asked.</h1>
      </section>

      {/* Featured companies — no heading labels per user request */}
      <section className="featured-section" aria-label="Popular companies">
        <div className="featured-grid">
          {FEATURED_SLUGS.map(slug => {
            const company = companyMap.get(slug);
            if (!company) return null;
            return (
              <Link key={slug} href={`/company/${slug}/`} className="featured-card">
                <FeaturedLogo logo={company.logo} displayName={company.displayName} />
                <span className="featured-card-copy">
                  <span className="featured-name">{company.displayName}</span>
                  <span className="featured-count">{company.questionCount} questions</span>
                </span>
                <span className="featured-arrow" aria-hidden="true">↗</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* A–Z navigation — bigger letters via CSS */}
      <nav className="letter-index" aria-label="Jump to letter">
        <span className="letter-index-label">A–Z</span>
        {letters.map(letter => (
          <a key={letter} href={`#letter-${letter}`} aria-label={`Jump to ${letter}`}>
            {letter}
          </a>
        ))}
      </nav>

      <noscript>
        <p className="noscript-note">Search requires JavaScript. Browse the A–Z list below.</p>
      </noscript>

      {/* Full A–Z company list */}
      <section className="company-table-section" aria-label="Company index">
        {letters.map(letter => (
          <div key={letter} className="company-group">
            <span id={`letter-${letter}`} className="letter-anchor" aria-hidden="true" />
            <div className="letter-group-header" aria-label={`Companies starting with ${letter}`}>
              <span>{letter}</span>
              <span style={{ fontWeight: 400, fontSize: '0.75rem', opacity: 0.6 }}>
                {grouped[letter].length}
              </span>
            </div>
            {grouped[letter].map(company => (
              <Link
                key={company.slug}
                href={`/company/${company.slug}/`}
                className="company-row"
                aria-label={`${company.displayName} — ${company.questionCount} questions`}
              >
                <CompanyLogo logo={company.logo} displayName={company.displayName} size="sm" />
                <span className="company-row-name">{company.displayName}</span>
                <span className="company-row-count" aria-label={`${company.questionCount} questions`}>
                  {company.questionCount} questions
                </span>
                <span className="company-row-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
