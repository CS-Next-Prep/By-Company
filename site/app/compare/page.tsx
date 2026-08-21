import type { Metadata } from 'next';
import { getAllCompanies } from '@/lib/data';
import CompareClient from './CompareClient';

export const metadata: Metadata = {
  title: 'Compare Companies — CS-Next ByCompany',
  description: 'Pick two companies and see which LeetCode questions they both ask.',
};

export default function ComparePage() {
  const companies = getAllCompanies();
  return <CompareClient companies={companies} />;
}
