import {defer} from '@netlify/remix-runtime';
import {useLoaderData, Link} from '@remix-run/react';

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  {title: `${data?.page.title ?? ''} | Butiken`},
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Montserrat:wght@300;400;500;600&display=swap');

        /* ── Footer push fix ── */
        /* Ensures the page fills the viewport so the footer is always at the bottom */
        #root, .root-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        main, .main-content {
          flex: 1;
        }

        /* ── Page wrapper ── */
        .sp-page {
          background: #111;
          min-height: calc(100vh - 110px); /* 110px = header height */
          font-family: 'Montserrat', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Page header banner ── */
        .sp-header {
          background: #141414;
          border-bottom: 1px solid rgba(255,255,255,0.06);
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
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          transition: color 0.15s;
        }

        .sp-breadcrumb a:hover { color: #7AC9EF; }

        .sp-breadcrumb-sep {
          font-size: 10px;
          color: rgba(255,255,255,0.12);
        }

        .sp-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #7AC9EF;
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
          background: #7AC9EF;
        }

        .sp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 300;
          color: #fff;
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        /* ── Body content ── */
        .sp-body {
          flex: 1;                  /* ← this is what pushes the footer down */
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
          padding: 64px 48px 96px;
        }

        @media (max-width: 768px) {
          .sp-body { padding: 48px 24px 72px; }
        }

        /* ── Rich text styles for Shopify page body ── */
        .sp-body h1,
        .sp-body h2,
        .sp-body h3,
        .sp-body h4 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          color: #fff;
          line-height: 1.2;
          margin: 2em 0 0.6em;
        }

        .sp-body h1 { font-size: clamp(28px, 3.5vw, 42px); }
        .sp-body h2 { font-size: clamp(22px, 2.8vw, 34px); }
        .sp-body h3 { font-size: clamp(18px, 2.2vw, 26px); }
        .sp-body h4 { font-size: 18px; }

        .sp-body h1:first-child,
        .sp-body h2:first-child,
        .sp-body h3:first-child {
          margin-top: 0;
        }

        .sp-body p {
          font-size: 14px;
          font-weight: 300;
          line-height: 1.9;
          color: rgba(255,255,255,0.5);
          margin-bottom: 1.4em;
        }

        .sp-body p:last-child { margin-bottom: 0; }

        .sp-body a {
          color: #7AC9EF;
          text-decoration: none;
          border-bottom: 1px solid rgba(122,201,239,0.3);
          transition: border-color 0.15s;
        }

        .sp-body a:hover { border-color: #7AC9EF; }

        .sp-body strong, .sp-body b {
          font-weight: 500;
          color: rgba(255,255,255,0.7);
        }

        .sp-body em, .sp-body i {
          font-style: italic;
          color: rgba(255,255,255,0.45);
        }

        .sp-body hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.07);
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
          background: #7AC9EF;
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
          color: rgba(255,255,255,0.5);
          margin-bottom: 0.4em;
        }

        .sp-body ul li::marker { color: #7AC9EF; }
        .sp-body ol li::marker { color: rgba(255,255,255,0.2); }

        .sp-body blockquote {
          border-left: 2px solid #7AC9EF;
          margin: 2em 0;
          padding: 8px 0 8px 24px;
        }

        .sp-body blockquote p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 300;
          font-style: italic;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
        }

        .sp-body img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 1.5em 0;
          display: block;
          border: 1px solid rgba(255,255,255,0.06);
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
          color: rgba(255,255,255,0.25);
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          text-align: left;
        }

        .sp-body td {
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,0.5);
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .sp-body tr:hover td {
          background: rgba(255,255,255,0.02);
        }
      `}</style>

      <div className="sp-page">

        {/* Header */}
        <div className="sp-header">
          <div className="sp-header-inner">
            <nav className="sp-breadcrumb">
              <Link to="/">Hem</Link>
              <span className="sp-breadcrumb-sep">›</span>
              <span style={{fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)'}}>
                {page.title}
              </span>
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