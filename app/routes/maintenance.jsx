export const meta = () => [{ title: 'Ljud & Bild Hörnan | Under byggnad' }];

export default function Maintenance() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .maint-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #4fc3f7, transparent);
        }
        .maint-btn:hover { border-color: #4fc3f7 !important; color: #4fc3f7 !important; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <div style={{ width: '40px', height: '1px', background: '#4fc3f7' }} />
        <span style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#4fc3f7', textTransform: 'uppercase', fontWeight: 500 }}>
          Under byggnad
        </span>
        <div style={{ width: '40px', height: '1px', background: '#4fc3f7' }} />
      </div>

      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(2.8rem, 7vw, 5rem)',
        fontWeight: 400,
        color: '#f5f0e8',
        textAlign: 'center',
        lineHeight: 1.1,
        margin: '0 0 0.5rem',
      }}>
        Varor <em style={{ fontStyle: 'italic', color: '#b0c8d4' }}>på väg</em>
      </h1>

      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
        fontStyle: 'italic',
        color: '#6a8a9a',
        textAlign: 'center',
        margin: '0 0 2.5rem',
      }}>
        — något gott är på gång
      </p>

      <p style={{ fontSize: '15px', color: '#7a8a90', textAlign: 'center', maxWidth: '360px', lineHeight: 1.7, fontWeight: 300, margin: '0 0 3rem' }}>
        Vi förbereder något nytt för dig. Vårt sortiment av ljud och bild håller på att packas upp och ställas i ordning.
      </p>

      <div style={{ display: 'flex', gap: '1px', marginBottom: '3rem' }}>
        {[true, true, true, false, false, false, false, false].map((active, i) => (
          <div key={i} style={{ width: '8px', height: '8px', background: active ? '#4fc3f7' : i < 5 ? '#2a3d48' : '#1e2a30' }} />
        ))}
      </div>

      <a href="/" className="maint-btn" style={{
        display: 'inline-block',
        padding: '14px 36px',
        border: '1px solid rgba(79,195,247,0.3)',
        color: '#f5f0e8',
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        background: 'transparent',
      }}>
        Tillbaka till startsidan
      </a>
    </div>
  );
}