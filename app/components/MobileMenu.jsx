import {useState, useRef} from 'react';
import {NavLink} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight, faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import {useAside} from './Aside.jsx';

export function MyMobileMenu({header, publicStoreDomain, primaryDomainUrl}) {
  const {menu, shop} = header;
  const {close} = useAside();

  // Stack of panels: each entry is { title, items }
  // Start with root panel (no title)
  const [stack, setStack] = useState([{title: null, items: menu.items}]);
  const [direction, setDirection] = useState('forward'); // 'forward' | 'back'
  const [animating, setAnimating] = useState(false);

  const normalizeUrl = (url) => {
    if (!url) return '/';
    const isInternal = [primaryDomainUrl, publicStoreDomain, 'myshopify.com'].some(
      (domain) => url.includes(domain),
    );
    return isInternal ? new URL(url).pathname : url;
  };

  const push = (title, items) => {
    if (animating) return;
    setDirection('forward');
    setAnimating(true);
    setStack((prev) => [...prev, {title, items}]);
    setTimeout(() => setAnimating(false), 320);
  };

  const pop = () => {
    if (animating || stack.length <= 1) return;
    setDirection('back');
    setAnimating(true);
    setStack((prev) => prev.slice(0, -1));
    setTimeout(() => setAnimating(false), 320);
  };

  const current = stack[stack.length - 1];
  const depth = stack.length - 1;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .mm-wrap {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #141414;
          font-family: "Montserrat", sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Gold top accent line */
        .mm-accent {
          height: 2px;
          background: linear-gradient(90deg, #7AC9EF 0%, rgba(122,201,239,0.1) 100%);
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }

        /* Panel header (back button + title) */
        .mm-panel-header {
          display: flex;
          align-items: center;
          padding: 0 24px;
          height: 52px;
          flex-shrink: 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative;
          z-index: 2;
          background: #141414;
        }

        .mm-back-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: rgba(255,255,255,0.4);
          font-family: "Montserrat", sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          transition: color 0.2s;
        }

        .mm-back-btn:hover {
          color: #7AC9EF;
        }

        .mm-back-icon {
          font-size: 10px;
        }

        .mm-panel-title {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          white-space: nowrap;
          pointer-events: none;
        }

        /* Breadcrumb depth dots */
        .mm-depth-dots {
          display: flex;
          gap: 5px;
          margin-left: auto;
        }

        .mm-depth-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: background 0.2s;
        }

        .mm-depth-dot.active {
          background: #7AC9EF;
        }

        /* Panel viewport — clips the sliding panels */
        .mm-viewport {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        /* Sliding panel */
        .mm-panel {
          position: absolute;
          inset: 0;
          overflow-y: auto;
          scrollbar-width: none;
          padding-bottom: 32px;
        }

        .mm-panel::-webkit-scrollbar { display: none; }

        /* Slide animations */
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0.5; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); opacity: 0.5; }
          to   { transform: translateX(0);     opacity: 1; }
        }

        .mm-panel.enter-forward {
          animation: slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .mm-panel.enter-back {
          animation: slideInFromLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Nav item rows */
        .mm-item {
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .mm-item:first-child {
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        /* Leaf link */
        .mm-link {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 18px 32px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          background: transparent;
          transition: color 0.2s, background 0.2s;
        }

        .mm-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.03);
        }

        .mm-link.active {
          color: #7AC9EF;
        }

        .mm-link.active::before {
          content: "";
          display: inline-block;
          width: 16px;
          height: 1px;
          background: #7AC9EF;
          margin-right: 14px;
          flex-shrink: 0;
        }

        /* Parent button (has children → push) */
        .mm-parent-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 18px 32px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: color 0.2s, background 0.2s;
          font-family: "Montserrat", sans-serif;
        }

        .mm-parent-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.03);
        }

        .mm-chevron-right {
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          transition: color 0.2s, transform 0.2s;
        }

        .mm-parent-btn:hover .mm-chevron-right {
          color: #7AC9EF;
          transform: translateX(2px);
        }

        /* Subheader label for grouped sub-items (depth ≥ 2) */
        .mm-group-label {
          padding: 20px 32px 8px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        /* Footer */
        .mm-footer {
          padding: 24px 32px 40px;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

        .mm-footer-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-bottom: 14px;
        }

        .mm-contact-link {
          display: block;
          font-size: 12px;
          font-weight: 300;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          letter-spacing: 0.03em;
          line-height: 2;
          transition: color 0.15s;
        }

        .mm-contact-link:hover {
          color: #7AC9EF;
        }
      `}} />

      <div className="mm-wrap">
        <div className="mm-accent" />

        {/* Panel header: back button + title + depth dots */}
        <div className="mm-panel-header">
          {depth > 0 ? (
            <button className="mm-back-btn" onClick={pop} aria-label="Go back">
              <FontAwesomeIcon icon={faChevronLeft} className="mm-back-icon" />
              Tillbaka
            </button>
          ) : (
            <div style={{width: 60}} />
          )}

          {current.title && (
            <span className="mm-panel-title">{current.title}</span>
          )}

          <div className="mm-depth-dots">
            {stack.map((_, i) => (
              <div
                key={i}
                className={`mm-depth-dot${i === depth ? ' active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Sliding viewport */}
        <div className="mm-viewport">
          <div
            key={depth} // re-mount triggers animation
            className={`mm-panel ${animating ? (direction === 'forward' ? 'enter-forward' : 'enter-back') : ''}`}
          >
            {current.items.map((item) => {
              if (!item.url) return null;
              const url = normalizeUrl(item.url);
              const hasChildren = item.items?.length > 0;

              if (hasChildren) {
                return (
                  <div key={item.id} className="mm-item">
                    <button
                      className="mm-parent-btn"
                      onClick={() => push(item.title, item.items)}
                    >
                      <span>{item.title}</span>
                      <FontAwesomeIcon icon={faChevronRight} className="mm-chevron-right" />
                    </button>
                  </div>
                );
              }

              return (
                <div key={item.id} className="mm-item">
                  <NavLink
                    className={({isActive}) => `mm-link${isActive ? ' active' : ''}`}
                    end
                    prefetch="intent"
                    to={url}
                    onClick={close}
                  >
                    {item.title}
                  </NavLink>
                </div>
              );
            })}
          </div>
        </div>

        {/* Only show contact footer on root panel */}
        {depth === 0 && (
          <div className="mm-footer">
            <div className="mm-footer-label">Kontakt</div>
            <a href="tel:035191100" className="mm-contact-link">035 - 19 11 00</a>
            <a href="mailto:info@yourstore.se" className="mm-contact-link">info@yourstore.se</a>
          </div>
        )}
      </div>
    </>
  );
}