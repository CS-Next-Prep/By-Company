import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — CS-Next ByCompany',
};

export default function NotFound() {
  return (
    <div className="container not-found-page">
      <p className="not-found-code">404</p>
      <h1>Page not found</h1>
      <p>That company or page doesn&apos;t exist in our index.</p>
      <Link href="/" className="not-found-link">← Back to company index</Link>
    </div>
  );
}
