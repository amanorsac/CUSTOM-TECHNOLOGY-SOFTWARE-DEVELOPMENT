// Shared SEO helpers: JSON-LD tags, the home page structured data, and the
// generic "make head URLs absolute" HTML pass (Ruling K).

// JSON-LD inside <script>: escape < > & so no value can close the tag.
export function jsonLdTag(data) {
  const json = JSON.stringify(data).replace(/[<>&]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  return `<script type="application/ld+json">${json}</script>`;
}

const NAME = 'Custom Technology & Software Development';

export function homeJsonLd(origin) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: NAME,
      alternateName: 'CTSD',
      url: `${origin}/`,
      logo: `${origin}/assets/brand/logo.svg`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: NAME,
      url: `${origin}/`,
      image: `${origin}/assets/brand/og-default.jpg`,
      areaServed: 'US',
      serviceType: [
        'Websites', 'Mobile Applications', 'Ecommerce', 'CRM', 'Client Portals', 'Dashboards',
        'Booking Systems', 'Membership Systems', 'API Integrations', 'Payments', 'Automation',
        'Authentication', 'Cloud Systems',
      ],
    },
  ];
}

// Headers for every HTML response. CSP is frame-ancestors only (no clickjacking);
// a script-src would break the forms' inline onload/onerror handlers.
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "frame-ancestors 'none'",
};

export function setSecurityHeaders(headers) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
  return headers;
}

const ABSOLUTIZE = [
  ['link[rel="canonical"]', 'href'],
  ['meta[property="og:url"]', 'content'],
  ['meta[property="og:image"]', 'content'],
  ['meta[name="twitter:image"]', 'content'],
];

// Root-relative values become absolute against the request origin; anything
// already absolute (or protocol-relative) is left alone.
export function absolutizeHtml(res, url, { home = false } = {}) {
  const abs = (v) => (v && v.startsWith('/') && !v.startsWith('//') ? new URL(v, url.origin).href : v);
  let rw = new HTMLRewriter();
  for (const [selector, attr] of ABSOLUTIZE) {
    rw = rw.on(selector, {
      element(el) {
        const v = el.getAttribute(attr);
        const a = abs(v);
        if (a !== v) el.setAttribute(attr, a);
      },
    });
  }
  if (home) {
    rw = rw.on('head', {
      element(el) {
        for (const block of homeJsonLd(url.origin)) el.append(jsonLdTag(block), { html: true });
      },
    });
  }
  const out = rw.transform(res);
  // The body length changes; drop validators that no longer match.
  const headers = new Headers(out.headers);
  headers.delete('content-length');
  headers.delete('etag');
  setSecurityHeaders(headers);
  return new Response(out.body, { status: out.status, statusText: out.statusText, headers });
}
