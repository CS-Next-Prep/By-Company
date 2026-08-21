import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — CS-Next ByCompany',
  description: 'About the CS-Next ByCompany project.',
};

export default function AboutPage() {
  return (
    <div className="container about-page">
      <h1>About ByCompany</h1>



      <section className="about-section">
        <h2>What this is</h2>
        <p>
          ByCompany is a static lookup tool built by CS-Next. Pick a company, see
          which LeetCode problems they&apos;ve historically asked in interviews. That&apos;s it.
        </p>
      </section>

      <section className="about-section">
        <h2>Sources and boundaries</h2>
        <p>
          The current static dataset is built from the public{' '}
          <a href="https://github.com/snehasishroy/leetcode-companywise-interview-questions" target="_blank" rel="noopener noreferrer">
            snehasishroy/leetcode-companywise-interview-questions
          </a>{' '}
          repository, which describes its snapshot as of July 12, 2026. The upstream
          repository does not list a LICENSE file in its root, so this attribution is
          not a license grant. ByCompany is not affiliated with LeetCode.
        </p>
      </section>

      <section className="about-section">
        <h2>About CS-Next</h2>
        <p>
          CS-Next is a student-run club committed to the pursuit of excellence in
          computer science and technical interview preparation.
        </p>
        <p><em>&ldquo;For the pursuit of excellence.&rdquo;</em></p>
      </section>

      <section className="about-section">
        <h2>Contribute or report an issue</h2>
        <p>
          The source code for this site is open. If you find incorrect data, a broken
          logo, or want to suggest an improvement, please{' '}
          <a href="https://github.com/CS-Next-Prep/ByCompany/issues" target="_blank" rel="noopener noreferrer">
            open a GitHub issue
          </a>
          .
        </p>
      </section>
    </div>
  );
}
