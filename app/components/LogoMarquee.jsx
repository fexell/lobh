/**
 * LogoMarquee — animated infinite scrolling logo strip
 *
 * Usage in _index.jsx:
 *   import {LogoMarquee} from '~/components/LogoMarquee';
 *
 *   // Import your logo files (SVG or PNG recommended)
 *   import SonyLogo from '../assets/logos/sony.svg';
 *   import BangOlufsenLogo from '../assets/logos/bang-olufsen.svg';
 *   // etc.
 *
 *   const LOGOS = [
 *     {src: SonyLogo, alt: 'Sony'},
 *     {src: BangOlufsenLogo, alt: 'Bang & Olufsen'},
 *     // etc.
 *   ];
 *
 *   // Then in your JSX:
 *   <LogoMarquee logos={LOGOS} />
 */

/**
 * @param {{
 *   logos: Array<{src: string; alt: string}>;
 *   speed?: number;   // seconds for one full cycle (default: 30)
 *   label?: string;   // optional label above the strip
 * }}
 */
export function LogoMarquee({logos, speed = 120, label = 'Företag som litar på oss'}) {
  // Duplicate logos so the seam is invisible
  const doubled = [...logos, ...logos, ...logos, ...logos, ...logos, ...logos];

  return (
    <>
      <style>{`
        .lm-section {
          background: #141414;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 48px 0;
          overflow: hidden;
        }

        .lm-label {
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          margin-bottom: 36px;
          font-family: 'Montserrat', sans-serif;
        }

        /* The outer track clips the scrolling content */
        .lm-track {
          overflow: hidden;
          position: relative;
          /* Fade edges */
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
        }

        /* The inner belt scrolls continuously */
        .lm-belt {
          display: flex;
          align-items: center;
          gap: 64px;
          width: max-content;
          animation: marqueeScroll var(--lm-speed, 30s) linear infinite;
        }

        .lm-belt:hover {
          animation-play-state: paused;
        }

        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .lm-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          height: 40px;
          padding: 0 16px;
        }

        .lm-logo img {
          height: 32px;
          width: auto;
          max-width: 120px;
          object-fit: contain;
          /* Make logos white and desaturated */
          opacity: 1;
          transition: opacity 0.25s ease;
        }

        .lm-logo:hover img {
          opacity: 0.8;
        }

        /* Dot separator between logos */
        .lm-sep {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(122,201,239,0.15);
          flex-shrink: 0;
        }
      `}</style>

      <div className="lm-section">
        {label && <div className="lm-label">{label}</div>}
        <div className="lm-track">
          <div
            className="lm-belt"
            style={{'--lm-speed': `${speed}s`}}
          >
            {doubled.map((logo, i) => (
              <>
                <div key={`logo-${i}`} className="lm-logo">
                  <img src={logo.src} alt={logo.alt} draggable={false} />
                </div>
                <div key={`sep-${i}`} className="lm-sep" />
              </>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}