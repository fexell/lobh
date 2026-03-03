import {defer} from '@netlify/remix-runtime';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import { LogoMarquee } from '~/components/LogoMarquee';

import Banner1 from '../assets/banner-4.jpg';
import ContentImage1 from '../assets/banner-1.jpg';
import CardImage1 from '../assets/cards/card-image-1_small.jpg';
import CardImage2 from '../assets/cards/card-image-2_small.jpg';
import CardImage3 from '../assets/cards/card-image-3_small.jpg';

import AppleLogo from '../assets/slide/apple_logo_white.png';
import SamsungLogo from '../assets/slide/samsung-logo.avif';
import LgLogo from '../assets/slide/lg-logo.avif';
import ElectroluxLogo from '../assets/slide/electrolux_logo_white.png';
import BoschLogo from '../assets/slide/bosch_symbol_logo_white.png';
import MieleLogo from '../assets/slide/Miele-logo.png';

const LOGOS = [
  { src: AppleLogo, alt: 'Apple' },
  { src: SamsungLogo, alt: 'Samsung' },
  { src: LgLogo, alt: 'LG' },
  { src: ElectroluxLogo, alt: 'Electrolux' },
  { src: BoschLogo, alt: 'Bosch' },
  { src: MieleLogo, alt: 'Miele' },
]

/* ─── GraphQL queries (unchanged) ──────────────────────────────────────── */

const BEST_SELLING_PRODUCT_QUERY = `#graphql
  fragment BestSellingProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query BestSellingProduct ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 1, sortKey: BEST_SELLING, query: "NOT tag:'Services'") {
      nodes {
        ...BestSellingProduct
      }
    }
  }
`;

const HOMEPAGE_QUERY = `#graphql
  query HomePage($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    page(handle: $handle) {
      id
      title
      body
      bodySummary
    }
  }
`;

/* ─── Meta ──────────────────────────────────────────────────────────────── */

/** @type {MetaFunction} */
export const meta = () => [{title: 'Ljud & Bild Hörnan | Home'}];

/* ─── Loader ────────────────────────────────────────────────────────────── */

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context}) {
  const [{collections}, {products}, {page}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    context.storefront.query(BEST_SELLING_PRODUCT_QUERY),
    context.storefront.query(HOMEPAGE_QUERY, {variables: {handle: 'Home'}}),
  ]);
  return {
    featuredCollection: collections.nodes[0],
    bestSellingProduct: products.nodes,
    homepage: page,
  };
}

function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });
  return {recommendedProducts};
}

/* ─── Page component ────────────────────────────────────────────────────── */

