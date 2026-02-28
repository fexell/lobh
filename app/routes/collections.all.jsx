import {defer} from '@netlify/remix-runtime';
import {useLoaderData, Link} from '@remix-run/react';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

/** @type {MetaFunction<typeof loader>} */
export const meta = () => [{title: 'Katalog | Alla produkter'}];

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context, request}) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {variables: {...paginationVariables}}),
  ]);
  return {products};
}

function loadDeferredData() {
  return {};
}

export default function Collection() {
  const {products} = useLoaderData();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500;600&display=swap');

        .cat-page {
          background: #111;
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
        }

        /* ── Page header ── */
        .cat-header {
          background: #141414;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 64px 48px 48px;
        }

        @media (max-width: 768px) {
          .cat-header { padding: 48px 24px 36px; }
        }

        .cat-header-inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .cat-label {
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

        .cat-label::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: #7AC9EF;
        }

        .cat-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 300;
          color: #fff;
          margin: 0 0 12px;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .cat-count {
          font-size: 11px;
          font-weight: 300;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.08em;
        }

        /* ── Grid wrapper ── */
        .cat-body {
          max-width: 1280px;
          margin: 0 auto;
          padding: 56px 48px 96px;
        }

        @media (max-width: 768px) {
          .cat-body { padding: 40px 24px 80px; }
        }

        /* Override Hydrogen's resourcesClassName */
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
          group: true;
        }

        .pcard:hover {
          background: #1e1e1e;
        }

        /* Gold top line on hover */
        .pcard::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: #7AC9EF;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .pcard:hover::before {
          transform: scaleX(1);
        }

        /* Image area */
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

        /* No-image placeholder */
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
          color: rgba(201,184,122,0.12);
          font-weight: 300;
        }

        /* Card body */
        .pcard-body {
          padding: 20px 22px 24px;
        }

        .pcard-title {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: rgba(255,255,255,0.75);
          margin-bottom: 8px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s;
        }

        .pcard:hover .pcard-title {
          color: #fff;
        }

        .pcard-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 300;
          color: #7AC9EF;
          letter-spacing: 0.02em;
        }

        /* ── Pagination ── */
        .cat-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding-top: 64px;
        }

        .cat-pagination a,
        .cat-pagination button {
          display: inline-flex;
          align-items: center;
          padding: 12px 28px;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 3px;
          background: transparent;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }

        .cat-pagination a:hover,
        .cat-pagination button:hover {
          color: #fff;
          border-color: rgba(201,184,122,0.5);
          background: rgba(201,184,122,0.05);
        }

        /* ── Empty state ── */
        .cat-empty {
          text-align: center;
          padding: 120px 24px;
        }

        .cat-empty-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 80px;
          color: rgba(255,255,255,0.06);
          line-height: 1;
          margin-bottom: 24px;
        }

        .cat-empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 300;
          color: rgba(255,255,255,0.4);
          margin-bottom: 12px;
        }

        .cat-empty-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.05em;
        }
      `}</style>

      <div className="cat-page">

        {/* Page header */}
        <div className="cat-header">
          <div className="cat-header-inner">
            <div className="cat-label">Sortiment</div>
            <h1 className="cat-title">Alla produkter</h1>
            <p className="cat-count">Bläddra i hela vårt utbud</p>
          </div>
        </div>

        {/* Product grid */}
        <div className="cat-body">
          <PaginatedResourceSection
            connection={products}
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

      </div>
    </>
  );
}

/** @param {{ product: ProductItemFragment; loading?: 'eager' | 'lazy' }} */
function ProductItem({product, loading}) {
  const variant = product.variants.nodes[0];
  const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);

  return (
    <Link
      className="pcard"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
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

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...ProductItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_ITEM_FRAGMENT}
`;

/** @typedef {import('@netlify/remix-runtime').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */