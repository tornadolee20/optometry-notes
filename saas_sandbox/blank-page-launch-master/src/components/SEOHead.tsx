import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown>[];
  noIndex?: boolean;
}

export const SEOHead = ({
  title,
  description,
  canonical = "https://myownreviews.com",
  ogImage = "https://myownreviews.com/og-image.png",
  ogType = "website",
  jsonLd = [],
  noIndex = false,
}: SEOHeadProps) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noIndex && <meta name="robots" content="noindex, nofollow" />}

    {/* Open Graph */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:type" content={ogType} />

    {/* Twitter Card */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />

    {/* JSON-LD */}
    {jsonLd.map((data, i) => (
      <script key={i} type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    ))}
  </Helmet>
);