export default function Homepage() {
  const data = useLoaderData();
  const homepage = data.homepage;
  const bestSeller = data.bestSellingProduct?.[0];

  return (
    <>
      <style>{`
        /* ── Globals for homepage ── */
        .hp {
          font-family: 'Montserrat', sans-serif;
          background: #111;
          color: rgba(255,255,255,0.75);
          overflow-x: hidden;
        }

        /* ── Hero ── */
        .hp-hero {
          position: relative;
          width: 100%;
          height: calc(100vh - 110px);
          min-height: 500px;
          overflow: hidden;
        }

        .hp-hero-img {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transform: scale(1.04);
          animation: heroZoom 10s ease forwards;
        }

        @keyframes heroZoom {
          from { transform: scale(1.04); }
          to   { transform: scale(1); }
        }

        .hp-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(0,0,0,0.55) 0%,
            rgba(0,0,0,0.2) 50%,
            rgba(0,0,0,0.65) 100%
          );
        }

        .hp-hero-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 64px 80px;
          max-width: 720px;
          animation: heroFade 1s ease 0.3s both;
        }

        @keyframes heroFade {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hp-hero-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #7AC9EF;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hp-hero-label::before {
          content: '';
          display: inline-block;
          width: 32px;
          height: 1px;
          background: #7AC9EF;
        }

        .hp-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(42px, 6vw, 80px);
          font-weight: 300;
          line-height: 1.1;
          color: #fff;
          margin: 0 0 24px;
          letter-spacing: -0.01em;
        }

        .hp-hero-sub {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.7;
          color: rgba(255,255,255,0.6);
          margin-bottom: 40px;
          max-width: 480px;
        }

        .hp-hero-btns {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .hp-btn-primary {
          display: inline-flex;
          align-items: center;
          padding: 14px 32px;
          background: #7AC9EF;
          color: #111;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 3px;
          transition: background 0.2s, transform 0.15s;
        }

        .hp-btn-primary:hover {
          background: #558da7;
          transform: translateY(-1px);
        }

        .hp-btn-secondary {
          display: inline-flex;
          align-items: center;
          padding: 14px 32px;
          background: transparent;
          color: rgba(255,255,255,0.8);
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 3px;
          transition: border-color 0.2s, color 0.2s;
        }

        .hp-btn-secondary:hover {
          border-color: rgba(255,255,255,0.6);
          color: #fff;
        }

        /* ── Section utility ── */
        .hp-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 96px 48px;
        }

        @media (max-width: 768px) {
          .hp-section { padding: 64px 24px; }
          .hp-hero-content { padding: 0 28px 48px; }
        }

        .hp-section-label {
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

        .hp-section-label::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: #7AC9EF;
        }

        .hp-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 300;
          line-height: 1.15;
          color: #fff;
          margin: 0 0 20px;
          letter-spacing: -0.01em;
        }

        .hp-section-body {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(255,255,255,0.5);
          max-width: 560px;
        }

        /* ── About / split section ── */
        .hp-about {
          background: #141414;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .hp-about-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 96px 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        @media (max-width: 900px) {
          .hp-about-inner {
            grid-template-columns: 1fr;
            gap: 48px;
            padding: 64px 24px;
          }
        }

        .hp-about-img-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 4px;
        }

        .hp-about-img-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid rgba(201,184,122,0.15);
          border-radius: 4px;
          z-index: 1;
          pointer-events: none;
        }

        .hp-about-img-wrap img {
          width: 100%;
          height: 480px;
          object-fit: cover;
          display: block;
          border-radius: 4px;
          transition: transform 0.6s ease;
        }

        .hp-about-img-wrap:hover img {
          transform: scale(1.03);
        }

        .hp-about-text {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .hp-divider {
          width: 40px;
          height: 1px;
          background: #7AC9EF;
          opacity: 0.6;
        }

        /* ── Bestseller strip ── */
        .hp-bestseller {
          background: #0d0d0d;
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        .hp-bestseller-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 80px 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }

        @media (max-width: 900px) {
          .hp-bestseller-inner {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 60px 24px;
          }
        }

        .hp-bestseller-img {
          aspect-ratio: 1/1;
          overflow: hidden;
          border-radius: 4px;
          background: #1a1a1a;
          position: relative;
        }

        .hp-bestseller-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .hp-bestseller-img:hover img {
          transform: scale(1.04);
        }

        .hp-bestseller-badge {
          position: absolute;
          top: 20px;
          left: 20px;
          background: #7AC9EF;
          color: #111;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 6px 12px;
          border-radius: 2px;
        }

        .hp-product-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 400;
          color: #fff;
          line-height: 1.2;
          margin: 0 0 12px;
        }

        .hp-product-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 300;
          color: #7AC9EF;
          margin-bottom: 28px;
        }

        /* ── Why us / cards ── */
        .hp-why {
          background: #141414;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .hp-why-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 96px 48px;
        }

        @media (max-width: 768px) {
          .hp-why-inner { padding: 64px 24px; }
        }

        .hp-why-header {
          text-align: center;
          max-width: 520px;
          margin: 0 auto 64px;
        }

        .hp-why-header .hp-section-label {
          justify-content: center;
        }

        .hp-why-header .hp-section-label::before {
          display: none;
        }

        .hp-why-header .hp-section-label::after {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: #7AC9EF;
        }

        .hp-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }

        @media (max-width: 900px) {
          .hp-cards { grid-template-columns: 1fr; gap: 2px; }
        }

        .hp-card {
          background: #1a1a1a;
          padding: 48px 36px;
          transition: background 0.2s;
          position: relative;
          overflow: hidden;
        }

        .hp-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: transparent;
          transition: background 0.3s;
        }

        .hp-card:hover {
          background: #1f1f1f;
        }

        .hp-card:hover::before {
          background: #7AC9EF;
        }

        .hp-card-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 3px;
          margin-bottom: 28px;
          filter: brightness(0.85) saturate(0.8);
          transition: filter 0.3s;
        }

        .hp-card:hover .hp-card-img {
          filter: brightness(0.95) saturate(1);
        }

        .hp-card-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px;
          font-weight: 300;
          color: rgba(201,184,122,0.15);
          line-height: 1;
          margin-bottom: 16px;
        }

        .hp-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 400;
          color: #fff;
          margin-bottom: 12px;
        }

        .hp-card-text {
          font-size: 12px;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(255,255,255,0.4);
        }

        /* ── CMS content (from Shopify page) ── */
        .hp-cms {
          background: #111;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .hp-cms-inner {
          max-width: 800px;
          margin: 0 auto;
          padding: 96px 48px;
        }

        @media (max-width: 768px) {
          .hp-cms-inner { padding: 64px 24px; }
        }

        .hp-cms-inner h1,
        .hp-cms-inner h2,
        .hp-cms-inner h3 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          color: #fff;
          margin-top: 2em;
          margin-bottom: 0.5em;
        }

        .hp-cms-inner h1 { font-size: 40px; }
        .hp-cms-inner h2 { font-size: 30px; }
        .hp-cms-inner h3 { font-size: 22px; }

        .hp-cms-inner p {
          font-size: 14px;
          font-weight: 300;
          line-height: 1.85;
          color: rgba(255,255,255,0.5);
          margin-bottom: 1.2em;
        }

        .hp-cms-inner a {
          color: #7AC9EF;
          text-decoration: none;
          border-bottom: 1px solid rgba(201,184,122,0.3);
          transition: border-color 0.15s;
        }

        .hp-cms-inner a:hover {
          border-color: #7AC9EF;
        }

        .hp-cms-inner hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.07);
          margin: 2.5em 0;
        }
      `}</style>

      <div className="hp">

        {/* ── Hero ── */}
        <section className="hp-hero">
          <div
            className="hp-hero-img"
            style={{backgroundImage: `url(${Banner1})`}}
          />
          <div className="hp-hero-overlay" />
          <div className="hp-hero-content">
            <div className="hp-hero-label">Välkommen till butiken</div>
            <h1 className="hp-hero-title">
              Din destination<br />
              <em>för modern teknik</em>
            </h1>
            <p className="hp-hero-sub">
              Upptäck vårt noggrant utvalda sortiment — från ljud och bild till smart hem och installation. Allt under ett tak.
            </p>
            <div className="hp-hero-btns">
              <Link to="/collections/all" className="hp-btn-primary">
                Utforska sortimentet
              </Link>
              <Link to="/pages/om-oss" className="hp-btn-secondary">
                Om oss
              </Link>
            </div>
          </div>
        </section>

        {/* ── CMS content from Shopify ── */}
        {homepage?.body && (
          <section className="hp-cms">
            <div className="hp-cms-inner">
              <div className="hp-section-label" style={{marginBottom: '32px'}}>Från redaktionen</div>
              <div dangerouslySetInnerHTML={{__html: homepage.body}} />
            </div>
          </section>
        )}

        {/* ── About / split ── */}
        <section className="hp-about">
          <div className="hp-about-inner">
            <div className="hp-about-img-wrap">
              <img src={ContentImage1} alt="Om oss" />
            </div>
            <div className="hp-about-text">
              <div className="hp-section-label">Vår butik</div>
              <h2 className="hp-section-title">
                Välkommen till<br />vår butik
              </h2>
              <div className="hp-divider" />
              <p className="hp-section-body">
                Upptäck vårt fantastiska sortiment av produkter som är noggrant utvalda för att passa alla dina behov. Oavsett om du letar efter det senaste inom mode, teknik eller heminredning, har vi något för dig.
              </p>
              <p className="hp-section-body">
                Vår butik erbjuder en unik shoppingupplevelse med högkvalitativa produkter och enastående kundservice.
              </p>
              <div>
                <Link to="/collections/all" className="hp-btn-primary">
                  Se alla produkter
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Best seller ── */}
        {bestSeller && (
          <section className="hp-bestseller">
            <div className="hp-bestseller-inner">
              <div className="hp-bestseller-img">
                <div className="hp-bestseller-badge">Bästsäljare</div>
                {bestSeller.featuredImage && (
                  <img
                    src={bestSeller.featuredImage.url}
                    alt={bestSeller.featuredImage.altText || bestSeller.title}
                  />
                )}
              </div>
              <div>
                <div className="hp-section-label">Mest populär</div>
                <h2 className="hp-product-title">{bestSeller.title}</h2>
                <div className="hp-product-price">
                  <Money data={bestSeller.priceRange.minVariantPrice} />
                </div>
                <Link
                  to={`/products/${bestSeller.handle}`}
                  className="hp-btn-primary"
                >
                  Se produkt
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Why us / cards ── */}
        <section className="hp-why">
          <div className="hp-why-inner">
            <div className="hp-why-header">
              <div className="hp-section-label">Varför vi</div>
              <h2 className="hp-section-title">Varför handla hos oss?</h2>
              <p className="hp-section-body" style={{margin: '0 auto', textAlign: 'center'}}>
                Vi erbjuder en unik shoppingupplevelse med högkvalitativa produkter och enastående kundservice.
              </p>
            </div>

            <div className="hp-cards">
              <div className="hp-card">
                {CardImage1 && (
                  <img src={CardImage1} alt="Fri frakt" className="hp-card-img" />
                )}
                <div className="hp-card-num">01</div>
                <div className="hp-card-title">Fri frakt</div>
                <p className="hp-card-text">
                  Vi erbjuder fri frakt på alla beställningar över 500 kr. Handla mer och spara på frakten!
                </p>
              </div>

              <div className="hp-card">
                {CardImage2 && (
                  <img src={CardImage2} alt="Snabb leverans" className="hp-card-img" />
                )}
                <div className="hp-card-num">02</div>
                <div className="hp-card-title">Snabb leverans</div>
                <p className="hp-card-text">
                  Vi strävar efter att leverera dina produkter så snabbt som möjligt. De flesta beställningar skickas inom 24 timmar.
                </p>
              </div>

              <div className="hp-card">
                {CardImage3 && (
                  <img src={CardImage3} alt="Kundsupport" className="hp-card-img" />
                )}
                <div className="hp-card-num">03</div>
                <div className="hp-card-title">Kundsupport</div>
                <p className="hp-card-text">
                  Vårt vänliga kundsupportteam finns här för att hjälpa dig med alla frågor eller problem. Kontakta oss när som helst!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Logo marquee ── */}
        <LogoMarquee logos={LOGOS} />

      </div>
    </>
  );
}

/* ─── GraphQL queries (unchanged) ──────────────────────────────────────── */

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('@netlify/remix-runtime').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */