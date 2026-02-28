import {Suspense} from 'react';
import {Await, NavLink} from 'react-router-dom';
import {Image} from '@shopify/hydrogen';
import FreeMapClientLoader from './FreeMapClientLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapPin, faMobile, faAt } from '@fortawesome/free-solid-svg-icons';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  const {shop} = header;
  const logoImage = header?.shop?.brand?.logo?.image;

  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Montserrat:wght@300;400;500;600&display=swap');

              .lc-footer {
                font-family: 'Montserrat', sans-serif;
                background: #111;
                color: rgba(255,255,255,0.65);
              }

              /* ── Map (small card inside brand column) ── */
              .lc-footer-map {
                width: 100%;
                height: 140px;
                overflow: hidden;
                position: relative;
                border-radius: 6px;
                border: 1px solid rgba(255,255,255,0.07);
                flex-shrink: 0;
              }

              .lc-footer-map > * {
                width: 100% !important;
                height: 100% !important;
              }

              /* Subtle dark tint */
              .lc-footer-map::after {
                content: '';
                position: absolute;
                inset: 0;
                background: rgba(10,10,10,0.2);
                pointer-events: none;
                border-radius: 6px;
              }

              /* ── Main footer body ── */
              .lc-footer-main {
                max-width: 1280px;
                margin: 0 auto;
                padding: 64px 40px 56px;
                display: grid;
                grid-template-columns: 240px repeat(3, 1fr);
                gap: 48px 40px;
              }

              @media (max-width: 1024px) {
                .lc-footer-main {
                  grid-template-columns: 1fr 1fr;
                  gap: 40px 32px;
                }
              }

              @media (max-width: 640px) {
                .lc-footer-main {
                  grid-template-columns: 1fr;
                  padding: 40px 24px 48px;
                  gap: 36px;
                }
              }

              /* ── Brand column ── */
              .lc-footer-brand {
                display: flex;
                flex-direction: column;
                gap: 20px;
              }

              .lc-footer-logo img {
                filter: brightness(0) invert(1);
                height: 48px !important;
                width: auto !important;
                max-width: 180px;
                object-fit: contain;
                opacity: 0.85;
                transition: opacity 0.2s;
              }

              .lc-footer-logo:hover img {
                opacity: 1;
              }

              .lc-footer-logo-text {
                font-family: 'Cormorant Garamond', serif;
                font-size: 20px;
                font-weight: 400;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: rgba(255,255,255,0.85);
              }

              .lc-footer-address {
                font-size: 12px;
                font-weight: 300;
                line-height: 1.8;
                color: rgba(255,255,255,0.35);
                letter-spacing: 0.02em;
              }

              .lc-footer-address a {
                color: rgba(255,255,255,0.45);
                text-decoration: none;
                transition: color 0.15s;
              }

              .lc-footer-address a:hover {
                color: #c9b87a;
              }

              /* ── Nav columns ── */
              .lc-footer-col {
                display: flex;
                flex-direction: column;
                gap: 0;
              }

              .lc-footer-col-heading {
                font-size: 9px;
                font-weight: 700;
                letter-spacing: 0.22em;
                text-transform: uppercase;
                color: rgba(255,255,255,0.25);
                margin-bottom: 18px;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(255,255,255,0.07);
                position: relative;
              }

              .lc-footer-col-heading::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                width: 24px;
                height: 1px;
                background: #7AC9EF;
              }

              .lc-footer-col a {
                display: block;
                padding: 5px 0;
                font-size: 12px;
                font-weight: 300;
                color: rgba(255,255,255,0.5);
                text-decoration: none;
                letter-spacing: 0.03em;
                transition: color 0.15s, padding-left 0.15s;
                line-height: 1.6;
              }

              .lc-footer-col a:hover {
                color: rgba(255,255,255,0.9);
                padding-left: 6px;
              }

              /* Opening hours block */
              .lc-footer-hours {
                margin-bottom: 20px;
              }

              .lc-footer-hours-name {
                font-size: 11px;
                font-weight: 500;
                color: rgba(255,255,255,0.6);
                margin-bottom: 6px;
                letter-spacing: 0.05em;
              }

              .lc-footer-hours-row {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                font-weight: 300;
                color: rgba(255,255,255,0.35);
                line-height: 1.8;
                letter-spacing: 0.02em;
                gap: 16px;
              }

              .lc-footer-hours-row span:last-child {
                text-align: right;
                color: rgba(255,255,255,0.25);
              }

              /* ── Divider ── */
              .lc-footer-divider {
                max-width: 1280px;
                margin: 0 auto;
                border: none;
                border-top: 1px solid rgba(255,255,255,0.07);
              }

              /* ── Bottom bar ── */
              .lc-footer-bottom {
                background: #0d0d0d;
                border-top: 1px solid rgba(255,255,255,0.05);
              }

              .lc-footer-bottom-inner {
                max-width: 1280px;
                margin: 0 auto;
                padding: 18px 40px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                flex-wrap: wrap;
              }

              @media (max-width: 640px) {
                .lc-footer-bottom-inner {
                  padding: 18px 24px;
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 12px;
                }
              }

              .lc-footer-copy {
                font-size: 10px;
                font-weight: 300;
                letter-spacing: 0.1em;
                color: rgba(255,255,255,0.2);
                text-transform: uppercase;
              }

              .lc-footer-policy-links {
                display: flex;
                flex-wrap: wrap;
                gap: 6px 20px;
              }

              .lc-footer-policy-links a {
                font-size: 10px;
                font-weight: 300;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: rgba(255,255,255,0.25);
                text-decoration: none;
                transition: color 0.15s;
              }

              .lc-footer-policy-links a:hover {
                color: rgba(255,255,255,0.6);
              }

              .lc-footer-gold {
                color: #7AC9EF;
              }
            `}</style>

            <footer className="lc-footer">

              {/* Main columns */}
              <div className="lc-footer-main">

                {/* Brand / contact */}
                <div className="lc-footer-brand">
                  <NavLink className="lc-footer-logo" prefetch="intent" to="/" end>
                    {logoImage ? (
                      <Image
                        alt={shop.name}
                        data={logoImage}
                        sizes="180px"
                      />
                    ) : (
                      <span className="lc-footer-logo-text">{shop?.name}</span>
                    )}
                  </NavLink>

                  <div className="lc-footer-address">
                    <div><FontAwesomeIcon icon={faMapPin} /> Knut Peters väg 42</div>
                    <div>302 41, Halmstad</div>
                    <br />
                    <div>
                      <FontAwesomeIcon icon={faMobile} /> Telefon:{' '}
                      <a href="tel:035191100">035 - 19 11 00</a>
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faAt} /> E-mail:{' '}
                      <a href="mailto:info@yourstore.se">info@yourstore.se</a>
                    </div>
                  </div>

                  {/* Small map card */}
                  <div className="lc-footer-map">
                    <a
                    className="lc-footer-map-link absolute w-full h-full z-50"
                    href="https://maps.app.goo.gl/QPGC2e9zLpWhWcHs5"
                    target="_blank"
                    rel="noopener noreferrer"></a>
                    <Suspense fallback={<div style={{height:'100%',background:'#1a1a1a',borderRadius:'6px'}} />}>
                      <FreeMapClientLoader />
                    </Suspense>
                  </div>
                </div>

                {/* Opening hours */}
                <div className="lc-footer-col">
                  <div className="lc-footer-col-heading">Öppettider</div>

                  <div className="lc-footer-hours">
                    <div className="lc-footer-hours-name">Concept Store</div>
                    <div className="lc-footer-hours-row"><span>Mån – Fre</span><span>10.00 – 18.00</span></div>
                    <div className="lc-footer-hours-row"><span>Lördag</span><span>10.00 – 15.00</span></div>
                    <div className="lc-footer-hours-row"><span>Söndag</span><span>Stängt</span></div>
                  </div>

                  <div className="lc-footer-hours">
                    <div className="lc-footer-hours-name">Installation</div>
                    <div className="lc-footer-hours-row"><span>Mån – Fre</span><span>07.00 – 17.00</span></div>
                    <div className="lc-footer-hours-row"><span>Lördag</span><span>10.00 – 15.00</span></div>
                    <div className="lc-footer-hours-row"><span>Söndag</span><span>Stängt</span></div>
                  </div>
                </div>

                {/* Header nav links (Lär känna oss style) */}
                <div className="lc-footer-col">
                  <div className="lc-footer-col-heading">Navigering</div>
                  <FooterNavLinks
                    menu={header.menu}
                    primaryDomainUrl={header.shop.primaryDomain.url}
                    publicStoreDomain={publicStoreDomain}
                  />
                </div>

                {/* Footer policy menu */}
                <div className="lc-footer-col">
                  <div className="lc-footer-col-heading">Kundtjänst</div>
                  {footer?.menu && (
                    <FooterNavLinks
                      menu={footer.menu}
                      primaryDomainUrl={header.shop.primaryDomain.url}
                      publicStoreDomain={publicStoreDomain}
                    />
                  )}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="lc-footer-bottom">
                <div className="lc-footer-bottom-inner">
                  <div className="lc-footer-copy">
                    © {new Date().getFullYear()} <span className="lc-footer-gold">{shop?.name}</span>. Alla rättigheter förbehållna.
                  </div>
                  <div className="lc-footer-policy-links">
                    {footer?.menu &&
                      normalizeMenuItems(footer.menu, header.shop.primaryDomain.url, publicStoreDomain)
                        .map((item) => (
                          <a key={item.id} href={item.url}>{item.title}</a>
                        ))
                    }
                  </div>
                </div>
              </div>

            </footer>
          </>
        )}
      </Await>
    </Suspense>
  );
}

/* ── Helpers ── */

function normalizeMenuItems(menu, primaryDomainUrl, publicStoreDomain) {
  return (menu || FALLBACK_FOOTER_MENU).items.map((item) => {
    if (!item.url) return item;
    const url =
      item.url.includes('myshopify.com') ||
      item.url.includes(publicStoreDomain) ||
      item.url.includes(primaryDomainUrl)
        ? new URL(item.url).pathname
        : item.url;
    return {...item, url};
  });
}

function FooterNavLinks({menu, primaryDomainUrl, publicStoreDomain}) {
  const items = normalizeMenuItems(menu, primaryDomainUrl, publicStoreDomain);

  return (
    <>
      {items.map((item) => {
        if (!item.url) return null;
        const isExternal = !item.url.startsWith('/');
        return isExternal ? (
          <a key={item.id} href={item.url} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        ) : (
          <NavLink key={item.id} end prefetch="intent" to={item.url}>
            {item.title}
          </NavLink>
        );
      })}
    </>
  );
}

/* ── Fallback ── */
const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {id: 'gid://shopify/MenuItem/461633060920', resourceId: 'gid://shopify/ShopPolicy/23358046264', tags: [], title: 'Privacy Policy', type: 'SHOP_POLICY', url: '/policies/privacy-policy', items: []},
    {id: 'gid://shopify/MenuItem/461633093688', resourceId: 'gid://shopify/ShopPolicy/23358013496', tags: [], title: 'Refund Policy', type: 'SHOP_POLICY', url: '/policies/refund-policy', items: []},
    {id: 'gid://shopify/MenuItem/461633126456', resourceId: 'gid://shopify/ShopPolicy/23358111800', tags: [], title: 'Shipping Policy', type: 'SHOP_POLICY', url: '/policies/shipping-policy', items: []},
    {id: 'gid://shopify/MenuItem/461633159224', resourceId: 'gid://shopify/ShopPolicy/23358079032', tags: [], title: 'Terms of Service', type: 'SHOP_POLICY', url: '/policies/terms-of-service', items: []},
  ],
};

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */