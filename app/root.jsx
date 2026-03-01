import {useNonce, getShopAnalytics, Analytics} from '@shopify/hydrogen';
import {defer} from '@netlify/remix-runtime';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
  useRouteLoaderData,
  ScrollRestoration,
  isRouteErrorResponse,
} from '@remix-run/react';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from '~/components/PageLayout';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';

import './lib/fontawesome';
import '@fortawesome/fontawesome-svg-core/styles.css';

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
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

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
    {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'},
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
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return defer({
    ...deferredData,
    ...criticalData,
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
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
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

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

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
        <meta name="viewport" content="width=device-width,initial-scale=1" />
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
            <a href="/" className="err-btn-primary">
              Tillbaka till startsidan
            </a>
            <a href="/collections/all" className="err-btn-secondary">
              Se alla produkter
            </a>
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
