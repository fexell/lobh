import {Suspense, useEffect, useId, useRef, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router-dom';
import {useAnalytics, useOptimisticCart, Image} from '@shopify/hydrogen';
import {Aside, useAside} from '~/components/Aside';
import {SearchInput} from './SearchInput';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCartShopping, faBars, faMagnifyingGlass, faUser} from '@fortawesome/free-solid-svg-icons';

/**
 * @param {HeaderProps}
 */
export function Header({header, cart, isLoggedIn, publicStoreDomain}) {
  const {shop, menu} = header;
  const logoImage = shop?.brand?.logo?.image;
  const {open} = useAside();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const items = (menu || FALLBACK_HEADER_MENU).items;
  const half = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, half);
  const rightItems = items.slice(half);

  return (
    <>
      <style>{`
        .lc-header {
          font-family: 'Montserrat', sans-serif;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .lc-announcement {
          background: #1a1a1a;
          color: #7AC9EF;
          text-align: center;
          padding: 10px 20px;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 500;
          border-bottom: 1px solid #2a2a2a;
        }

        .lc-announcement a {
          color: #7AC9EF;
          text-decoration: none;
          border-bottom: 1px solid rgba(201,184,122,0.4);
          transition: border-color 0.2s;
        }

        .lc-announcement a:hover {
          border-color: #7AC9EF;
        }

        .lc-nav-main {
          background: rgba(18, 18, 18, 0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transition: box-shadow 0.3s ease;
        }

        .lc-nav-main.scrolled {
          box-shadow: 0 4px 30px rgba(0,0,0,0.4);
        }

        .lc-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 40px;
          height: 72px;
        }

        .lc-nav-left {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .lc-nav-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0;
        }

        .lc-logo-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 32px;
        }

        .lc-logo-wrap a {
          display: flex;
          align-items: center;
        }

        .lc-logo-wrap img {
          filter: brightness(0) invert(1);
          height: 40px;
          width: auto;
          transition: opacity 0.2s;
        }

        .lc-logo-wrap a:hover img {
          opacity: 0.75;
        }

        .lc-logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 500;
          color: #fff;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Nav links */
        .lc-nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 0 18px;
          height: 72px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          transition: color 0.2s;
          white-space: nowrap;
        }

        .lc-nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 18px;
          right: 18px;
          height: 1px;
          background: #7AC9EF;
          transform: scaleX(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
        }

        .lc-nav-link:hover,
        .lc-nav-link.active {
          color: #fff;
        }

        .lc-nav-link:hover::after,
        .lc-nav-link.active::after {
          transform: scaleX(1);
        }

        /* Icon buttons */
        .lc-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          position: relative;
          margin-left: 4px;
        }

        .lc-icon-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }

        .lc-icon-btn svg {
          font-size: 15px;
        }

        .lc-cart-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 16px;
          height: 16px;
          background: #7AC9EF;
          color: #111;
          font-size: 9px;
          font-weight: 700;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0;
        }

        /* Dropdown / Mega menu */
        .lc-dropdown-wrap {
          position: static;
        }

        /* Simple dropdown (few items) */
        .lc-dropdown-panel {
          position: fixed;
          left: 0;
          right: 0;
          top: auto; /* set via JS/inline */
          background: #181818;
          border-top: 2px solid #7AC9EF;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          z-index: 200;
          animation: fadeDown 0.2s ease forwards;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Mega menu inner layout */
        .lc-mega-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 40px 48px;
          display: grid;
          grid-template-columns: repeat(3, 1fr) 280px;
          gap: 0 32px;
        }

        /* Column group */
        .lc-mega-col {
          padding: 0 16px 32px;
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        .lc-mega-col:last-of-type {
          border-right: none;
        }

        .lc-mega-heading {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .lc-mega-link {
          display: block;
          padding: 6px 0;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.03em;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: color 0.15s, padding-left 0.15s;
          line-height: 1.5;
        }

        .lc-mega-link:hover {
          color: #fff;
          padding-left: 6px;
        }

        /* Branding panel on the right */
        .lc-mega-brand {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 0 0 8px 24px;
          gap: 8px;
        }

        .lc-mega-brand-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 96px;
          font-weight: 300;
          line-height: 1;
          color: rgba(255,255,255,0.08);
          letter-spacing: -0.04em;
          user-select: none;
        }

        .lc-mega-brand-name {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }

        /* Simple dropdown fallback (non-mega) */
        .lc-simple-panel {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          min-width: 200px;
          background: #181818;
          border: 1px solid rgba(255,255,255,0.08);
          border-top: 2px solid #7AC9EF;
          padding: 8px 0;
          z-index: 200;
          animation: fadeDownSmall 0.18s ease forwards;
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }

        @keyframes fadeDownSmall {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .lc-dropdown-item {
          display: block;
          padding: 10px 24px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          transition: color 0.15s, background 0.15s;
        }

        .lc-dropdown-item:hover {
          color: #fff;
          background: rgba(201,184,122,0.08);
        }

        /* Mobile header */
        .lc-mobile-bar {
          display: none;
        }

        /* Search overlay */
        .lc-search-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          z-index: 300;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .lc-search-inner {
          width: 100%;
          max-width: 640px;
          padding: 0 24px;
        }

        .lc-search-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          display: block;
          margin-bottom: 16px;
        }

        .lc-search-close {
          position: absolute;
          top: 28px;
          right: 36px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          font-size: 24px;
          cursor: pointer;
          transition: color 0.2s;
          line-height: 1;
          padding: 8px;
        }

        .lc-search-close:hover {
          color: #fff;
        }

        /* Hide mobile-right on desktop */
        .lc-mobile-right {
          display: none;
        }

        @media (max-width: 1024px) {
          .lc-nav-left,
          .lc-nav-right {
            display: none;
          }
          .lc-nav-inner {
            grid-template-columns: auto 1fr auto;
            padding: 0 20px;
          }
          .lc-logo-wrap {
            padding: 0;
            justify-content: center;
          }
          .lc-mobile-bar {
            display: flex;
            align-items: center;
          }
          .lc-mobile-right {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 4px;
          }
        }
      `}</style>

      <header className="lc-header">
        {/* Announcement bar */}
        <div className="lc-announcement">
          <a href="/pages/contact">Kontakta teamet för personlig service</a>
        </div>

        {/* Main nav */}
        <nav className={`lc-nav-main${scrolled ? ' scrolled' : ''}`}>
          <div className="lc-nav-inner">

            {/* Left nav (desktop) */}
            <div className="lc-nav-left">
              <HeaderNavItems
                items={leftItems}
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
                close={() => {}}
                shopName={shop.name}
              />
            </div>

            {/* Mobile: hamburger */}
            <div className="lc-mobile-bar">
              <button className="lc-icon-btn" onClick={() => open('mobile')} aria-label="Menu">
                <FontAwesomeIcon icon={faBars} />
              </button>
            </div>

            {/* Centered logo */}
            <div className="lc-logo-wrap">
              <NavLink prefetch="intent" to="/" end>
                {logoImage ? (
                  <Image
                    alt={shop.name}
                    data={logoImage}
                    className="header-logo"
                    width={logoImage.width}
                    height={logoImage.height}
                    sizes="200px"
                  />
                ) : (
                  <span className="lc-logo-text">{shop?.name}</span>
                )}
              </NavLink>
            </div>

            {/* Right nav (desktop) */}
            <div className="lc-nav-right">
              <HeaderNavItems
                items={rightItems}
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
                close={() => {}}
                shopName={shop.name}
              />

              {/* Search icon */}
              <button
                className="lc-icon-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>

              {/* Account icon */}
              {/* <NavLink to="/account" className="lc-icon-btn" aria-label="Account">
                <FontAwesomeIcon icon={faUser} />
              </NavLink> */}

              {/* Cart icon */}
              <button
                className="lc-icon-btn"
                onClick={() => open('cart')}
                aria-label="Cart"
              >
                <FontAwesomeIcon icon={faCartShopping} />
                {cart?.totalQuantity > 0 && (
                  <span className="lc-cart-badge">{cart?.totalQuantity}</span>
                )}
              </button>

              {/* Mobile: only cart + search */}
            </div>

            {/* Mobile right icons */}
            <div className="lc-mobile-right">
              <button className="lc-icon-btn" onClick={() => setSearchOpen(true)}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
              <button className="lc-icon-btn" onClick={() => open('cart')}>
                <FontAwesomeIcon icon={faCartShopping} />
                {cart?.totalQuantity > 0 && (
                  <span className="lc-cart-badge">{cart?.totalQuantity}</span>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Search overlay */}
        {searchOpen && (
          <div className="lc-search-overlay" onClick={() => setSearchOpen(false)}>
            <div className="lc-search-inner" onClick={(e) => e.stopPropagation()}>
              <span className="lc-search-label">Sök</span>
              <SearchInput />
            </div>
            <button className="lc-search-close" onClick={() => setSearchOpen(false)}>✕</button>
          </div>
        )}
      </header>
    </>
  );
}

