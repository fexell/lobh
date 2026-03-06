import {defer} from '@netlify/remix-runtime';
import {Link, useLoaderData} from '@remix-run/react';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {useTheme} from '~/components/PageLayout';

/** @type {MetaFunction} */
export const meta = () => [{title: 'Blogg | Butiken'}];

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context, request}) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 10});
  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {variables: {...paginationVariables}}),
  ]);
  return {blogs};
}

function loadDeferredData() {
  return {};
}

export default function Blogs() {
  const {blogs} = useLoaderData();
  const {theme} = useTheme();

  return (
    <>
      <style>{`
        /* ── Theme variables ── */
        .bl-page[data-theme="dark"] {
          --bl-bg:              #111;
          --bl-bg-header:       #141414;
          --bl-bg-card:         #1a1a1a;
          --bl-bg-card-hover:   #1e1e1e;
          --bl-heading:         #fff;
          --bl-heading-hover:   rgba(255,255,255,0.85);
          --bl-subtitle:        rgba(255,255,255,0.25);
          --bl-border:          rgba(255,255,255,0.06);
          --bl-accent:          #7AC9EF;
          --bl-card-desc:       rgba(255,255,255,0.3);
          --bl-cta-color:       rgba(255,255,255,0.2);
          --bl-cta-arrow:       rgba(255,255,255,0.15);
          --bl-empty-icon:      rgba(255,255,255,0.05);
          --bl-empty-title:     rgba(255,255,255,0.3);
        }

        .bl-page[data-theme="light"] {
          --bl-bg:              #f5f5f3;
          --bl-bg-header:       #ebebea;
          --bl-bg-card:         #fff;
          --bl-bg-card-hover:   #f9f9f8;
          --bl-heading:         #111;
          --bl-heading-hover:   rgba(30,30,30,0.75);
          --bl-subtitle:        rgba(30,30,30,0.35);
          --bl-border:          rgba(0,0,0,0.07);
          --bl-accent:          #2a8ab5;
          --bl-card-desc:       rgba(30,30,30,0.4);
          --bl-cta-color:       rgba(30,30,30,0.25);
          --bl-cta-arrow:       rgba(30,30,30,0.15);
          --bl-empty-icon:      rgba(0,0,0,0.05);
          --bl-empty-title:     rgba(30,30,30,0.3);
        }

        /* ── Base ── */
        .bl-page {
          background: var(--bl-bg);
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          display: flex;
          flex-direction: column;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* ── Header ── */
        .bl-header {
          background: var(--bl-bg-header);
          border-bottom: 1px solid var(--bl-border);
          padding: 64px 48px 48px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .bl-header { padding: 48px 24px 36px; }
        }

        .bl-header-inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .bl-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--bl-accent);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .bl-label::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: var(--bl-accent);
        }

        .bl-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 300;
          color: var(--bl-heading);
          margin: 0 0 10px;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .bl-subtitle {
          font-size: 12px;
          font-weight: 300;
          color: var(--bl-subtitle);
          letter-spacing: 0.06em;
        }

        /* ── Body ── */
        .bl-body {
          flex: 1;
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          padding: 56px 48px 96px;
        }

        @media (max-width: 768px) {
          .bl-body { padding: 40px 24px 72px; }
        }

        /* ── Blog list ── */
        .bl-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        /* ── Blog card ── */
        .bl-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          padding: 32px 36px;
          background: var(--bl-bg-card);
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: background 0.2s;
        }

        .bl-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 2px;
          background: var(--bl-accent);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bl-card:hover { background: var(--bl-bg-card-hover); }
        .bl-card:hover::before { transform: scaleY(1); }

        @media (max-width: 640px) {
          .bl-card { padding: 24px; flex-direction: column; align-items: flex-start; gap: 16px; }
        }

        .bl-card-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .bl-card-tag {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--bl-accent);
        }

        .bl-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(22px, 2.8vw, 32px);
          font-weight: 300;
          color: var(--bl-heading);
          line-height: 1.2;
          letter-spacing: -0.01em;
          transition: color 0.2s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bl-card:hover .bl-card-title { color: var(--bl-heading-hover); }

        .bl-card-desc {
          font-size: 12px;
          font-weight: 300;
          color: var(--bl-card-desc);
          line-height: 1.6;
          letter-spacing: 0.02em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Arrow CTA */
        .bl-card-cta {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--bl-cta-color);
          transition: color 0.2s, gap 0.2s;
          white-space: nowrap;
        }

        .bl-card-cta-arrow {
          width: 32px;
          height: 1px;
          background: var(--bl-cta-arrow);
          position: relative;
          transition: width 0.25s ease, background 0.2s;
        }

        .bl-card-cta-arrow::after {
          content: '';
          position: absolute;
          right: 0;
          top: -3px;
          width: 6px;
          height: 6px;
          border-right: 1px solid var(--bl-cta-arrow);
          border-top: 1px solid var(--bl-cta-arrow);
          transform: rotate(45deg);
          transition: border-color 0.2s;
        }

        .bl-card:hover .bl-card-cta            { color: var(--bl-accent); }
        .bl-card:hover .bl-card-cta-arrow      { width: 48px; background: var(--bl-accent); }
        .bl-card:hover .bl-card-cta-arrow::after { border-color: var(--bl-accent); }

        /* ── Empty state ── */
        .bl-empty {
          text-align: center;
          padding: 120px 24px;
        }

        .bl-empty-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 72px;
          color: var(--bl-empty-icon);
          line-height: 1;
          margin-bottom: 20px;
        }

        .bl-empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 300;
          color: var(--bl-empty-title);
        }
      `}</style>

      <div className="bl-page" data-theme={theme}>

        {/* Header */}
        <div className="bl-header">
          <div className="bl-header-inner">
            <div className="bl-label">Redaktion</div>
            <h1 className="bl-title">Blogg</h1>
            <p className="bl-subtitle">Nyheter, guider och inspiration</p>
          </div>
        </div>

        {/* List */}
        <div className="bl-body">
          <div className="bl-list">
            <PaginatedResourceSection connection={blogs}>
              {({node: blog}) => (
                <Link
                  className="bl-card"
                  key={blog.handle}
                  prefetch="intent"
                  to={`/blogs/${blog.handle}`}
                >
                  <div className="bl-card-left">
                    <div className="bl-card-tag">Blogg</div>
                    <h2 className="bl-card-title">{blog.title}</h2>
                    {blog.seo?.description && (
                      <p className="bl-card-desc">{blog.seo.description}</p>
                    )}
                  </div>
                  <div className="bl-card-cta">
                    Läs mer
                    <span className="bl-card-cta-arrow" />
                  </div>
                </Link>
              )}
            </PaginatedResourceSection>
          </div>
        </div>

      </div>
    </>
  );
}

const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
`;

/** @typedef {import('@netlify/remix-runtime').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */