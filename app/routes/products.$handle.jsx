import {Suspense, useState, useRef, useEffect} from 'react';
import {defer, redirect, json} from '@netlify/remix-runtime';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
} from '@shopify/hydrogen';
import {getVariantUrl} from '~/lib/variants';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {useTheme} from '~/components/PageLayout';

/** @type {MetaFunction<typeof loader>} */
export const meta = ({ data }) => {
  const title = data?.product?.title ?? 'Produkt';
  return [{ title: `${title} | Butiken` }];
};

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  /* return redirect('/maintenance', {status: 302}); */
  
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return json({...deferredData, ...criticalData});
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) throw new Error('Expected product handle to be defined');

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) throw new Response(null, {status: 404});

  const firstVariant = product.variants.nodes[0];
  const firstVariantIsDefault = Boolean(
    firstVariant.selectedOptions.find(
      (option) => option.name === 'Title' && option.value === 'Default Title',
    ),
  );

  if (firstVariantIsDefault) {
    product.selectedVariant = firstVariant;
  } else {
    if (!product.selectedVariant) {
      throw redirectToFirstVariant({product, request});
    }
  }

  return {product};
}

function loadDeferredData({context, params}) {
  const variants = context.storefront
    .query(VARIANTS_QUERY, {variables: {handle: params.handle}})
    .catch((error) => {
      console.error(error);
      return null;
    });
  return {variants};
}

function redirectToFirstVariant({product, request}) {
  const url = new URL(request.url);
  const firstVariant = product.variants.nodes[0];
  return redirect(
    getVariantUrl({
      pathname: url.pathname,
      handle: product.handle,
      selectedOptions: firstVariant.selectedOptions,
      searchParams: new URLSearchParams(url.search),
    }),
    {status: 302},
  );
}

export default function Product() {
  const {product, variants} = useLoaderData();
  const {theme} = useTheme();
  const selectedVariant = useOptimisticVariant(product.selectedVariant, variants);
  const {title, descriptionHtml, vendor} = product;
  const [zoom, setZoom] = useState({active: false, x: 0, y: 0, scale: 2.5});
  const imgRef = useRef(null);

  useEffect(() => {
    function checkMouse(e) {
      if (!imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (inside) {
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setZoom((z) => ({...z, active: true, x, y}));
      }
    }
    window.addEventListener('mousemove', checkMouse);
    return () => window.removeEventListener('mousemove', checkMouse);
  }, []);

  return (
    <>
      <style>{`
        /* ── Theme variables ── */
        .pp[data-theme="dark"] {
          --pp-bg:                  #111;
          --pp-bg-img:              #1a1a1a;
          --pp-text:                rgba(255,255,255,0.75);
          --pp-heading:             #fff;
          --pp-muted:               rgba(255,255,255,0.45);
          --pp-dimmed:              rgba(255,255,255,0.28);
          --pp-faint:               rgba(255,255,255,0.12);
          --pp-border:              rgba(255,255,255,0.07);
          --pp-border-img:          rgba(255,255,255,0.06);
          --pp-accent:              #7AC9EF;
          --pp-accent-dim:          rgba(122,201,239,0.1);
          --pp-accent-border:       rgba(122,201,239,0.3);
          --pp-accent-hover:        #9dd8f4;
          --pp-accent-text:         #0d1a22;
          --pp-breadcrumb:          rgba(255,255,255,0.28);
          --pp-breadcrumb-sep:      rgba(255,255,255,0.12);
          --pp-breadcrumb-cur:      rgba(255,255,255,0.45);
          --pp-price-color:         #fff;
          --pp-compare-color:       rgba(255,255,255,0.3);
          --pp-meta-label:          rgba(255,255,255,0.2);
          --pp-meta-value:          rgba(255,255,255,0.6);
          --pp-in-stock:            #7AC9EF;
          --pp-out-of-stock:        rgba(255,255,255,0.25);
          --pp-desc-label:          rgba(255,255,255,0.25);
          --pp-desc-divider:        rgba(255,255,255,0.06);
          --pp-desc-body:           rgba(255,255,255,0.45);
          --pp-desc-strong:         rgba(255,255,255,0.65);
          --pp-opt-color:           rgba(255,255,255,0.6);
          --pp-opt-border:          rgba(255,255,255,0.12);
          --pp-atc-disabled-bg:     rgba(255,255,255,0.1);
          --pp-atc-disabled-color:  rgba(255,255,255,0.25);
        }

        .pp[data-theme="light"] {
          --pp-bg:                  #f5f5f3;
          --pp-bg-img:              #fff;
          --pp-text:                rgba(30,30,30,0.8);
          --pp-heading:             #111;
          --pp-muted:               rgba(30,30,30,0.5);
          --pp-dimmed:              rgba(30,30,30,0.4);
          --pp-faint:               rgba(0,0,0,0.1);
          --pp-border:              rgba(0,0,0,0.08);
          --pp-border-img:          rgba(0,0,0,0.07);
          --pp-accent:              #2a8ab5;
          --pp-accent-dim:          rgba(42,138,181,0.08);
          --pp-accent-border:       rgba(42,138,181,0.3);
          --pp-accent-hover:        #1d6a8a;
          --pp-accent-text:         #fff;
          --pp-breadcrumb:          rgba(30,30,30,0.35);
          --pp-breadcrumb-sep:      rgba(30,30,30,0.2);
          --pp-breadcrumb-cur:      rgba(30,30,30,0.6);
          --pp-price-color:         #111;
          --pp-compare-color:       rgba(30,30,30,0.35);
          --pp-meta-label:          rgba(30,30,30,0.3);
          --pp-meta-value:          rgba(30,30,30,0.65);
          --pp-in-stock:            #2a8ab5;
          --pp-out-of-stock:        rgba(30,30,30,0.3);
          --pp-desc-label:          rgba(30,30,30,0.3);
          --pp-desc-divider:        rgba(0,0,0,0.07);
          --pp-desc-body:           rgba(30,30,30,0.55);
          --pp-desc-strong:         rgba(30,30,30,0.75);
          --pp-opt-color:           rgba(30,30,30,0.65);
          --pp-opt-border:          rgba(0,0,0,0.14);
          --pp-atc-disabled-bg:     rgba(0,0,0,0.08);
          --pp-atc-disabled-color:  rgba(30,30,30,0.3);
        }

        /* ── Base ── */
        .pp {
          background: var(--pp-bg);
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          color: var(--pp-text);
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* ── Breadcrumb ── */
        .pp-breadcrumb {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 48px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 768px) {
          .pp-breadcrumb { padding: 20px 24px 0; }
        }

        .pp-breadcrumb a {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--pp-breadcrumb);
          text-decoration: none;
          transition: color 0.15s;
        }

        .pp-breadcrumb a:hover { color: var(--pp-accent); }

        .pp-breadcrumb-sep {
          font-size: 10px;
          color: var(--pp-breadcrumb-sep);
        }

        .pp-breadcrumb-current {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--pp-breadcrumb-cur);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        /* ── Main layout ── */
        .pp-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 48px 96px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .pp-main {
            grid-template-columns: 1fr;
            gap: 48px;
            padding: 32px 24px 72px;
          }
        }

        /* ── Image column ── */
        .pp-images {
          position: sticky;
          top: 96px;
        }

        .pp-img-main {
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          background: var(--pp-bg-img);
          border: 1px solid var(--pp-border-img);
        }

        /* Blue corner accent */
        .pp-img-main::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40px; height: 2px;
          background: var(--pp-accent);
          z-index: 1;
        }

        .pp-img-main::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 2px; height: 40px;
          background: var(--pp-accent);
          z-index: 1;
        }

        .pp-img-zoom-inner {
          width: 100%;
          height: 100%;
          transform-origin: top left;
          transition: transform 0.1s ease-out;
        }

        .pp-img-zoom-inner img {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          pointer-events: none;
        }

        /* ── Info column ── */
        .pp-info {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding-top: 8px;
        }

        .pp-vendor {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--pp-accent);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .pp-vendor::before {
          content: '';
          display: inline-block;
          width: 20px;
          height: 1px;
          background: var(--pp-accent);
        }

        .pp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 300;
          color: var(--pp-heading);
          line-height: 1.1;
          letter-spacing: -0.01em;
          margin: 0 0 24px;
        }

        /* ── Price ── */
        .pp-price-wrap {
          margin-bottom: 32px;
          padding-bottom: 32px;
          border-bottom: 1px solid var(--pp-border);
        }

        .pp-price-wrap .price,
        .pp-price-wrap [data-test='price'] {
          font-family: 'Cormorant Garamond', serif !important;
          font-size: 36px !important;
          font-weight: 300 !important;
          color: var(--pp-price-color) !important;
          letter-spacing: 0.02em;
        }

        .pp-price-wrap .compare-at-price,
        .pp-price-wrap [data-test='compare-at-price'] {
          font-family: 'Montserrat', sans-serif !important;
          font-size: 14px !important;
          font-weight: 300 !important;
          color: var(--pp-compare-color) !important;
          text-decoration: line-through !important;
          margin-left: 10px;
        }

        .pp-sale-badge {
          display: inline-block;
          margin-left: 12px;
          padding: 4px 10px;
          background: var(--pp-accent-dim);
          border: 1px solid var(--pp-accent-border);
          color: var(--pp-accent);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          border-radius: 2px;
          vertical-align: middle;
        }

        /* ── Variant form ── */
        .pp-form-wrap {
          margin-bottom: 32px;
        }

        .pp-form-wrap fieldset legend,
        .pp-form-wrap [data-option-name] {
          font-size: 10px !important;
          font-weight: 600 !important;
          letter-spacing: 0.16em !important;
          text-transform: uppercase !important;
          color: var(--pp-meta-label) !important;
          margin-bottom: 10px !important;
          display: block;
        }

        .pp-options button {
          border: 1px solid var(--pp-opt-border) !important;
          background: transparent !important;
          color: var(--pp-opt-color) !important;
          font-family: 'Montserrat', sans-serif !important;
          font-size: 11px !important;
          font-weight: 400 !important;
          letter-spacing: 0.06em !important;
          padding: 8px 16px !important;
          border-radius: 3px !important;
          transition: border-color 0.2s, color 0.2s, background 0.2s !important;
          cursor: pointer;
        }

        .pp-options button:hover {
          border-color: var(--pp-accent-border) !important;
          color: var(--pp-heading) !important;
          background: var(--pp-accent-dim) !important;
        }

        .pp-options button[aria-selected='true'],
        .pp-options button[data-selected='true'],
        .pp-options button.selected {
          border-color: var(--pp-accent) !important;
          color: var(--pp-heading) !important;
          background: var(--pp-accent-dim) !important;
        }

        /* Add to cart button */
        .pp-atc-wrap button,
        .pp-options > form > button:last-of-type,
        .pp-options button[data-test='add-to-cart-button'],
        .pp-options .add-to-cart {
          width: 100% !important;
          padding: 16px 32px !important;
          background: var(--pp-accent) !important;
          color: var(--pp-accent-text) !important;
          font-family: 'Montserrat', sans-serif !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          letter-spacing: 0.22em !important;
          text-transform: uppercase !important;
          border: none !important;
          border-radius: 3px !important;
          cursor: pointer !important;
          transition: background 0.2s, transform 0.15s !important;
          margin-top: 20px !important;
          display: block !important;
        }

        .pp-atc-wrap button:hover,
        .pp-options > form > button:last-of-type:hover,
        .pp-options button[data-test='add-to-cart-button']:hover {
          background: var(--pp-accent-hover) !important;
          transform: translateY(-1px) !important;
        }

        .pp-atc-wrap button:disabled,
        .pp-options > form > button:last-of-type:disabled,
        .pp-options button[data-test='add-to-cart-button']:disabled {
          background: var(--pp-atc-disabled-bg) !important;
          color: var(--pp-atc-disabled-color) !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        /* ── Meta row ── */
        .pp-meta {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          padding: 20px 0;
          border-top: 1px solid var(--pp-border);
          border-bottom: 1px solid var(--pp-border);
          margin-bottom: 32px;
        }

        .pp-meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pp-meta-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--pp-meta-label);
        }

        .pp-meta-value {
          font-size: 12px;
          font-weight: 400;
          color: var(--pp-meta-value);
          letter-spacing: 0.03em;
        }

        .pp-meta-value.in-stock  { color: var(--pp-in-stock); }
        .pp-meta-value.out-of-stock { color: var(--pp-out-of-stock); }

        /* ── Description ── */
        .pp-description {
          padding-top: 8px;
        }

        .pp-description-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--pp-desc-label);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pp-description-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--pp-desc-divider);
        }

        .pp-description-body {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.85;
          color: var(--pp-desc-body);
        }

        .pp-description-body p { margin-bottom: 1em; }
        .pp-description-body p:last-child { margin-bottom: 0; }

        .pp-description-body strong {
          font-weight: 500;
          color: var(--pp-desc-strong);
        }

        .pp-description-body a {
          color: var(--pp-accent);
          text-decoration: none;
          border-bottom: 1px solid var(--pp-accent-border);
          transition: border-color 0.15s;
        }

        .pp-description-body a:hover {
          border-color: var(--pp-accent);
        }

        .pp-description-body ul,
        .pp-description-body ol {
          padding-left: 20px;
          margin-bottom: 1em;
        }

        .pp-description-body li {
          margin-bottom: 0.4em;
        }
      `}</style>

      <div className="pp" data-theme={theme}>

        {/* Breadcrumb */}
        <nav className="pp-breadcrumb">
          <Link to="/">Hem</Link>
          <span className="pp-breadcrumb-sep">›</span>
          <Link to="/collections/all">Katalog</Link>
          {vendor && (
            <>
              <span className="pp-breadcrumb-sep">›</span>
              <span className="pp-breadcrumb-current">{vendor}</span>
            </>
          )}
          <span className="pp-breadcrumb-sep">›</span>
          <span className="pp-breadcrumb-current">{title}</span>
        </nav>

        {/* Main grid */}
        <div className="pp-main">

          {/* Left: image */}
          <div className="pp-images">
            <div
              ref={imgRef}
              className="pp-img-main cursor-zoom-in"
              onMouseEnter={() => setZoom((z) => ({...z, active: true}))}
              onMouseLeave={() => setZoom((z) => ({...z, active: false}))}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                setZoom((z) => ({...z, x, y}));
              }}
            >
              <div
                className="pp-img-zoom-inner"
                style={{
                  transform: zoom.active
                    ? `scale(${zoom.scale}) translate(${-zoom.x * 100 / zoom.scale}%, ${-zoom.y * 100 / zoom.scale}%)`
                    : 'scale(1) translate(0,0)',
                }}
              >
                <ProductImage image={selectedVariant?.image} />
              </div>
            </div>
          </div>

          {/* Right: info */}
          <div className="pp-info">

            {vendor && <div className="pp-vendor">{vendor}</div>}

            <h1 className="pp-title">{title}</h1>

            <div className="pp-price-wrap">
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
              {selectedVariant?.compareAtPrice && (
                <span className="pp-sale-badge">Rea</span>
              )}
            </div>

            <div className="pp-form-wrap">
              <Suspense
                fallback={
                  <ProductForm
                    product={product}
                    selectedVariant={selectedVariant}
                    variants={[]}
                  />
                }
              >
                <Await
                  errorElement="Det gick inte att ladda varianter"
                  resolve={variants}
                >
                  {(data) => (
                    <ProductForm
                      product={product}
                      selectedVariant={selectedVariant}
                      variants={data?.product?.variants.nodes || []}
                    />
                  )}
                </Await>
              </Suspense>
            </div>

            <div className="pp-meta">
              <div className="pp-meta-item">
                <span className="pp-meta-label">Tillgänglighet</span>
                <span className={`pp-meta-value ${selectedVariant?.availableForSale ? 'in-stock' : 'out-of-stock'}`}>
                  {selectedVariant?.availableForSale ? 'I lager' : 'Slut i lager'}
                </span>
              </div>
              {selectedVariant?.sku && (
                <div className="pp-meta-item">
                  <span className="pp-meta-label">Artikelnummer</span>
                  <span className="pp-meta-value">{selectedVariant.sku}</span>
                </div>
              )}
              {vendor && (
                <div className="pp-meta-item">
                  <span className="pp-meta-label">Varumärke</span>
                  <span className="pp-meta-value">{vendor}</span>
                </div>
              )}
            </div>

            {descriptionHtml && (
              <div className="pp-description">
                <div className="pp-description-label">Beskrivning</div>
                <div
                  className="pp-description-body"
                  dangerouslySetInnerHTML={{__html: descriptionHtml}}
                />
              </div>
            )}

          </div>
        </div>

        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: selectedVariant?.id || '',
                variantTitle: selectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
        />
      </div>
    </>
  );
}

/* ─── GraphQL (unchanged) ─────────────────────────────────────────────── */

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    options {
      name
      values
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const PRODUCT_VARIANTS_FRAGMENT = `#graphql
  fragment ProductVariants on Product {
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const VARIANTS_QUERY = `#graphql
  ${PRODUCT_VARIANTS_FRAGMENT}
  query ProductVariants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductVariants
    }
  }
`;

/** @typedef {import('@netlify/remix-runtime').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').SelectedOption} SelectedOption */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */