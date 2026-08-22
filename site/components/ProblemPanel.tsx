'use client';

/**
 * ProblemPanel — slide-in right panel showing full problem details
 * and the list of companies that have asked it.
 *
 * Opened by clicking a question row in SortableQuestionTable.
 * Data for "other companies" is lazily loaded from /data/questions-index.json
 * (generated at build time) — cached in a module-level promise so repeat
 * opens never re-fetch.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DifficultyBadge from './DifficultyBadge';

interface Company {
  slug: string;
  displayName: string;
  logo: string | null;
  frequency: number;
}

interface ProblemPanelProps {
  questionId: number | null;
  title: string;
  difficulty: string;
  frequency: number;
  maxFreq: number;
  leetcodeUrl: string;
  topics: string[];
  currentCompanySlug?: string;
  onClose: () => void;
}

// Module-level cache — loaded once per session, never re-fetched
let indexCache: Promise<{ questions: { id: number; companies: Company[] }[] }> | null = null;

function getQuestionsIndex() {
  if (!indexCache) {
    indexCache = fetch('/data/questions-index.json').then(r => r.json());
  }
  return indexCache;
}

export default function ProblemPanel({
  questionId,
  title,
  difficulty,
  frequency,
  maxFreq,
  leetcodeUrl,
  topics,
  currentCompanySlug,
  onClose,
}: ProblemPanelProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  // Animate out, then call onClose
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 220);
  }, [onClose]);

  // Load company data from index
  useEffect(() => {
    if (!questionId) { setLoading(false); return; }
    setLoading(true);
    getQuestionsIndex().then(data => {
      const entry = data.questions.find(q => q.id === questionId);
      setCompanies(entry?.companies ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [questionId]);

  // Keyboard close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  // Lock body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const freqPct = maxFreq > 0 ? Math.round((frequency / maxFreq) * 100) : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`panel-backdrop${closing ? ' closing' : ''}`}
        aria-hidden="true"
        onClick={handleClose}
      />

      {/* Slide-in panel */}
      <aside
        className={`problem-panel${closing ? ' closing' : ''}`}
        aria-label={`Problem details: ${title}`}
        role="complementary"
      >
        {/* Header */}
        <div className="panel-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="panel-problem-id">
              LeetCode {questionId ? `#${questionId}` : ''}
            </div>
            <h2 className="panel-title">{title}</h2>
          </div>
          <button
            type="button"
            className="panel-close"
            onClick={handleClose}
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        {/* Stats row */}
        <div className="panel-stats">
          <DifficultyBadge difficulty={difficulty} />
          <div className="panel-freq-wrap">
            <div className="panel-freq-bar">
              <div className="panel-freq-fill" style={{ width: `${freqPct}%` }} />
            </div>
            <span className="panel-freq-label">{frequency.toFixed(1)}% frequency</span>
          </div>
        </div>

        {/* Topic tags */}
        {topics.length > 0 && (
          <div className="panel-topics">
            {topics.map(t => (
              <span key={t} className="panel-topic-chip">{t}</span>
            ))}
          </div>
        )}

        {/* Open on LeetCode */}
        <div className="panel-lc-row">
          <a
            href={leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="panel-lc-btn"
          >
            Open on LeetCode ↗
          </a>
        </div>

        {/* Companies that asked this */}
        <div className="panel-section">
          <div className="panel-section-label">
            Asked by {loading ? '…' : `${companies.length} companies`}
          </div>

          {loading ? (
            <div className="panel-loading">Loading…</div>
          ) : (
            <div className="panel-companies">
              {companies.map(c => (
                <Link
                  key={c.slug}
                  href={`/company/${c.slug}/`}
                  className={`panel-company-row${c.slug === currentCompanySlug ? ' current' : ''}`}
                  onClick={handleClose}
                >
                  <PanelLogo logo={c.logo} displayName={c.displayName} />
                  <span className="panel-company-name">{c.displayName}</span>
                  <span className="panel-company-freq">{c.frequency.toFixed(1)}%</span>
                </Link>
              ))}
              {companies.length === 0 && (
                <p className="panel-empty">No company data found for this problem.</p>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/** Inline logo with monogram fallback */
function PanelLogo({ logo, displayName }: { logo: string | null; displayName: string }) {
  const initials = displayName.split(/[\s\-]+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <span className="panel-logo">
      {logo && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={`${displayName} logo`} loading="lazy" onError={() => setImgFailed(true)} />
      ) : (
        <span className="panel-logo-mono">{initials}</span>
      )}
    </span>
  );
}
