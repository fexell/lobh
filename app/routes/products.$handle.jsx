import {Suspense, useState} from 'react';
import {defer, redirect} from '@netlify/remix-runtime';
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

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  {title: `${data?.product.title ?? 'Produkt'} | Butiken`},
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
  const selectedVariant = useOptimisticVariant(product.selectedVariant, variants);
  const {title, descriptionHtml, vendor} = product;
  const [zoom, setZoom] = useState({
    active: false,
    x: 0,
    y: 0,
    imgWidth: 0,
    imgHeight: 0,
  });

  return (
    <>
      <style>{`
        :root {
          --accent: #7AC9EF;
          --accent-dim: rgba(122, 201, 239, 0.1);
          --accent-border: rgba(122, 201, 239, 0.3);
        }

        .pp {
          background: #111;
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          color: rgba(255,255,255,0.75);
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
          color: rgba(255,255,255,0.28);
          text-decoration: none;
          transition: color 0.15s;
        }

        .pp-breadcrumb a:hover { color: var(--accent); }

        .pp-breadcrumb-sep {
          font-size: 10px;
          color: rgba(255,255,255,0.12);
        }

        .pp-breadcrumb-current {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
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
          /* position: relative; */
          overflow: hidden;
          border-radius: 4px;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.06);
          aspect-ratio: 1 / 1;
        }

        /* Blue corner accent */
        .pp-img-main::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40px; height: 2px;
          background: var(--accent);
          z-index: 1;
        }

        .pp-img-main::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 2px; height: 40px;
          background: var(--accent);
          z-index: 1;
        }

        /* Override ProductImage styles */
        .pp-img-main img,
        .pp-img-main > div,
        .pp-img-main > * {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          display: block;
        }

        .pp-zoom-window {
          position: absolute;
          top: 0;
          right: -590px; /* flytta zoom-rutan till höger om bilden */
          width: 400px;
          height: 400px;
          border: 1px solid rgba(255,255,255,0.1);
          background-repeat: no-repeat;
          background-size: 200%; /* zoom-nivå */
          pointer-events: none;
          z-index: 10;
          border-radius: 4px;
          background-color: #000;
        }

        @media (max-width: 1024px) {
          .pp-zoom-window {
            display: none; /* stäng av zoom på mobil */
          }
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
          color: var(--accent);
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
          background: var(--accent);
        }

        .pp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 300;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -0.01em;
          margin: 0 0 24px;
        }

        /* ── Price ── */
        .pp-price-wrap {
          margin-bottom: 32px;
          padding-bottom: 32px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        /* Override ProductPrice component */
        .pp-price-wrap .price,
        .pp-price-wrap [data-test='price'] {
          font-family: 'Cormorant Garamond', serif !important;
          font-size: 36px !important;
          font-weight: 300 !important;
          color: #fff !important;
          letter-spacing: 0.02em;
        }

        .pp-price-wrap .compare-at-price,
        .pp-price-wrap [data-test='compare-at-price'] {
          font-family: 'Montserrat', sans-serif !important;
          font-size: 14px !important;
          font-weight: 300 !important;
          color: rgba(255,255,255,0.3) !important;
          text-decoration: line-through !important;
          margin-left: 10px;
        }

        .pp-sale-badge {
          display: inline-block;
          margin-left: 12px;
          padding: 4px 10px;
          background: var(--accent-dim);
          border: 1px solid var(--accent-border);
          color: var(--accent);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          border-radius: 2px;
          vertical-align: middle;
        }

        /* ── Variant form (ProductForm) ── */
        .pp-form-wrap {
          margin-bottom: 32px;
        }

        /* Option labels */
        .pp-form-wrap fieldset legend,
        .pp-form-wrap [data-option-name] {
          font-size: 10px !important;
          font-weight: 600 !important;
          letter-spacing: 0.16em !important;
          text-transform: uppercase !important;
          color: rgba(255,255,255,0.35) !important;
          margin-bottom: 10px !important;
          display: block;
        }

        /* Variant option buttons (size/color selectors) */
        .pp-options button {
          border: 1px solid rgba(255,255,255,0.12) !important;
          background: transparent !important;
          color: rgba(255,255,255,0.6) !important;
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
          border-color: var(--accent-border) !important;
          color: #fff !important;
          background: var(--accent-dim) !important;
        }

        .pp-options button[aria-selected='true'],
        .pp-options button[data-selected='true'],
        .pp-options button.selected,
        .pp-options button[disabled] {
          border-color: var(--accent) !important;
          color: #fff !important;
          background: var(--accent-dim) !important;
        }

        /* Add to cart button — wraps the AddToCartButton */
        .pp-atc-wrap button {
          width: 100% !important;
          padding: 16px 32px !important;
          background: var(--accent) !important;
          color: #0d1a22 !important;
          font-family: 'Montserrat', sans-serif !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          letter-spacing: 0.22em !important;
          text-transform: uppercase !important;
          border: none !important;
          border-radius: 3px !important;
          cursor: pointer !important;
          transition: background 0.2s, transform 0.15s !important;
          margin-top: 0 !important;
          display: block !important;
        }

        .pp-atc-wrap button:hover {
          background: #9dd8f4 !important;
          transform: translateY(-1px) !important;
        }

        .pp-atc-wrap button:disabled {
          background: rgba(255,255,255,0.1) !important;
          color: rgba(255,255,255,0.25) !important;
          cursor: not-allowed !important;
          transform: none !important;
        }


        /* ProductForm renders option buttons + ATC button together.
           The ATC button is always the LAST button in the form — target it specifically. */
        .pp-options > form > button:last-of-type,
        .pp-options button[data-test='add-to-cart-button'],
        .pp-options .add-to-cart {
          width: 100% !important;
          padding: 16px 32px !important;
          background: var(--accent) !important;
          color: #0d1a22 !important;
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

        .pp-options > form > button:last-of-type:hover,
        .pp-options button[data-test='add-to-cart-button']:hover {
          background: #9dd8f4 !important;
          transform: translateY(-1px) !important;
        }

        .pp-options > form > button:last-of-type:disabled,
        .pp-options button[data-test='add-to-cart-button']:disabled {
          background: rgba(255,255,255,0.1) !important;
          color: rgba(255,255,255,0.25) !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        /* ── Meta row (SKU, availability) ── */
        .pp-meta {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          padding: 20px 0;
          border-top: 1px solid rgba(255,255,255,0.07);
          border-bottom: 1px solid rgba(255,255,255,0.07);
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
          color: rgba(255,255,255,0.2);
        }

        .pp-meta-value {
          font-size: 12px;
          font-weight: 400;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.03em;
        }

        .pp-meta-value.in-stock {
          color: #7AC9EF;
        }

        .pp-meta-value.out-of-stock {
          color: rgba(255,255,255,0.25);
        }

        /* ── Description ── */
        .pp-description {
          padding-top: 8px;
        }

        .pp-description-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pp-description-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .pp-description-body {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.85;
          color: rgba(255,255,255,0.45);
        }

        .pp-description-body p { margin-bottom: 1em; }
        .pp-description-body p:last-child { margin-bottom: 0; }

        .pp-description-body strong {
          font-weight: 500;
          color: rgba(255,255,255,0.65);
        }

        .pp-description-body a {
          color: var(--accent);
          text-decoration: none;
          border-bottom: 1px solid var(--accent-border);
          transition: border-color 0.15s;
        }

        .pp-description-body a:hover {
          border-color: var(--accent);
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

      <div className="pp">

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
              className="pp-img-main"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setZoom((z) => ({
                  ...z,
                  active: true,
                  imgWidth: rect.width,
                  imgHeight: rect.height,
                }));
              }}
              onMouseLeave={() => setZoom((z) => ({...z, active: false}))}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                setZoom((z) => ({
                  ...z,
                  x: x / rect.width,
                  y: y / rect.height,
                }));
              }}
            >
              <ProductImage image={selectedVariant?.image} />

              {/* Zoomed image */}
              {zoom.active && (
                <div
                  className="pp-zoom-window"
                  style={{
                    backgroundImage: `url(${selectedVariant?.image?.url})`,
                    backgroundPosition: `${zoom.x * 100}% ${zoom.y * 100}%`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Right: info */}
          <div className="pp-info">

            {/* Vendor */}
            {vendor && <div className="pp-vendor">{vendor}</div>}

            {/* Title */}
            <h1 className="pp-title">{title}</h1>

            {/* Price */}
            <div className="pp-price-wrap">
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
              {selectedVariant?.compareAtPrice && (
                <span className="pp-sale-badge">Rea</span>
              )}
            </div>

            {/* Variant selector + Add to cart */}
            {/* pp-options styles the variant selectors, pp-atc-wrap styles the button */}
            {/* ProductForm renders both — we use CSS :last-child on pp-form-wrap to */}
            {/* target the final button element rendered by AddToCartButton */}
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

            {/* Meta */}
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

            {/* Description */}
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