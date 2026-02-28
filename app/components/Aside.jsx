import {createContext, useContext, useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';

export function Aside({children, heading, type, classes}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  useEffect(() => {
    const abortController = new AbortController();
    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event) {
          if (event.key === 'Escape') close();
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Montserrat:wght@300;400;500;600&display=swap');

        /* ── Overlay backdrop ── */
        .lc-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0);
          pointer-events: none;
          visibility: hidden;
          z-index: 200;
          transition: background 0.35s ease, visibility 0s linear 0.35s;
        }

        .lc-overlay.expanded {
          background: rgba(0, 0, 0, 0.55);
          pointer-events: auto;
          visibility: visible;
          transition: background 0.35s ease, visibility 0s linear 0s;
        }

        /* ── Close-outside hit area ── */
        .lc-close-outside {
          position: absolute;
          inset: 0;
          background: transparent;
          border: none;
          cursor: default;
        }

        /* ── Aside panel ── */
        .lc-aside {
          font-family: 'Montserrat', sans-serif;
          position: fixed;
          top: 0;
          right: 0;
          height: 100dvh;
          width: min(420px, 100vw);
          background: #141414;
          border-left: 1px solid rgba(255,255,255,0.07);
          box-shadow: -24px 0 80px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 201;
          overflow: hidden;
        }

        .lc-overlay.expanded .lc-aside {
          transform: translateX(0);
        }

        /* ── Aside header ── */
        .lc-aside-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          height: 68px;
          flex-shrink: 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: #181818;
        }

        .lc-aside-heading {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin: 0;
        }

        .lc-aside-heading span {
          display: inline-block;
          width: 20px;
          height: 1px;
          background: #7AC9EF;
          vertical-align: middle;
          margin-right: 10px;
          opacity: 0.7;
        }

        /* ── Close button ── */
        .lc-aside-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          font-size: 13px;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          flex-shrink: 0;
        }

        .lc-aside-close:hover {
          color: #fff;
          border-color: rgba(201,184,122,0.5);
          background: rgba(201,184,122,0.07);
        }

        /* ── Aside body ── */
        .lc-aside-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0;
          color: rgba(255,255,255,0.85);

          /* Scrollbar */
          scrollbar-width: thin;
          scrollbar-color: rgba(201,184,122,0.25) transparent;
        }

        .lc-aside-body::-webkit-scrollbar { width: 4px; }
        .lc-aside-body::-webkit-scrollbar-track { background: transparent; }
        .lc-aside-body::-webkit-scrollbar-thumb {
          background: rgba(201,184,122,0.25);
          border-radius: 2px;
        }

        /* ── Style children that come from CartMain ── */

        /* Cart line items */
        .lc-aside-body .cart-line {
          display: flex;
          gap: 16px;
          padding: 20px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
        }

        .lc-aside-body .cart-line:hover {
          background: rgba(255,255,255,0.02);
        }

        .lc-aside-body .cart-line img {
          width: 72px;
          height: 72px;
          object-fit: cover;
          border-radius: 4px;
          flex-shrink: 0;
          background: rgba(255,255,255,0.04);
        }

        .lc-aside-body .cart-line-details {
          flex: 1;
          min-width: 0;
        }

        .lc-aside-body .cart-line-details a {
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          display: block;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.15s;
        }

        .lc-aside-body .cart-line-details a:hover {
          color: #fff;
        }

        .lc-aside-body .cart-line-details .variant {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.05em;
          margin-bottom: 10px;
        }

        .lc-aside-body .cart-line-price {
          font-size: 13px;
          font-weight: 500;
          color: #7AC9EF;
        }

        .lc-aside-body .cart-line-quantity {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
        }

        .lc-aside-body .cart-line-quantity button {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.15s, color 0.15s;
          line-height: 1;
        }

        .lc-aside-body .cart-line-quantity button:hover {
          border-color: rgba(201,184,122,0.5);
          color: #fff;
        }

        .lc-aside-body .cart-line-quantity span {
          font-size: 13px;
          min-width: 20px;
          text-align: center;
          color: rgba(255,255,255,0.75);
        }

        /* Cart summary / totals */
        .lc-aside-footer {
          padding: 20px 28px 28px;
          border-top: 1px solid rgba(255,255,255,0.07);
          background: #181818;
          flex-shrink: 0;
        }

        .lc-aside-footer .cart-subtotal {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 16px;
        }

        .lc-aside-footer .cart-subtotal-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }

        .lc-aside-footer .cart-subtotal-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 400;
          color: #fff;
          letter-spacing: 0.02em;
        }

        .lc-aside-footer a[href*="cart"],
        .lc-aside-footer button[type="submit"] {
          display: block;
          width: 100%;
          padding: 14px 20px;
          background: #7AC9EF;
          color: #111;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-align: center;
          text-decoration: none;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          margin-bottom: 10px;
        }

        .lc-aside-footer a[href*="cart"]:hover,
        .lc-aside-footer button[type="submit"]:hover {
          background: #d9ca8f;
          transform: translateY(-1px);
        }

        /* Empty cart state */
        .lc-aside-body .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 300px;
          gap: 12px;
          padding: 48px 28px;
          text-align: center;
        }

        .lc-aside-body .cart-empty p {
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }

        .lc-aside-body .cart-empty a {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #7AC9EF;
          text-decoration: none;
          border-bottom: 1px solid rgba(122, 201, 239, 0.4);
          padding-bottom: 2px;
          transition: border-color 0.2s;
        }

        .lc-aside-body .cart-empty a:hover {
          border-color: #7AC9EF;
        }

        /* Mobile menu aside */
        .lc-aside.mobile {
          width: min(320px, 100vw);
          background: #141414;
        }

        .lc-aside.mobile .lc-aside-body {
          padding: 24px 0;
        }

        .lc-aside.mobile a {
          display: block;
          padding: 14px 28px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: color 0.15s, padding-left 0.15s;
        }

        .lc-aside.mobile a:hover {
          color: #fff;
          padding-left: 36px;
        }

        /* Gold accent line below header */
        .lc-aside-header::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 28px;
          width: 32px;
          height: 2px;
          background: #7AC9EF;
        }

        .lc-aside-header {
          position: relative;
        }
      `}</style>

      <div
        aria-modal
        className={`lc-overlay ${expanded ? 'expanded' : ''}`}
        role="dialog"
      >
        {/* Click-outside to close */}
        <button className="lc-close-outside" onClick={close} aria-label="Close" />

        <aside className={`lc-aside ${type === 'mobile' ? 'mobile' : ''} ${classes ?? ''}`}>
          {/* Header */}
          <div className="lc-aside-header">
            <h3 className="lc-aside-heading">
              <span />
              {heading}
            </h3>
            <button className="lc-aside-close" onClick={close} aria-label="Close">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Body */}
          <div className="lc-aside-body">
            {children}
          </div>
        </aside>
      </div>
    </>
  );
}

const AsideContext = createContext(null);

Aside.Provider = function AsideProvider({children}) {
  const [type, setType] = useState('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

/** @typedef {'search' | 'cart' | 'mobile' | 'closed'} AsideType */
/**
 * @typedef {{
 *   type: AsideType;
 *   open: (mode: AsideType) => void;
 *   close: () => void;
 * }} AsideContextValue
 */
/** @typedef {import('react').ReactNode} ReactNode */