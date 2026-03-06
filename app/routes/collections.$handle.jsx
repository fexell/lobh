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
import {useTheme} from '~/components/PageLayout';

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
  const {theme} = useTheme();
  const hasImage = !!collection.image;

  return (
    <>
      <style>{`
        /* ── Theme variables ── */
        .col-page[data-theme="dark"] {
          --col-bg:               #111;
          --col-bg-alt:           #141414;
          --col-bg-card:          #1a1a1a;
          --col-bg-card-hover:    #1e1e1e;
          --col-bg-card-img:      #141414;
          --col-bg-card-noimg:    #181818;
          --col-heading:          #fff;
          --col-text:             rgba(255,255,255,0.7);
          --col-muted:            rgba(255,255,255,0.45);
          --col-dimmed:           rgba(255,255,255,0.5);
          --col-border:           rgba(255,255,255,0.06);
          --col-border-subtle:    rgba(255,255,255,0.1);
          --col-border-card:      rgba(255,255,255,0.04);
          --col-accent:           #7AC9EF;
          --col-accent-dim:       rgba(122,201,239,0.15);
          --col-accent-border:    rgba(122,201,239,0.35);
          --col-noimg-icon:       rgba(122,201,239,0.1);
          --col-breadcrumb:       rgba(255,255,255,0.3);
          --col-breadcrumb-sep:   rgba(255,255,255,0.15);
          --col-breadcrumb-cur:   rgba(255,255,255,0.55);
          --col-sort-bg:          rgba(255,255,255,0.03);
          --col-sort-bg-hover:    rgba(122,201,239,0.04);
          --col-sort-bg-open:     rgba(122,201,239,0.05);
          --col-sort-color:       rgba(255,255,255,0.55);
          --col-sort-color-hover: rgba(255,255,255,0.85);
          --col-sort-border:      rgba(255,255,255,0.10);
          --col-sort-label:       rgba(255,255,255,0.25);
          --col-menu-bg:          #1a1a1a;
          --col-menu-border:      rgba(255,255,255,0.08);
          --col-menu-shadow:      rgba(0,0,0,0.5);
          --col-opt-color:        rgba(255,255,255,0.45);
          --col-opt-color-hover:  rgba(255,255,255,0.8);
          --col-opt-bg-hover:     rgba(255,255,255,0.04);
          --col-opt-bg-active:    rgba(122,201,239,0.06);
          --col-page-color:       rgba(255,255,255,0.5);
          --col-page-border:      rgba(255,255,255,0.1);
          --col-empty-icon:       rgba(255,255,255,0.05);
          --col-empty-title:      rgba(255,255,255,0.3);
          --col-empty-sub:        rgba(255,255,255,0.18);
        }

        .col-page[data-theme="light"] {
          --col-bg:               #f5f5f3;
          --col-bg-alt:           #ebebea;
          --col-bg-card:          #fff;
          --col-bg-card-hover:    #f9f9f8;
          --col-bg-card-img:      #e8e8e6;
          --col-bg-card-noimg:    #f0f0ee;
          --col-heading:          #111;
          --col-text:             rgba(30,30,30,0.75);
          --col-muted:            rgba(30,30,30,0.5);
          --col-dimmed:           rgba(30,30,30,0.55);
          --col-border:           rgba(0,0,0,0.07);
          --col-border-subtle:    rgba(0,0,0,0.1);
          --col-border-card:      rgba(0,0,0,0.05);
          --col-accent:           #2a8ab5;
          --col-accent-dim:       rgba(42,138,181,0.1);
          --col-accent-border:    rgba(42,138,181,0.4);
          --col-noimg-icon:       rgba(42,138,181,0.12);
          --col-breadcrumb:       rgba(30,30,30,0.35);
          --col-breadcrumb-sep:   rgba(30,30,30,0.2);
          --col-breadcrumb-cur:   rgba(30,30,30,0.6);
          --col-sort-bg:          rgba(0,0,0,0.02);
          --col-sort-bg-hover:    rgba(42,138,181,0.05);
          --col-sort-bg-open:     rgba(42,138,181,0.07);
          --col-sort-color:       rgba(30,30,30,0.55);
          --col-sort-color-hover: rgba(30,30,30,0.9);
          --col-sort-border:      rgba(0,0,0,0.12);
          --col-sort-label:       rgba(30,30,30,0.3);
          --col-menu-bg:          #fff;
          --col-menu-border:      rgba(0,0,0,0.1);
          --col-menu-shadow:      rgba(0,0,0,0.12);
          --col-opt-color:        rgba(30,30,30,0.5);
          --col-opt-color-hover:  rgba(30,30,30,0.9);
          --col-opt-bg-hover:     rgba(0,0,0,0.03);
          --col-opt-bg-active:    rgba(42,138,181,0.07);
          --col-page-color:       rgba(30,30,30,0.5);
          --col-page-border:      rgba(0,0,0,0.12);
          --col-empty-icon:       rgba(0,0,0,0.05);
          --col-empty-title:      rgba(30,30,30,0.3);
          --col-empty-sub:        rgba(30,30,30,0.2);
        }

        /* ── Base ── */
        .col-page {
          background: var(--col-bg);
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* ── Hero banner — always dark (photo background) ── */
        .col-hero {
          position: relative;
          width: 100%;
          height: 340px;
          /* overflow: hidden; */
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

        /* Hero text always white — dark photo underneath */
        .col-hero .col-label         { color: #7AC9EF; }
        .col-hero .col-label::before { background: #7AC9EF; }
        .col-hero .col-title         { color: #fff; }
        .col-hero .col-description   { color: rgba(255,255,255,0.45); }
        .col-hero .col-breadcrumb a  { color: rgba(255,255,255,0.3); }
        .col-hero .col-breadcrumb a:hover { color: #7AC9EF; }
        .col-hero .col-breadcrumb-sep    { color: rgba(255,255,255,0.15); }
        .col-hero .col-breadcrumb-current { color: rgba(255,255,255,0.55); }

        /* ── Plain header (no image) — theme-aware ── */
        .col-header {
          background: var(--col-bg-alt);
          border-bottom: 1px solid var(--col-border);
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

        /* ── Shared header elements ── */
        .col-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--col-accent);
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
          background: var(--col-accent);
        }

        .col-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 300;
          color: var(--col-heading);
          margin: 0 0 14px;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .col-description {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.75;
          color: var(--col-muted);
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
          color: var(--col-breadcrumb);
          text-decoration: none;
          transition: color 0.15s;
        }

        .col-breadcrumb a:hover { color: var(--col-accent); }

        .col-breadcrumb-sep {
          font-size: 10px;
          color: var(--col-breadcrumb-sep);
        }

        .col-breadcrumb-current {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--col-breadcrumb-cur);
        }

        /* Hero sort footer */
        .col-hero-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
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
          background: var(--col-bg-card);
          position: relative;
          overflow: hidden;
          transition: background 0.2s;
        }

        .pcard::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--col-accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .pcard:hover { background: var(--col-bg-card-hover); }
        .pcard:hover::before { transform: scaleX(1); }

        .pcard-img-wrap {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          background: var(--col-bg-card-img);
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
          background: var(--col-bg-card-noimg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pcard-no-img-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px;
          color: var(--col-noimg-icon);
          font-weight: 300;
        }

        .pcard-body {
          padding: 18px 20px 22px;
          border-top: 1px solid var(--col-border-card);
        }

        .pcard-title {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: var(--col-text);
          margin-bottom: 8px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s;
        }

        .pcard:hover .pcard-title { color: var(--col-heading); }

        .pcard-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 300;
          color: var(--col-accent);
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
          color: var(--col-sort-color);
          border: 1px solid var(--col-sort-border);
          border-radius: 3px;
          background: var(--col-sort-bg);
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          white-space: nowrap;
          user-select: none;
        }

        .sort-trigger:hover {
          color: var(--col-sort-color-hover);
          border-color: var(--col-accent-border);
          background: var(--col-sort-bg-hover);
        }

        .sort-trigger.open {
          color: var(--col-accent);
          border-color: var(--col-accent-border);
          background: var(--col-sort-bg-open);
        }

        /* Hero variant — always dark-style over the photo */
        .sort-trigger--hero {
          background: rgba(0,0,0,0.35) !important;
          border-color: rgba(255,255,255,0.15) !important;
          color: rgba(255,255,255,0.7) !important;
          backdrop-filter: blur(6px);
        }

        .sort-trigger--hero:hover,
        .sort-trigger--hero.open {
          background: rgba(122,201,239,0.12) !important;
          border-color: rgba(122,201,239,0.45) !important;
          color: #7AC9EF !important;
        }

        .sort-trigger-label {
          color: var(--col-sort-label);
          margin-right: 2px;
        }

        .sort-trigger--hero .sort-trigger-label {
          color: rgba(255,255,255,0.35);
        }

        .sort-trigger-value { color: inherit; }

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
          background: var(--col-menu-bg);
          border: 1px solid var(--col-menu-border);
          border-radius: 4px;
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 16px 40px var(--col-menu-shadow);
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
          color: var(--col-opt-color);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: 'Montserrat', sans-serif;
        }

        .sort-option:hover {
          background: var(--col-opt-bg-hover);
          color: var(--col-opt-color-hover);
        }

        .sort-option.active {
          color: var(--col-accent);
          background: var(--col-opt-bg-active);
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
          color: var(--col-page-color);
          border: 1px solid var(--col-page-border);
          border-radius: 3px;
          background: transparent;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }

        .col-pagination a:hover,
        .col-pagination button:hover {
          color: var(--col-heading);
          border-color: var(--col-accent-border);
          background: var(--col-accent-dim);
        }

        /* ── Empty state ── */
        .col-empty {
          text-align: center;
          padding: 120px 24px;
        }

        .col-empty-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 80px;
          color: var(--col-empty-icon);
          line-height: 1;
          margin-bottom: 24px;
        }

        .col-empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 300;
          color: var(--col-empty-title);
          margin-bottom: 8px;
        }

        .col-empty-sub {
          font-size: 11px;
          color: var(--col-empty-sub);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
      `}</style>

      <div className="col-page" data-theme={theme}>

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
                <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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