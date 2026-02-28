import {defer, redirect} from '@netlify/remix-runtime';
import {useLoaderData, Link} from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  {title: `${data?.collection.title ?? 'Kollektion'} | Katalog`},
];

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  if (!handle) throw redirect('/collections');

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  return {collection};
}

function loadDeferredData() {
  return {};
}

export default function Collection() {
  const {collection} = useLoaderData();
  const hasImage = !!collection.image;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500;600&display=swap');

        /* ── Accent colour ── */
        :root {
          --accent: #7AC9EF;
          --accent-dim: rgba(122, 201, 239, 0.15);
          --accent-border: rgba(122, 201, 239, 0.35);
        }

        .col-page {
          background: #111;
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
        }

        /* ── Hero banner (shown when collection has an image) ── */
        .col-hero {
          position: relative;
          width: 100%;
          height: 340px;
          overflow: hidden;
        }

        .col-hero-img {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transform: scale(1.04);
          animation: colHeroZoom 8s ease forwards;
          filter: brightness(0.55) saturate(0.7);
        }

        @keyframes colHeroZoom {
          from { transform: scale(1.04); }
          to   { transform: scale(1); }
        }

        .col-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(17,17,17,0.1) 0%,
            rgba(17,17,17,0.75) 100%
          );
        }

        .col-hero-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 48px 44px;
          max-width: 1280px;
          margin: 0 auto;
          left: 0; right: 0;
        }

        /* ── Plain header (no image) ── */
        .col-header {
          background: #141414;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 64px 48px 48px;
        }

        .col-header-inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ── Shared header elements ── */
        .col-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .col-label::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: var(--accent);
        }

        .col-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 300;
          color: #fff;
          margin: 0 0 14px;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .col-description {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.75;
          color: rgba(255,255,255,0.45);
          max-width: 560px;
          margin: 0;
        }

        /* ── Breadcrumb ── */
        .col-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .col-breadcrumb a {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          transition: color 0.15s;
        }

        .col-breadcrumb a:hover { color: var(--accent); }

        .col-breadcrumb-sep {
          font-size: 10px;
          color: rgba(255,255,255,0.15);
        }

        .col-breadcrumb-current {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
        }

        /* ── Grid body ── */
        .col-body {
          max-width: 1280px;
          margin: 0 auto;
          padding: 48px 48px 96px;
        }

        @media (max-width: 768px) {
          .col-body { padding: 32px 24px 72px; }
          .col-header { padding: 48px 24px 36px; }
          .col-hero-content { padding: 0 24px 36px; }
        }

        /* Product grid */
        .products-grid {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 2px !important;
        }

        @media (max-width: 1100px) {
          .products-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }

        @media (max-width: 768px) {
          .products-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (max-width: 420px) {
          .products-grid { grid-template-columns: 1fr !important; }
        }

        /* ── Product card ── */
        .pcard {
          display: block;
          text-decoration: none;
          background: #1a1a1a;
          position: relative;
          overflow: hidden;
          transition: background 0.2s;
        }

        .pcard::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .pcard:hover { background: #1e1e1e; }
        .pcard:hover::before { transform: scaleX(1); }

        .pcard-img-wrap {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          background: #141414;
        }

        .pcard-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          display: block;
        }

        .pcard:hover .pcard-img-wrap img {
          transform: scale(1.05);
        }

        .pcard-no-img {
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #181818;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pcard-no-img-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px;
          color: rgba(122,201,239,0.1);
          font-weight: 300;
        }

        .pcard-body {
          padding: 18px 20px 22px;
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        .pcard-title {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.7);
          margin-bottom: 8px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s;
        }

        .pcard:hover .pcard-title { color: #fff; }

        .pcard-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 300;
          color: var(--accent);
          letter-spacing: 0.02em;
        }

        /* ── Empty state ── */
        .col-empty {
          text-align: center;
          padding: 120px 24px;
        }

        .col-empty-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 80px;
          color: rgba(255,255,255,0.05);
          line-height: 1;
          margin-bottom: 24px;
        }

        .col-empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 300;
          color: rgba(255,255,255,0.3);
          margin-bottom: 8px;
        }

        .col-empty-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.18);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ── Pagination ── */
        .col-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding-top: 56px;
        }

        .col-pagination a,
        .col-pagination button {
          display: inline-flex;
          align-items: center;
          padding: 12px 28px;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
          background: transparent;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }

        .col-pagination a:hover,
        .col-pagination button:hover {
          color: #fff;
          border-color: var(--accent-border);
          background: var(--accent-dim);
        }
      `}</style>

      <div className="col-page">

        {/* Hero (with image) or plain header */}
        {hasImage ? (
          <div className="col-hero">
            <div
              className="col-hero-img"
              style={{backgroundImage: `url(${collection.image.url})`}}
            />
            <div className="col-hero-overlay" />
            <div className="col-hero-content">
              <div className="col-breadcrumb">
                <Link to="/collections/all">Katalog</Link>
                <span className="col-breadcrumb-sep">›</span>
                <span className="col-breadcrumb-current">{collection.title}</span>
              </div>
              <div className="col-label">Kollektion</div>
              <h1 className="col-title">{collection.title}</h1>
              {collection.description && (
                <p className="col-description">{collection.description}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="col-header">
            <div className="col-header-inner">
              <div className="col-breadcrumb">
                <Link to="/collections/all">Katalog</Link>
                <span className="col-breadcrumb-sep">›</span>
                <span className="col-breadcrumb-current">{collection.title}</span>
              </div>
              <div className="col-label">Kollektion</div>
              <h1 className="col-title">{collection.title}</h1>
              {collection.description && (
                <p className="col-description">{collection.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="col-body">
          <PaginatedResourceSection
            connection={collection.products}
            resourcesClassName="products-grid"
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 12 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
        </div>

        <Analytics.CollectionView
          data={{
            collection: {
              id: collection.id,
              handle: collection.handle,
            },
          }}
        />
      </div>
    </>
  );
}

/** @param {{ product: ProductItemFragment; loading?: 'eager' | 'lazy' }} */
function ProductItem({product, loading}) {
  const variant = product.variants.nodes[0];
  const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);

  return (
    <Link className="pcard" key={product.id} prefetch="intent" to={variantUrl}>
      <div className="pcard-img-wrap">
        {product.featuredImage ? (
          <Image
            alt={product.featuredImage.altText || product.title}
            aspectRatio="1/1"
            data={product.featuredImage}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        ) : (
          <div className="pcard-no-img">
            <span className="pcard-no-img-icon">✦</span>
          </div>
        )}
      </div>
      <div className="pcard-body">
        <div className="pcard-title">{product.title}</div>
        <div className="pcard-price">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
    </Link>
  );
}

/* ─── GraphQL (unchanged) ─────────────────────────────────────────────── */

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 1) {
      nodes {
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/** @typedef {import('@netlify/remix-runtime').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */