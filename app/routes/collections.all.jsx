import {defer} from '@netlify/remix-runtime';
import {useLoaderData, Link, useNavigate, useLocation} from '@remix-run/react';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {useState, useRef, useEffect} from 'react';

/** @type {MetaFunction<typeof loader>} */
export const meta = () => [{title: 'Katalog | Alla produkter'}];

const SORT_OPTIONS = [
  {label: 'Rekommenderat',  key: 'RELEVANCE',    reverse: false},
  {label: 'Nyast först',    key: 'CREATED_AT',   reverse: true},
  {label: 'Lägst pris',     key: 'PRICE',        reverse: false},
  {label: 'Högst pris',     key: 'PRICE',        reverse: true},
  {label: 'Namn A–Ö',       key: 'TITLE',        reverse: false},
  {label: 'Namn Ö–A',       key: 'TITLE',        reverse: true},
  {label: 'Bästsäljare',    key: 'BEST_SELLING', reverse: false},
];

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context, request}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const sortKey = url.searchParams.get('sort') || 'RELEVANCE';
  const reverse = url.searchParams.get('reverse') === 'true';
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables, sortKey, reverse},
    }),
  ]);
  return {products, sortKey, reverse};
}

function loadDeferredData() {
  return {};
}

export default function Collection() {
  const {products, sortKey, reverse} = useLoaderData();

  return (
    <>
      <style>{`
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
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .cat-header-text {}

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

        /* ── Sort dropdown ── */
        .sort-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .sort-trigger {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 11px 20px;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 3px;
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          white-space: nowrap;
          user-select: none;
        }

        .sort-trigger:hover {
          color: rgba(255,255,255,0.85);
          border-color: rgba(122,201,239,0.35);
          background: rgba(122,201,239,0.04);
        }

        .sort-trigger.open {
          color: #7AC9EF;
          border-color: rgba(122,201,239,0.5);
          background: rgba(122,201,239,0.05);
        }

        .sort-trigger-label {
          color: rgba(255,255,255,0.25);
          margin-right: 2px;
        }

        .sort-trigger-value {
          color: inherit;
        }

        .sort-chevron {
          width: 10px;
          height: 10px;
          opacity: 0.5;
          transition: transform 0.2s, opacity 0.2s;
          flex-shrink: 0;
        }

        .sort-trigger.open .sort-chevron {
          transform: rotate(180deg);
          opacity: 1;
        }

        .sort-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 200px;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          opacity: 0;
          transform: translateY(-6px);
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
        }

        .sort-menu.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .sort-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: 'Montserrat', sans-serif;
        }

        .sort-option:hover {
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.8);
        }

        .sort-option.active {
          color: #7AC9EF;
          background: rgba(122,201,239,0.06);
        }

        .sort-option-check {
          width: 14px;
          height: 14px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .sort-option.active .sort-option-check {
          opacity: 1;
        }

        .sort-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 4px 0;
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
        }

        .pcard:hover {
          background: #1e1e1e;
        }

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
          color: rgba(201,184,122,0.12);
          font-weight: 300;
        }

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
            <div className="cat-header-text">
              <div className="cat-label">Sortiment</div>
              <h1 className="cat-title">Alla produkter</h1>
              <p className="cat-count">Bläddra i hela vårt utbud</p>
            </div>
            <SortDropdown currentSortKey={sortKey} currentReverse={reverse} />
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

/** Sort dropdown component */
function SortDropdown({currentSortKey, currentReverse}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef(null);

  const activeOption =
    SORT_OPTIONS.find(
      (o) => o.key === currentSortKey && o.reverse === currentReverse,
    ) || SORT_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function selectOption(option) {
    const params = new URLSearchParams(location.search);
    params.set('sort', option.key);
    params.set('reverse', String(option.reverse));
    // Reset pagination when sorting changes
    params.delete('cursor');
    params.delete('direction');
    navigate(`${location.pathname}?${params.toString()}`, {replace: true});
    setOpen(false);
  }

  return (
    <div className="sort-wrapper" ref={ref}>
      <button
        className={`sort-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="sort-trigger-label">Sortera&nbsp;</span>
        <span className="sort-trigger-value">{activeOption.label}</span>
        <svg className="sort-chevron" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={`sort-menu${open ? ' open' : ''}`} role="listbox">
        {SORT_OPTIONS.map((option, i) => {
          const isActive =
            option.key === currentSortKey && option.reverse === currentReverse;
          return (
            <button
              key={`${option.key}-${option.reverse}`}
              className={`sort-option${isActive ? ' active' : ''}`}
              role="option"
              aria-selected={isActive}
              onClick={() => selectOption(option)}
            >
              {option.label}
              <svg className="sort-option-check" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="#7AC9EF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          );
        })}
      </div>
    </div>
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

/* ─── GraphQL ─────────────────────────────────────────────────────────── */

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
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: $sortKey
      reverse: $reverse
    ) {
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