import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About & Sources — CS-Next ByCompany',
  description: 'About the CS-Next ByCompany project, its data sources, and its relationship to LeetCode.',
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
        <h2>Our relationship to LeetCode</h2>
        <p>
          ByCompany is an independent, community-maintained project built by CS-Next.
          It is not affiliated with, endorsed by, or sponsored by LeetCode in any way.
          &ldquo;LeetCode&rdquo; and any associated names, logos, or marks belong to their
          respective owners. Any mention of LeetCode on this site exists solely to
          identify where a linked question originally comes from — not to claim any
          partnership or association with it.
        </p>
      </section>

      <section className="about-section">
        <h2>What this site does — and deliberately does not do</h2>
        <ul>
          <li>
            ByCompany stores and displays <strong>question metadata only</strong>: a
            question&apos;s title, difficulty, topic tags, the frequency it&apos;s been reported
            as asked by a given company (where available), and a direct link to that
            question&apos;s original page on leetcode.com.
          </li>
          <li>
            ByCompany does <strong>not</strong> reproduce, host, mirror, or paraphrase
            LeetCode&apos;s problem statements, examples, constraints, or any other original
            written content. To read a problem in full, use the link provided to view it
            on LeetCode&apos;s own site.
          </li>
          <li>
            ByCompany does <strong>not</strong> scrape leetcode.com. The
            company-to-question associations shown here are compiled from publicly
            available, community-maintained datasets, built from individually
            self-reported interview experiences that candidates chose to share — not
            extracted from any private or paid LeetCode feature.
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Sources</h2>
        <p>
          This project&apos;s data comes from the following community-maintained
          repositories. We&apos;re grateful to their maintainers and contributors:
        </p>
        <ul>
          <li>
            <a
              href="https://github.com/snehasishroy/leetcode-companywise-interview-questions"
              target="_blank"
              rel="noopener noreferrer"
            >
              snehasishroy/leetcode-companywise-interview-questions
            </a>{' '}
            — No LICENSE file present in the repository root; used with attribution.
          </li>
        </ul>
        <p>
          If you maintain one of these repositories and have a concern about how your
          data is used here, please reach out using the contact details below.
        </p>
      </section>

      <section className="about-section">
        <h2>A note on accuracy</h2>
        <p>
          This data is community-sourced and may be incomplete, outdated, or
          occasionally inaccurate. It reflects reported interview experiences shared
          by past candidates — it is not an official, guaranteed, or current list of
          questions any company is using today.
        </p>
      </section>

      <section className="about-section">
        <h2>Reporting a concern or requesting removal</h2>
        <p>
          If you&apos;re a rights holder, represent a company mentioned on this site, or
          otherwise believe something here shouldn&apos;t be published, contact us at{' '}
          <a href="mailto:csnext.ideal@gmail.com">csnext.ideal@gmail.com</a>. We
          review every such request and will act on it promptly, including removing
          content where appropriate.
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
          <a href="https://github.com/CS-Next-Prep/By-Company/issues" target="_blank" rel="noopener noreferrer">
            open a GitHub issue
          </a>
          .
        </p>
      </section>
    </div>
  );
}
