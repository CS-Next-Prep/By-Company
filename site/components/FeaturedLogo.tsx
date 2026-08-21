'use client';

/**
 * FeaturedLogo — larger logo variant for the featured companies grid on home page.
 * Uses a 3×3rem box with img fallback to monogram on error.
 */

interface FeaturedLogoProps {
  logo: string | null;
  displayName: string;
}

export default function FeaturedLogo({ logo, displayName }: FeaturedLogoProps) {
  const initials = displayName
    .split(/[\s\-]+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <div className="featured-logo-wrap" aria-hidden="true">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={`${displayName} logo`}
          loading="lazy"
          onError={e => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling;
            if (fallback) (fallback as HTMLElement).style.display = 'block';
          }}
        />
      ) : null}
      <span
        className="featured-monogram"
        style={{ display: logo ? 'none' : 'block' }}
      >
        {initials}
      </span>
    </div>
  );
}
