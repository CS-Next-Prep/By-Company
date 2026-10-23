/**
 * Company page — every question reported for one company.
 *
 * The page remains a static route. Sorting and filters are progressive
 * enhancements over the semantic table rendered below.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCompany, getAllSlugs } from '@/lib/data';
import CompanyLogo from '@/components/CompanyLogo';
import SortableQuestionTable from './SortableQuestionTable';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) return {};
  return {
    title: `${company.displayName} Interview Questions — CS-Next ByCompany`,
    description: `${company.questionCount} LeetCode questions asked by ${company.displayName}. Frequency-sorted. No login required.`,
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const company = getCompany(slug);

  if (!company) notFound();

  const easyCt = company.questions.filter(q => q.difficulty === 'Easy').length;
  const medCt = company.questions.filter(q => q.difficulty === 'Medium').length;
  const hardCt = company.questions.filter(q => q.difficulty === 'Hard').length;

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <Link href="/" className="back-link" aria-label="Back to company index">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            All companies
          </Link>

          <div className="page-header-inner">
            <CompanyLogo logo={company.logo} displayName={company.displayName} size="lg" />
            <div>
              <h1>{company.displayName}</h1>
              <p className="company-summary" aria-label="Question difficulty summary">
                <span className="company-summary-item company-summary-easy">{easyCt} Easy</span>
                <span className="company-summary-item company-summary-medium">{medCt} Medium</span>
                <span className="company-summary-item company-summary-hard">{hardCt} Hard</span>
                <span className="company-summary-item">{company.questionCount} total</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container company-page-body">
        <SortableQuestionTable questions={company.questions} companySlug={slug} />
      </div>
    </div>
  );
}
