'use client';

/**
 * CompanyLogo — renders a company's logo or a typographic monogram fallback.
 *
 * AGENTS.md Section 3.2:
 *   - MUST show real, high-quality official logo
 *   - MUST have graceful fallback (plain typographic monogram in Ink/Gold)
 *   - MUST NOT distort or recolor logos
 *   - MUST NOT use generic icons
 *
 * This is a client component because it needs the onError handler
 * to gracefully fall back from broken logo images to the monogram.
 */

interface CompanyLogoProps {
  logo: string | null;
  displayName: string;
  size?: 'sm' | 'lg';
}

export default function CompanyLogo({ logo, displayName, size = 'sm' }: CompanyLogoProps) {
  // Generate a 2-letter monogram from display name
  const initials = displayName
    .split(/[\s\-]+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <div className={`company-logo-wrap${size === 'lg' ? ' lg' : ''}`} aria-hidden="true">
      {logo ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={logo}
          alt={`${displayName} logo`}
          loading="lazy"
          onError={(e) => {
            // If logo fails to load, hide the img and show monogram
            const target = e.currentTarget;
            target.style.display = 'none';
            const monogram = target.nextElementSibling;
            if (monogram) (monogram as HTMLElement).style.display = 'block';
          }}
        />
      ) : null}
      <span
        className="company-monogram"
        style={{ display: logo ? 'none' : 'block' }}
        aria-label={`${displayName} monogram`}
      >
        {initials}
      </span>
    </div>
  );
}
