/**
 * Question page — lists all companies that asked a specific LeetCode problem,
 * sorted by frequency (highest first).
 *
 * Route: /question/[id]/
 * Statically generated at build time from companies.json.
 *
 * Issue #21: selecting a question in the search dropdown navigates here.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getQuestion, getAllQuestionIds } from '@/lib/data';
import CompanyLogo from '@/components/CompanyLogo';
import DifficultyBadge from '@/components/DifficultyBadge';
import { getQuestionTopics } from '@/lib/question-topics';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const ids = getAllQuestionIds();
  return ids.map(id => ({ id: String(id) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const question = getQuestion(Number(id));
  if (!question) return {};
  return {
    title: `${question.title} — Asked by ${question.companyCount} Companies | CS-Next ByCompany`,
    description: `See which companies asked "${question.title}" (LeetCode #${question.id}). ${question.companyCount} companies, ${question.difficulty} difficulty.`,
  };
}

export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params;
  const question = getQuestion(Number(id));

  if (!question) notFound();

  const topics = getQuestionTopics(question.title);

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="container">
          <Link href="/" className="back-link" aria-label="Back to company index">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            All companies
          </Link>

          <div className="page-header-inner">
            <div>
              <div className="question-page-eyebrow">
                <span className="question-page-id">#{question.id}</span>
                <DifficultyBadge difficulty={question.difficulty} />
              </div>
              <h1 className="question-page-title">{question.title}</h1>

              {topics.length > 0 && (
                <div className="question-tags" aria-label="Topic tags" style={{ marginBottom: '0.6rem' }}>
                  {topics.map(t => (
                    <span key={t} className="question-tag">{t}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <p className="company-summary" aria-label="Question stats" style={{ margin: 0 }}>
                  <span className="company-summary-item">
                    Asked by <strong>{question.companyCount}</strong> {question.companyCount === 1 ? 'company' : 'companies'}
                  </span>
                </p>
                {question.leetcode_url && (
                  <a
                    href={question.leetcode_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="panel-lc-btn"
                    style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
                  >
                    Open on LeetCode ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company table */}
      <div className="container company-page-body">
        <table className="question-company-table" aria-label={`Companies that asked ${question.title}`}>
          <thead>
            <tr>
              <th>Company</th>
              <th className="th-freq">Frequency</th>
            </tr>
          </thead>
          <tbody>
            {question.companies.map(c => (
              <tr key={c.slug}>
                <td>
                  <Link href={`/company/${c.slug}/`} className="question-company-link">
                    <CompanyLogo logo={c.logo} displayName={c.displayName} size="sm" />
                    <span>{c.displayName}</span>
                  </Link>
                </td>
                <td className="td-freq">
                  <span className="freq-bar-wrap" aria-label={`${c.frequency}% frequency`}>
                    <span
                      className="freq-bar"
                      style={{ width: `${Math.max(4, c.frequency)}%` }}
                      aria-hidden="true"
                    />
                    <span className="freq-label">{c.frequency.toFixed(0)}%</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
