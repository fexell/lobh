import {useLoaderData, Link} from '@remix-run/react';
import {defer, redirect} from '@netlify/remix-runtime';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {useTheme} from '~/components/PageLayout';

export const meta = () => [{title: 'Ljud & Bild Hörnan | Kollektioner'}];

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  /* return redirect('/maintenance', {status: 302}); */

  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context, request}) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
  ]);
  return {collections};
}

function loadDeferredData() {
  return {};
}

export default function Collections() {
  const {collections} = useLoaderData();
  const {theme} = useTheme();

  return (
    <>
      <style>{`
        /* ── Theme variables ── */
        .ci-page[data-theme="dark"] {
          --ci-bg:              #111;
          --ci-bg-header:       #141414;
          --ci-bg-card:         #1a1a1a;
          --ci-heading:         #fff;
          --ci-subtitle:        rgba(255,255,255,0.25);
          --ci-border:          rgba(255,255,255,0.06);
          --ci-accent:          #7AC9EF;
          --ci-noimg-icon:      rgba(122,201,239,0.08);
          --ci-noimg-grad:      linear-gradient(135deg, #1a1a1a 0%, #141414 100%);
          --ci-overlay:         linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%);
          --ci-overlay-hover:   linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.2) 100%);
          --ci-card-title:      #fff;
          --ci-card-arrow:      rgba(255,255,255,0.4);
          --ci-empty-icon:      rgba(255,255,255,0.05);
          --ci-empty-title:     rgba(255,255,255,0.3);
        }

        .ci-page[data-theme="light"] {
          --ci-bg:              #f5f5f3;
          --ci-bg-header:       #ebebea;
          --ci-bg-card:         #e0e0de;
          --ci-heading:         #111;
          --ci-subtitle:        rgba(30,30,30,0.35);
          --ci-border:          rgba(0,0,0,0.07);
          --ci-accent:          #2a8ab5;
          --ci-noimg-icon:      rgba(42,138,181,0.1);
          --ci-noimg-grad:      linear-gradient(135deg, #e8e8e6 0%, #deded c 100%);
          --ci-overlay:         linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.02) 100%);
          --ci-overlay-hover:   linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.15) 100%);
          --ci-card-title:      #fff;
          --ci-card-arrow:      rgba(255,255,255,0.55);
          --ci-empty-icon:      rgba(0,0,0,0.05);
          --ci-empty-title:     rgba(30,30,30,0.3);
        }

        /* ── Base ── */
        .ci-page {
          background: var(--ci-bg);
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          transition: background 0.3s ease;
        }

        /* ── Page header ── */
        .ci-header {
          background: var(--ci-bg-header);
          border-bottom: 1px solid var(--ci-border);
          padding: 64px 48px 48px;
        }

        @media (max-width: 768px) {
          .ci-header { padding: 48px 24px 36px; }
        }

        .ci-header-inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .ci-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--ci-accent);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .ci-label::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: var(--ci-accent);
        }

        .ci-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 300;
          color: var(--ci-heading);
          margin: 0 0 10px;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .ci-subtitle {
          font-size: 12px;
          font-weight: 300;
          color: var(--ci-subtitle);
          letter-spacing: 0.06em;
        }

        /* ── Grid body ── */
        .ci-body {
          max-width: 1280px;
          margin: 0 auto;
          padding: 56px 48px 96px;
        }

        @media (max-width: 768px) {
          .ci-body { padding: 40px 24px 72px; }
        }

        .collections-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 2px !important;
          flex-direction: unset !important;
        }

        @media (max-width: 900px) {
          .collections-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (max-width: 480px) {
          .collections-grid { grid-template-columns: 1fr !important; }
        }

        /* ── Collection card ── */
        .ci-card {
          display: block;
          text-decoration: none;
          background: var(--ci-bg-card);
          position: relative;
          overflow: hidden;
          transition: background 0.2s;
          aspect-ratio: 4 / 3;
        }

        .ci-card-img {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .ci-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                      filter 0.4s ease;
          filter: brightness(0.5) saturate(0.7);
        }

        .ci-card:hover .ci-card-img img {
          transform: scale(1.06);
          filter: brightness(0.35) saturate(0.5);
        }

        /* No-image placeholder */
        .ci-card-no-img {
          position: absolute;
          inset: 0;
          background: var(--ci-noimg-grad);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ci-card-no-img-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 64px;
          font-weight: 300;
          color: var(--ci-noimg-icon);
          user-select: none;
        }

        /* Gradient overlay */
        .ci-card-overlay {
          position: absolute;
          inset: 0;
          background: var(--ci-overlay);
          transition: background 0.3s;
          z-index: 1;
        }

        .ci-card:hover .ci-card-overlay {
          background: var(--ci-overlay-hover);
        }

        /* Blue top border sweep */
        .ci-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--ci-accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 2;
        }

        .ci-card:hover::before {
          transform: scaleX(1);
        }

        /* Text content pinned to bottom */
        .ci-card-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 28px 28px 24px;
          z-index: 2;
          transform: translateY(4px);
          transition: transform 0.3s ease;
        }

        .ci-card:hover .ci-card-content {
          transform: translateY(0);
        }

        .ci-card-label {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--ci-accent);
          margin-bottom: 6px;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s;
        }

        .ci-card:hover .ci-card-label {
          opacity: 1;
          transform: translateY(0);
        }

        /* Card title and arrow always white — dark overlay underneath */
        .ci-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 300;
          color: var(--ci-card-title);
          letter-spacing: 0.01em;
          line-height: 1.2;
          margin: 0;
        }

        .ci-card-arrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ci-card-arrow);
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.25s ease 0.08s, transform 0.25s ease 0.08s;
        }

        .ci-card-arrow::after {
          content: '→';
          font-size: 12px;
          color: var(--ci-accent);
        }

        .ci-card:hover .ci-card-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── Empty state ── */
        .ci-empty {
          text-align: center;
          padding: 120px 24px;
        }

        .ci-empty-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 72px;
          color: var(--ci-empty-icon);
          line-height: 1;
          margin-bottom: 20px;
        }

        .ci-empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 300;
          color: var(--ci-empty-title);
        }
      `}</style>

      <div className="ci-page" data-theme={theme}>

        {/* Header */}
        <div className="ci-header">
          <div className="ci-header-inner">
            <div className="ci-label">Sortiment</div>
            <h1 className="ci-title">Kollektioner</h1>
            <p className="ci-subtitle">Bläddra bland våra produktkategorier</p>
          </div>
        </div>

        {/* Grid */}
        <div className="ci-body">
          <PaginatedResourceSection
            connection={collections}
            resourcesClassName="collections-grid"
          >
            {({node: collection, index}) => (
              <CollectionItem
                key={collection.id}
                collection={collection}
                index={index}
              />
            )}
          </PaginatedResourceSection>
        </div>

      </div>
    </>
  );
}

/** @param {{ collection: CollectionFragment; index: number; }} */
function CollectionItem({collection, index}) {
  return (
    <Link
      className="ci-card"
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      {collection.image ? (
        <div className="ci-card-img">
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="4/3"
            data={collection.image}
            loading={index < 3 ? 'eager' : 'lazy'}
            sizes="(min-width: 900px) 33vw, (min-width: 480px) 50vw, 100vw"
          />
        </div>
      ) : (
        <div className="ci-card-no-img">
          <span className="ci-card-no-img-icon">✦</span>
        </div>
      )}

      <div className="ci-card-overlay" />

      <div className="ci-card-content">
        <div className="ci-card-label">Kollektion</div>
        <h2 className="ci-card-title">{collection.title}</h2>
        <div className="ci-card-arrow">Utforska</div>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/** @typedef {import('@netlify/remix-runtime').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */