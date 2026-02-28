import {useState, useRef, useEffect} from 'react';
import {useFetcher} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';

export function SearchInput({classNames}) {
  const fetcher = useFetcher({key: 'search'});
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const popupRef = useRef(null);
  const wrapRef = useRef(null);

  const results = fetcher.data?.result?.items?.products || [];

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') { setOpen(false); setFocused(false); }
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  function handleChange(e) {
    const term = e.target.value;
    if (term.length < 2) { setOpen(false); return; }
    fetcher.submit(
      {q: term, predictive: true},
      {method: 'GET', action: `${fetcher.data?.locale || ''}/search`}
    );
    setOpen(true);
  }

  const loading = fetcher.state !== 'idle';

  return (
    <>
      <style>{`
        .si-wrap {
          position: relative;
          width: 100%;
        }

        .si-field {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 6px;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }

        .si-field.focused {
          background: rgba(255,255,255,0.11);
          border-color: rgba(201,184,122,0.5);
          box-shadow: 0 0 0 3px rgba(201,184,122,0.08);
        }

        .si-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          transition: color 0.2s;
          pointer-events: none;
        }

        .si-field.focused .si-icon {
          color: #c9b87a;
        }

        .si-input {
          flex: 1;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          padding: 0 16px 0 0 !important;
          height: 44px;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.03em;
          color: rgba(255,255,255,0.9) !important;
          caret-color: #c9b87a;
        }

        .si-input::placeholder {
          color: rgba(255,255,255,0.3);
        }

        /* Results panel — anchored ABOVE the input when near bottom,
           but we use bottom: calc(100% + 8px) always since
           the header is sticky at top, results go DOWN from header */
        .si-results {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #1c1c1c;
          border: 1px solid rgba(255,255,255,0.08);
          border-top: 2px solid #c9b87a;
          border-radius: 6px;
          overflow: hidden;
          z-index: 9999;
          box-shadow: 0 24px 60px rgba(0,0,0,0.6);
          animation: siDrop 0.16s ease forwards;
          /* Cap height so it never escapes the viewport */
          max-height: min(420px, calc(100vh - 160px));
          overflow-y: auto;
        }

        @keyframes siDrop {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Scrollbar */
        .si-results::-webkit-scrollbar { width: 4px; }
        .si-results::-webkit-scrollbar-track { background: transparent; }
        .si-results::-webkit-scrollbar-thumb { background: rgba(201,184,122,0.3); border-radius: 2px; }

        .si-result-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
        }

        .si-result-item:last-child {
          border-bottom: none;
        }

        .si-result-item:hover {
          background: rgba(201,184,122,0.07);
        }

        .si-result-img {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 4px;
          flex-shrink: 0;
          background: rgba(255,255,255,0.05);
        }

        .si-result-img-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 4px;
          flex-shrink: 0;
          background: rgba(255,255,255,0.05);
        }

        .si-result-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.9);
          line-height: 1.4;
        }

        .si-result-vendor {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 300;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.05em;
          margin-top: 2px;
        }

        .si-empty {
          padding: 20px 16px;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.3);
          text-align: center;
          text-transform: uppercase;
        }

        .si-loading {
          padding: 20px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .si-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(201,184,122,0.2);
          border-top-color: #c9b87a;
          border-radius: 50%;
          animation: siSpin 0.6s linear infinite;
        }

        @keyframes siSpin {
          to { transform: rotate(360deg); }
        }

        .si-results-header {
          padding: 8px 16px 6px;
          font-family: 'Montserrat', sans-serif;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
      `}</style>

      <div ref={wrapRef} className={`si-wrap ${classNames ?? ''}`}>
        <div className={`si-field${focused ? ' focused' : ''}`}>
          <div className="si-icon">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </div>
          <input
            ref={inputRef}
            type="text"
            name="search"
            placeholder="Sök produkter…"
            className="si-input"
            autoComplete="off"
            onChange={handleChange}
            onFocus={() => {
              setFocused(true);
              if (results.length > 0) setOpen(true);
            }}
          />
        </div>

        {open && (
          <div ref={popupRef} className="si-results">
            {loading ? (
              <div className="si-loading">
                <div className="si-spinner" />
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="si-results-header">Produkter</div>
                {results.map((product) => {
                  const variant = product.variants?.nodes?.[0];
                  const image = variant?.image || product.images?.nodes?.[0];
                  return (
                    <a
                      key={product.id}
                      href={`/products/${product.handle}`}
                      className="si-result-item"
                      onClick={() => setOpen(false)}
                    >
                      {image
                        ? <img src={image.url} alt={product.title} className="si-result-img" />
                        : <div className="si-result-img-placeholder" />
                      }
                      <div>
                        <div className="si-result-title">{product.title}</div>
                        {product.vendor && (
                          <div className="si-result-vendor">{product.vendor}</div>
                        )}
                      </div>
                    </a>
                  );
                })}
              </>
            ) : (
              <div className="si-empty">Inga sökresultat</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}