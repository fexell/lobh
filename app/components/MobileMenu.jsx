import {useState} from 'react';
import {NavLink} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons';

export function MyMobileMenu({header, publicStoreDomain, primaryDomainUrl}) {
  const {menu, shop} = header;
  const logoImage = shop?.brand?.logo?.image;
  const [openItem, setOpenItem] = useState(null);

  const normalizeUrl = (url) => {
    if (!url) return '/';
    const isInternal = [primaryDomainUrl, publicStoreDomain, 'myshopify.com'].some(
      (domain) => url.includes(domain),
    );
    return isInternal ? new URL(url).pathname : url;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Montserrat:wght@300;400;500;600&display=swap');

        .mm-wrap {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #141414;
          font-family: 'Montserrat', sans-serif;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .mm-wrap::-webkit-scrollbar { display: none; }

        /* Gold top accent line */
        .mm-accent {
          height: 2px;
          background: linear-gradient(90deg, #7AC9EF 0%, rgba(201,184,122,0.2) 100%);
          flex-shrink: 0;
        }

        /* Nav list */
        .mm-nav {
          flex: 1;
          padding: 12px 0 32px;
        }

        /* Top-level item row */
        .mm-item {
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .mm-item:first-child {
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        /* Link / button row */
        .mm-link,
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
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          text-align: left;
        }

        .mm-link:hover,
        .mm-parent-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.03);
        }

        .mm-link.active {
          color: #7AC9EF;
        }

        /* Active indicator bar */
        .mm-link.active::before {
          content: '';
          display: inline-block;
          width: 16px;
          height: 1px;
          background: #7AC9EF;
          margin-right: 14px;
          flex-shrink: 0;
          vertical-align: middle;
        }

        /* Chevron icon */
        .mm-chevron {
          font-size: 10px;
          color: rgba(255,255,255,0.25);
          transition: transform 0.25s ease, color 0.2s;
          flex-shrink: 0;
        }

        .mm-chevron.open {
          transform: rotate(180deg);
          color: #7AC9EF;
        }

        /* Submenu */
        .mm-sub {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(0,0,0,0.2);
        }

        .mm-sub.open {
          max-height: 600px;
        }

        .mm-sub-link {
          display: block;
          padding: 13px 32px 13px 48px;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: color 0.15s, padding-left 0.15s;
        }

        .mm-sub-link:last-child {
          border-bottom: none;
        }

        .mm-sub-link:hover {
          color: rgba(255,255,255,0.85);
          padding-left: 56px;
        }

        /* Footer area inside menu */
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

        .mm-gold-bar {
          display: inline-block;
          width: 20px;
          height: 1px;
          background: #7AC9EF;
          margin-right: 10px;
          vertical-align: middle;
          opacity: 0.6;
        }
      `}</style>

      <div className="mm-wrap">
        {/* Gold accent */}
        <div className="mm-accent" />

        {/* Nav items */}
        <nav className="mm-nav">
          {menu.items.map((item) => {
            if (!item.url) return null;
            const url = normalizeUrl(item.url);
            const hasChildren = item.items?.length > 0;
            const isOpen = openItem === item.id;

            if (hasChildren) {
              return (
                <div key={item.id} className="mm-item">
                  <button
                    className="mm-parent-btn"
                    onClick={() => setOpenItem(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                  >
                    <span>
                      {isOpen && <span className="mm-gold-bar" />}
                      {item.title}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`mm-chevron${isOpen ? ' open' : ''}`}
                    />
                  </button>
                  <div className={`mm-sub${isOpen ? ' open' : ''}`}>
                    {item.items.map((sub) => (
                      <NavLink
                        key={sub.id}
                        to={normalizeUrl(sub.url)}
                        className="mm-sub-link"
                        prefetch="intent"
                      >
                        {sub.title}
                      </NavLink>
                    ))}
                  </div>
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
                >
                  {item.title}
                </NavLink>
              </div>
            );
          })}
        </nav>

        {/* Contact footer */}
        <div className="mm-footer">
          <div className="mm-footer-label">Kontakt</div>
          <a href="tel:035191100" className="mm-contact-link">035 - 19 11 00</a>
          <a href="mailto:info@yourstore.se" className="mm-contact-link">info@yourstore.se</a>
        </div>
      </div>
    </>
  );
}