/** Renders nav items (with dropdown support) for one side */
function HeaderNavItems({ items, primaryDomainUrl, publicStoreDomain, close, shopName }) {
  const normalizeUrl = (url) => {
    if (!url) return '/';
    const isInternal = [primaryDomainUrl, publicStoreDomain, 'myshopify.com'].some(
      (domain) => url.includes(domain),
    );
    return isInternal ? new URL(url).pathname : url;
  };

  return (
    <>
      {items.map((item) => {
        if (!item.url) return null;
        const url = normalizeUrl(item.url);

        if (item.items?.length > 0) {
          const normalizedItem = {
            ...item,
            url,
            items: item.items.map((sub) => ({ ...sub, url: normalizeUrl(sub.url) })),
          };
          return <DropdownMenu key={item.id} item={normalizedItem} close={close} shopName={shopName} />;
        }

        return (
          <NavLink
            key={item.id}
            to={url}
            end
            onClick={close}
            prefetch="intent"
            className={({ isActive }) => `lc-nav-link${isActive ? ' active' : ''}`}
          >
            {item.title}
          </NavLink>
        );
      })}
    </>
  );
}

// How many child items before we switch to mega-menu layout
const MEGA_THRESHOLD = 5;

// Split an array into N roughly-equal columns
function chunkIntoColumns(arr, cols) {
  const result = Array.from({length: cols}, () => []);
  arr.forEach((item, i) => result[i % cols].push(item));
  return result;
}

function DropdownMenu({ item, close, shopName }) {
  const [isOpen, setOpen] = useState(false);
  const firstTap = useRef(true);
  const [isTouchDevice, setTouchDevice] = useState(false);
  const isMega = item.items.length >= MEGA_THRESHOLD;

  useEffect(() => {
    if (typeof window !== 'undefined')
      setTouchDevice(window.matchMedia('(hover: none)').matches);
  }, []);

  const handleTouch = (e) => {
    if (!isTouchDevice) return;
    if (firstTap.current) {
      e.preventDefault();
      setOpen(true);
      firstTap.current = false;
    }
  };

  const closeAll = () => {
    setOpen(false);
    firstTap.current = true;
    close();
  };

  // For mega menu: distribute items across 3 columns
  const columns = isMega ? chunkIntoColumns(item.items, 3) : null;

  return (
    <div
      className="lc-dropdown-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { setOpen(false); firstTap.current = true; }}
      style={{ position: isMega ? 'static' : 'relative' }}
    >
      <NavLink
        to={item.url}
        className={({ isActive }) => `lc-nav-link${isActive ? ' active' : ''}`}
        aria-expanded={isOpen}
        onClick={handleTouch}
      >
        {item.title}
      </NavLink>

      {isOpen && isMega && (
        <div className="lc-dropdown-panel">
          <div className="lc-mega-inner">
            {columns.map((col, ci) => (
              <div key={ci} className="lc-mega-col">
                {col.map(({ id, title, url }) => (
                  <NavLink key={id} className="lc-mega-link" to={url} onClick={closeAll}>
                    {title}
                  </NavLink>
                ))}
              </div>
            ))}
            {/* Branding panel */}
            <div className="lc-mega-brand">
              <div className="lc-mega-brand-icon">K</div>
              <div className="lc-mega-brand-name">{shopName || 'Katalog'}</div>
            </div>
          </div>
        </div>
      )}

      {isOpen && !isMega && (
        <div className="lc-simple-panel">
          {item.items.map(({ id, title, url }) => (
            <NavLink key={id} className="lc-dropdown-item" to={url} onClick={closeAll}>
              {title}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function HeaderMenu({ menu, primaryDomainUrl, viewport, publicStoreDomain }) {
  // Legacy export kept for compatibility — rendering is now handled inside Header
  return null;
}

// ─── Unchanged legacy helpers ────────────────────────────────────────────────

function CartBadge({ count }) {
  const { open } = useAside();
  const { publish, shop, cart, prevCart } = useAnalytics();
  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', { cart, prevCart, shop, url: window.location.href || '' });
      }}
    >
      Cart {count === null ? <span>&nbsp;</span> : count}
    </a>
  );
}

function CartToggle({ cart }) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    { id: 'gid://shopify/MenuItem/461609500728', resourceId: null, tags: [], title: 'Collections', type: 'HTTP', url: '/collections', items: [] },
    { id: 'gid://shopify/MenuItem/461609533496', resourceId: null, tags: [], title: 'Blog', type: 'HTTP', url: '/blogs/journal', items: [] },
    { id: 'gid://shopify/MenuItem/461609566264', resourceId: null, tags: [], title: 'Policies', type: 'HTTP', url: '/policies', items: [] },
    { id: 'gid://shopify/MenuItem/461609599032', resourceId: 'gid://shopify/Page/92591030328', tags: [], title: 'About', type: 'PAGE', url: '/pages/about', items: [] },
  ],
};

function activeLinkStyle({ isActive, isPending }) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : undefined,
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/** @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */
/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */