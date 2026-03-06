import {defer} from '@netlify/remix-runtime';
import {useLoaderData, Link} from '@remix-run/react';
import {useTheme} from '~/components/PageLayout';

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  {title: `Ljud & Bild Hörnan | ${data?.page.title ?? ''}`},
];

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context, params}) {
  if (!params.handle) throw new Error('Missing page handle');

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {handle: params.handle},
    }),
  ]);

  if (!page) throw new Response('Not Found', {status: 404});

  return {page};
}

function loadDeferredData() {
  return {};
}

export default function Page() {
  const {page} = useLoaderData();
  const {theme} = useTheme();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Montserrat:wght@300;400;500;600&display=swap');

        /* ── Theme variables ── */
        .sp-page[data-theme="dark"] {
          --sp-bg:              #111;
          --sp-bg-header:       #141414;
          --sp-heading:         #fff;
          --sp-text:            rgba(255,255,255,0.5);
          --sp-strong:          rgba(255,255,255,0.7);
          --sp-em:              rgba(255,255,255,0.45);
          --sp-border:          rgba(255,255,255,0.06);
          --sp-border-faint:    rgba(255,255,255,0.04);
          --sp-border-table:    rgba(255,255,255,0.08);
          --sp-hr:              rgba(255,255,255,0.07);
          --sp-accent:          #7AC9EF;
          --sp-accent-border:   rgba(122,201,239,0.3);
          --sp-breadcrumb:      rgba(255,255,255,0.25);
          --sp-breadcrumb-sep:  rgba(255,255,255,0.12);
          --sp-breadcrumb-cur:  rgba(255,255,255,0.45);
          --sp-th-color:        rgba(255,255,255,0.25);
          --sp-td-color:        rgba(255,255,255,0.5);
          --sp-tr-hover:        rgba(255,255,255,0.02);
          --sp-ol-marker:       rgba(255,255,255,0.2);
          --sp-blockquote-text: rgba(255,255,255,0.5);
          --sp-img-border:      rgba(255,255,255,0.06);
        }

        .sp-page[data-theme="light"] {
          --sp-bg:              #f5f5f3;
          --sp-bg-header:       #ebebea;
          --sp-heading:         #111;
          --sp-text:            rgba(30,30,30,0.8);
          --sp-strong:          rgba(30,30,30,0.8);
          --sp-em:              rgba(30,30,30,0.5);
          --sp-border:          rgba(0,0,0,0.07);
          --sp-border-faint:    rgba(0,0,0,0.05);
          --sp-border-table:    rgba(0,0,0,0.09);
          --sp-hr:              rgba(0,0,0,0.08);
          --sp-accent:          #2a8ab5;
          --sp-accent-border:   rgba(42,138,181,0.3);
          --sp-breadcrumb:      rgba(30,30,30,0.3);
          --sp-breadcrumb-sep:  rgba(30,30,30,0.15);
          --sp-breadcrumb-cur:  rgba(30,30,30,0.55);
          --sp-th-color:        rgba(30,30,30,0.35);
          --sp-td-color:        rgba(30,30,30,0.6);
          --sp-tr-hover:        rgba(0,0,0,0.02);
          --sp-ol-marker:       rgba(30,30,30,0.25);
          --sp-blockquote-text: rgba(30,30,30,0.5);
          --sp-img-border:      rgba(0,0,0,0.07);
        }

        /* ── Footer push fix ── */
        #root, .root-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        main, .main-content { flex: 1; }

        /* ── Page wrapper ── */
        .sp-page {
          background: var(--sp-bg);
          min-height: calc(100vh - 110px);
          font-family: 'Montserrat', sans-serif;
          display: flex;
          flex-direction: column;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* ── Page header banner ── */
        .sp-header {
          background: var(--sp-bg-header);
          border-bottom: 1px solid var(--sp-border);
          padding: 64px 48px 48px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .sp-header { padding: 48px 24px 36px; }
        }

        .sp-header-inner {
          max-width: 800px;
          margin: 0 auto;
        }

        .sp-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .sp-breadcrumb a {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sp-breadcrumb);
          text-decoration: none;
          transition: color 0.15s;
        }

        .sp-breadcrumb a:hover { color: var(--sp-accent); }

        .sp-breadcrumb-sep {
          font-size: 10px;
          color: var(--sp-breadcrumb-sep);
        }

        .sp-breadcrumb-cur {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sp-breadcrumb-cur);
        }

        .sp-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--sp-accent);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .sp-label::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: var(--sp-accent);
        }

        .sp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 300;
          color: var(--sp-heading);
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        /* ── Body content ── */
        .sp-body {
          flex: 1;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
          padding: 64px 48px 96px;
        }

        @media (max-width: 768px) {
          .sp-body { padding: 48px 24px 72px; }
        }

        /* ── Rich text styles ── */
        .sp-body h1,
        .sp-body h2,
        .sp-body h3,
        .sp-body h4 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          color: var(--sp-heading);
          line-height: 1.2;
          margin: 2em 0 0.6em;
        }

        .sp-body h1 { font-size: clamp(28px, 3.5vw, 42px); }
        .sp-body h2 { font-size: clamp(22px, 2.8vw, 34px); }
        .sp-body h3 { font-size: clamp(18px, 2.2vw, 26px); }
        .sp-body h4 { font-size: 18px; }

        .sp-body h1:first-child,
        .sp-body h2:first-child,
        .sp-body h3:first-child { margin-top: 0; }

        .sp-body p {
          font-size: 14px;
          font-weight: 300;
          line-height: 1.9;
          color: var(--sp-text);
          margin-bottom: 1.4em;
        }

        .sp-body p:last-child { margin-bottom: 0; }

        .sp-body a {
          color: var(--sp-accent);
          text-decoration: none;
          border-bottom: 1px solid var(--sp-accent-border);
          transition: border-color 0.15s;
        }

        .sp-body a:hover { border-color: var(--sp-accent); }

        .sp-body strong,
        .sp-body b {
          font-weight: 500;
          color: var(--sp-strong);
        }

        .sp-body em,
        .sp-body i {
          font-style: italic;
          color: var(--sp-em);
        }

        .sp-body hr {
          border: none;
          border-top: 1px solid var(--sp-hr);
          margin: 3em 0;
          position: relative;
        }

        .sp-body hr::after {
          content: '';
          position: absolute;
          left: 0;
          top: -1px;
          width: 32px;
          height: 1px;
          background: var(--sp-accent);
          opacity: 0.5;
        }

        .sp-body ul,
        .sp-body ol {
          padding-left: 20px;
          margin-bottom: 1.4em;
        }

        .sp-body li {
          font-size: 14px;
          font-weight: 300;
          line-height: 1.8;
          color: var(--sp-text);
          margin-bottom: 0.4em;
        }

        .sp-body ul li::marker { color: var(--sp-accent); }
        .sp-body ol li::marker { color: var(--sp-ol-marker); }

        .sp-body blockquote {
          border-left: 2px solid var(--sp-accent);
          margin: 2em 0;
          padding: 8px 0 8px 24px;
        }

        .sp-body blockquote p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 300;
          font-style: italic;
          color: var(--sp-blockquote-text);
          line-height: 1.6;
        }

        .sp-body img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 1.5em 0;
          display: block;
          border: 1px solid var(--sp-img-border);
        }

        .sp-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 2em 0;
          font-size: 13px;
        }

        .sp-body th {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--sp-th-color);
          padding: 12px 16px;
          border-bottom: 1px solid var(--sp-border-table);
          text-align: left;
        }

        .sp-body td {
          font-size: 13px;
          font-weight: 300;
          color: var(--sp-td-color);
          padding: 12px 16px;
          border-bottom: 1px solid var(--sp-border-faint);
        }

        .sp-body tr:hover td {
          background: var(--sp-tr-hover);
        }
      `}</style>

      <div className="sp-page" data-theme={theme}>

        {/* Header */}
        <div className="sp-header">
          <div className="sp-header-inner">
            <nav className="sp-breadcrumb">
              <Link to="/">Hem</Link>
              <span className="sp-breadcrumb-sep">›</span>
              <span className="sp-breadcrumb-cur">{page.title}</span>
            </nav>
            <div className="sp-label">Sida</div>
            <h1 className="sp-title">{page.title}</h1>
          </div>
        </div>

        {/* Body content from Shopify */}
        <div
          className="sp-body"
          dangerouslySetInnerHTML={{__html: page.body}}
        />

      </div>
    </>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('@netlify/remix-runtime').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */