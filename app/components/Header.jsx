import {Suspense, useEffect, useId, useRef, useState, createContext, useContext} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router-dom';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {Aside, useAside} from '~/components/Aside';
import {SearchInput} from './SearchInput';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCartShopping, faBars, faMagnifyingGlass, faUser} from '@fortawesome/free-solid-svg-icons';
import Logo from '../assets/Logo - Squares Only.svg';
import { useTheme } from './PageLayout';

/**
 * @param {HeaderProps}
 */
export function Header({header, cart, isLoggedIn, publicStoreDomain}) {
  const {shop, menu} = header;
  const {open} = useAside();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
        :root[data-theme="dark"] {
          --bg-primary: #111;
          --bg-secondary: #141414;
          --bg-tertiary: #0d0d0d;
          --bg-card: #1a1a1a;
          --bg-card-hover: #1f1f1f;
          --bg-nav: rgba(18,18,18,0.97);
          --bg-announcement: #1a1a1a;
          --color-text: rgba(255,255,255,0.75);
          --color-heading: #fff;
          --color-muted: rgba(255,255,255,0.5);
          --color-dimmed: rgba(255,255,255,0.4);
          --color-accent: #7AC9EF;
          --color-accent-hover: #558da7;
          --border-subtle: rgba(255,255,255,0.05);
          --border-faint: rgba(255,255,255,0.07);
          --border-card: rgba(201,184,122,0.15);
          --color-card-num: rgba(201,184,122,0.15);
          --color-btn-primary-text: #111;
          --bg-search-overlay: rgba(0,0,0,0.85);
          --color-mega-heading: rgba(255,255,255,0.35);
          --color-mega-link: rgba(255,255,255,0.7);
          --bg-mega-panel: #181818;
          --bg-dropdown: #181818;
          --color-brand-icon: rgba(255,255,255,0.08);
          --color-brand-name: rgba(255,255,255,0.25);
          --shadow-nav: 0 4px 30px rgba(0,0,0,0.4);
        }

        :root[data-theme="light"] {
          --bg-primary: #f5f5f3;
          --bg-secondary: #ebebea;
          --bg-tertiary: #f0f0ee;
          --bg-card: #fff;
          --bg-card-hover: #f9f9f8;
          --bg-nav: rgba(245,245,243,0.97);
          --bg-announcement: #e8e8e6;
          --color-text: rgba(30,30,30,0.8);
          --color-heading: #111;
          --color-muted: rgba(30,30,30,0.55);
          --color-dimmed: rgba(30,30,30,0.45);
          --color-accent: #2a8ab5;
          --color-accent-hover: #1d6a8a;
          --border-subtle: rgba(0,0,0,0.07);
          --border-faint: rgba(0,0,0,0.08);
          --border-card: rgba(100,80,20,0.15);
          --color-card-num: rgba(100,80,20,0.12);
          --color-btn-primary-text: #fff;
          --bg-search-overlay: rgba(245,245,243,0.92);
          --color-mega-heading: rgba(0,0,0,0.4);
          --color-mega-link: rgba(0,0,0,0.7);
          --bg-mega-panel: #fff;
          --bg-dropdown: #fff;
          --color-brand-icon: rgba(0,0,0,0.06);
          --color-brand-name: rgba(0,0,0,0.2);
          --shadow-nav: 0 4px 20px rgba(0,0,0,0.1);
        }

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
          border-bottom: 1px solid rgba(122, 201, 239, 0.4);
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
          display: flex;
          flex-wrap: wrap;
          gap: 40px 48px;
        }

        /* Column group */
        .lc-mega-col {
          padding: 0;
          border-right: none;
          min-width: 160px;
        }

        .lc-mega-heading {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.9);
          margin-bottom: 12px;
          padding-bottom: 0;
          border-bottom: none;
          display: block;
          text-decoration: none;
          transition: color 0.15s;
        }

        .lc-mega-heading:hover {
          color: #7AC9EF;
        }

        .lc-mega-link {
          display: block;
          padding: 4px 0;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: color 0.15s, padding-left 0.15s;
          line-height: 1.6;
          text-transform: none;
        }

        .lc-mega-link:hover {
          color: rgba(255,255,255,0.9);
          padding-left: 0;
        }

        /* Branding panel on the right */
        .lc-mega-brand {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-end;
          margin-left: auto;
          padding: 0;
          gap: 6px;
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
          <NavLink to="/contact">Kontakta teamet för personlig service</NavLink>
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
              <button
                className="lc-icon-btn lc-theme-btn"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀' : '☾'}
              </button>
            </div>

            {/* Centered logo */}
            <div className="lc-logo-wrap">
              <NavLink className="flex items-center justify-center" prefetch="intent" to="/" end>
                {Logo ? (
                  <img
                    src={Logo}
                    alt={shop.name}
                    className="header-logo object-contain bg-center"
                    style={{height: '40px', width: 'auto'}}
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

              <button
                className="lc-icon-btn lc-theme-btn"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀' : '☾'}
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
  const isMega = item.items.length >= MEGA_THRESHOLD ||
    item.items.some((child) => child.items?.length > 0);

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
            {item.items.map((group) => (
              <div key={group.id} className="lc-mega-col">
                {/* Group heading — links to the category page */}
                <NavLink to={group.url} className="lc-mega-heading" onClick={closeAll}>
                  {group.title}
                </NavLink>

                {/* Children under this group */}
                {group.items?.length > 0 ? (
                  group.items.map(({ id, title, url }) => (
                    <NavLink key={id} className="lc-mega-link" to={url} onClick={closeAll}>
                      {title}
                    </NavLink>
                  ))
                ) : null}
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