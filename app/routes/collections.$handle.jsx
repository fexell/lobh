import {defer, redirect} from '@netlify/remix-runtime';
import {useLoaderData, Link, useNavigate, useLocation} from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {useState, useRef, useEffect} from 'react';

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  {title: `${data?.collection.title ?? 'Kollektion'} | Katalog`},
];

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

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const sortKey = url.searchParams.get('sort') || 'RELEVANCE';
  const reverse = url.searchParams.get('reverse') === 'true';
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  if (!handle) throw redirect('/collections');

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables, sortKey, reverse},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  return {collection, sortKey, reverse};
}

function loadDeferredData() {
  return {};
}

export default function Collection() {
  const {collection, sortKey, reverse} = useLoaderData();
  const hasImage = !!collection.image;

  return (
    <>
      <style>{`
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

        .col-hero-img,
        .col-hero-overlay {
          overflow: hidden;
          border-radius: inherit;
        }

        /* ── Hero banner ── */
        .col-hero {
          position: relative;
          width: 100%;
          height: 340px;
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
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .col-header-text {}

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

        /* Hero sort — floated to bottom-right */
        .col-hero-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .col-hero-text {}

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
          border-color: var(--accent-border);
          background: var(--accent-dim);
        }

        .sort-trigger.open {
          color: var(--accent);
          border-color: var(--accent-border);
          background: rgba(122,201,239,0.05);
        }

        /* On hero, slightly more opaque backdrop so it reads over the image */
        .sort-trigger--hero {
          background: rgba(0,0,0,0.35);
          border-color: rgba(255,255,255,0.15);
          backdrop-filter: blur(6px);
        }

        .sort-trigger--hero:hover,
        .sort-trigger--hero.open {
          background: rgba(122,201,239,0.12);
          border-color: var(--accent-border);
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
          color: var(--accent);
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
              <div className="col-hero-footer">
                <div className="col-hero-text">
                  <div className="col-label">Kollektion</div>
                  <h1 className="col-title">{collection.title}</h1>
                  {collection.description && (
                    <p className="col-description">{collection.description}</p>
                  )}
                </div>
                <SortDropdown
                  currentSortKey={sortKey}
                  currentReverse={reverse}
                  heroVariant
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="col-header">
            <div className="col-header-inner">
              <div className="col-header-text">
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
              <SortDropdown currentSortKey={sortKey} currentReverse={reverse} />
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

/** Sort dropdown — works for both hero and plain-header variants */
function SortDropdown({currentSortKey, currentReverse, heroVariant = false}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef(null);

  const activeOption =
    SORT_OPTIONS.find(
      (o) => o.key === currentSortKey && o.reverse === currentReverse,
    ) || SORT_OPTIONS[0];

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
    params.delete('cursor');
    params.delete('direction');
    navigate(`${location.pathname}?${params.toString()}`, {replace: true});
    setOpen(false);
  }

  const triggerClass = [
    'sort-trigger',
    open ? 'open' : '',
    heroVariant ? 'sort-trigger--hero' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="sort-wrapper" ref={ref}>
      <button
        className={triggerClass}
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
        {SORT_OPTIONS.map((option) => {
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
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
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