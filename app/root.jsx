import {useNonce, getShopAnalytics, Analytics} from '@shopify/hydrogen';
import {json} from '@netlify/remix-runtime';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
  useRouteLoaderData,
  ScrollRestoration,
  isRouteErrorResponse,
  NavLink,
} from '@remix-run/react';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import asideStyles from '~/styles/aside.css?url';
import {PageLayout} from '~/components/PageLayout';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';

import './lib/fontawesome';
import '@fortawesome/fontawesome-svg-core/styles.css';

export const meta = () => {
  const siteUrl = "https://ljudochbildhornan.se";
  const siteName = "Ljud & Bild Hörnan";
  const title = "Ljud & Bild Hörnan | Din destination för modern teknik";
  const description =
    "Ljud & Bild Hörnan i Katrineholm – din lokala butik för ljud, bild, smart hem och installation. Varumärken som Apple, Samsung, Bosch, Miele, Audio Pro m.fl. Fri frakt över 500 kr.";
  const ogImage = `${siteUrl}/images/og/OG.png`; // Byt till en riktig OG-bild (1200x630px JPG/PNG)
  const locale = "sv_SE";

  return [
    // ─── Grundläggande ───────────────────────────────────────────
    { title },
    { name: "description", content: description },
    { name: "author", content: siteName },
    { name: "robots", content: "index, follow" },
    { name: "language", content: "Swedish" },

    // ─── Canonical ────────────────────────────────────────────────
    { tagName: "link", rel: "canonical", href: siteUrl },

    // ─── Open Graph (Facebook, LinkedIn, m.fl.) ──────────────────
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: siteUrl },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: `${siteName} logotyp` },
    { property: "og:locale", content: locale },

    // ─── Twitter / X Cards ───────────────────────────────────────
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    { name: "twitter:image:alt", content: `${siteName} logotyp` },
    // { name: "twitter:site", content: "@dittTwitterHandle" }, // Lägg till om ni har Twitter

    // ─── Geo / lokal SEO ─────────────────────────────────────────
    { name: "geo.region", content: "SE-D" }, // Södermanlands län
    { name: "geo.placename", content: "Katrineholm" },
    { name: "geo.position", content: "58.99435315398727;16.204195497366467" },
    { name: "ICBM", content: "58.9956, 16.2073" },

    // ─── Tema & PWA ──────────────────────────────────────────────
    { name: "theme-color", content: "#7AC9EF" }, // Matcha er primärfärg
    { name: "color-scheme", content: "dark light" },
    { tagName: "link", rel: "icon", href: "/favicon.ico" },
    { tagName: "link", rel: "apple-touch-icon", href: "/apple-touch-icon.png" },

    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://ljudochbildhornan.se/#business",
        name: "Ljud & Bild Hörnan",
        description:
          "Lokal butik i Katrineholm för ljud, bild, smart hem och installation.",
        url: "https://ljudochbildhornan.se",
        telephone: "+46351911 00",
        email: "butik@katrineholmhemel.se",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Drottninggatan 8",
          addressLocality: "Katrineholm",
          postalCode: "641 30",
          addressCountry: "SE",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 58.99435315398727,
          longitude: 16.204195497366467,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "10:00",
            closes: "17:00",
          },
        ],
        priceRange: "$$",
        currenciesAccepted: "SEK",
        paymentAccepted: "Credit Card, Cash",
        hasMap: "https://www.google.com/maps/place/LJUD%26BILD-h%C3%B6rnan+(Katrineholms+Hemelektronik+AB)/@58.9943175,16.2040305,20z/data=!4m6!3m5!1s0x465eb79374d6daf5:0x52c3d9d250ad3550!8m2!3d58.9941049!4d16.2040504!16s%2Fg%2F12qgpb0f5?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D",
        sameAs: [
          // Lägg till era sociala medier-URLs här om ni har dem:
          // "https://www.facebook.com/...",
          // "https://www.instagram.com/...",
        ],
      },
    }
  ];
};

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({
  formMethod,
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  if (formMethod && formMethod !== 'GET') return true;

  // Ta bort eller invertera detta villkor — det triggade omloadning på /→/
  // if (currentUrl.toString() === nextUrl.toString()) return true;

  return defaultShouldRevalidate;
};

export function links() {
  return [
    {rel: 'stylesheet', href: resetStyles},
    {rel: 'stylesheet', href: appStyles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Montserrat:wght@300;400;500;600&display=swap',
    },
  ];
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const {storefront, customerAccount, cart, env} = args.context;

  const [header, cartData, isLoggedIn, footer] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      variables: {headerMenuHandle: 'main-menu'},
    }),
    cart.get(),
    customerAccount.isLoggedIn(),
    storefront.query(FOOTER_QUERY, {
      variables: {footerMenuHandle: 'footer'},
    }).catch((error) => {
      console.error(error);
      return null;
    }),
  ]);

  return json({
    header,
    cart: cartData,
    isLoggedIn,
    footer,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    },
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheShort(), // snabbare, mer responsiv cache
      variables: {
        headerMenuHandle: 'main-menu',
      },
    }),
    // Lägg till fler kritiska queries här om du har dem
  ]);

  return {
    header,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(), // bra för statiskt innehåll
      variables: {
        footerMenuHandle: 'footer',
      },
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export const headers = () => {
  return {
    'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400',
  };
};

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <PageLayout {...data}>{children}</PageLayout>
          </Analytics.Provider>
        ) : (
          children
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

// Drop-in replacement for the ErrorBoundary in root.jsx
// Paste this over your existing ErrorBoundary function

export function ErrorBoundary() {
  const error = useRouteError();
  let errorStatus = 500;
  let errorMessage = 'Unknown error';

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const is404 = errorStatus === 404;

  return (
    <>
      <style>{`
        .err-page {
          background: #111;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Montserrat', sans-serif;
          text-align: center;
          padding: 48px 24px;
          position: relative;
          overflow: hidden;
        }

        /* Large ghost number in background */
        .err-bg-number {
          position: absolute;
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(200px, 35vw, 400px);
          font-weight: 300;
          color: rgba(255,255,255,0.025);
          line-height: 1;
          user-select: none;
          pointer-events: none;
          letter-spacing: -0.04em;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          white-space: nowrap;
        }

        /* Content sits above the ghost number */
        .err-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          animation: errFade 0.6s ease both;
        }

        @keyframes errFade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .err-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #7AC9EF;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .err-label::before,
        .err-label::after {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: #7AC9EF;
        }

        .err-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 300;
          color: #fff;
          margin: 0 0 16px;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }

        .err-divider {
          width: 40px;
          height: 1px;
          background: rgba(122,201,239,0.3);
          margin: 0 auto 20px;
        }

        .err-message {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.75;
          color: rgba(255,255,255,0.35);
          max-width: 380px;
          margin-bottom: 40px;
          letter-spacing: 0.02em;
        }

        /* Error detail for 500s */
        .err-detail {
          font-size: 11px;
          font-weight: 300;
          font-family: 'Courier New', monospace;
          color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 3px;
          padding: 12px 20px;
          margin-bottom: 40px;
          max-width: 480px;
          word-break: break-word;
          text-align: left;
        }

        .err-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .err-btn-primary {
          display: inline-flex;
          align-items: center;
          padding: 14px 32px;
          background: #7AC9EF;
          color: #0d1a22;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 3px;
          transition: background 0.2s, transform 0.15s;
          border: none;
          cursor: pointer;
        }

        .err-btn-primary:hover {
          background: #9dd8f4;
          transform: translateY(-1px);
        }

        .err-btn-secondary {
          display: inline-flex;
          align-items: center;
          padding: 14px 32px;
          background: transparent;
          color: rgba(255,255,255,0.45);
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 3px;
          transition: border-color 0.2s, color 0.2s;
          cursor: pointer;
        }

        .err-btn-secondary:hover {
          border-color: rgba(255,255,255,0.3);
          color: rgba(255,255,255,0.75);
        }

        /* Corner accent lines */
        .err-corner {
          position: absolute;
          width: 48px;
          height: 48px;
          pointer-events: none;
        }

        .err-corner-tl { top: 32px; left: 32px; border-top: 1px solid rgba(122,201,239,0.2); border-left: 1px solid rgba(122,201,239,0.2); }
        .err-corner-tr { top: 32px; right: 32px; border-top: 1px solid rgba(122,201,239,0.2); border-right: 1px solid rgba(122,201,239,0.2); }
        .err-corner-bl { bottom: 32px; left: 32px; border-bottom: 1px solid rgba(122,201,239,0.2); border-left: 1px solid rgba(122,201,239,0.2); }
        .err-corner-br { bottom: 32px; right: 32px; border-bottom: 1px solid rgba(122,201,239,0.2); border-right: 1px solid rgba(122,201,239,0.2); }

        @media (max-width: 480px) {
          .err-corner { display: none; }
          .err-actions { flex-direction: column; align-items: stretch; }
          .err-btn-primary, .err-btn-secondary { justify-content: center; }
        }
      `}</style>

      <div className="err-page">

        {/* Decorative corner brackets */}
        <div className="err-corner err-corner-tl" />
        <div className="err-corner err-corner-tr" />
        <div className="err-corner err-corner-bl" />
        <div className="err-corner err-corner-br" />

        {/* Ghost number in background */}
        <div className="err-bg-number">{errorStatus}</div>

        <div className="err-content">
          <div className="err-label">{errorStatus}</div>

          <h1 className="err-title">
            {is404
              ? <>Sidan hittades<br />inte</>
              : <>Något gick<br />fel</>
            }
          </h1>

          <div className="err-divider" />

          <p className="err-message">
            {is404
              ? 'Sidan du letar efter finns inte eller har flyttats. Kontrollera adressen eller gå tillbaka till startsidan.'
              : 'Ett oväntat fel har uppstått. Försök igen eller kontakta oss om problemet kvarstår.'
            }
          </p>

          {!is404 && errorMessage && errorMessage !== 'Unknown error' && (
            <div className="err-detail">{errorMessage}</div>
          )}

          <div className="err-actions">
            <NavLink to="/" className="err-btn-primary">
              Tillbaka till startsidan
            </NavLink>
            <NavLink to="/collections/all" className="err-btn-secondary">
              Se alla produkter
            </NavLink>
          </div>
        </div>

      </div>
    </>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('@netlify/remix-runtime').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@remix-run/react').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
