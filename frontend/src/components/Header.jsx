export default function Header() {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div>
          <div className="brand-name">ShortLink</div>
          <div className="brand-subtitle">Simple, reliable URL shortening</div>
        </div>
      </div>

      <div className="status-pill" aria-label="API status">
        <span className="status-dot" />
        API Online
      </div>
    </header>
  );
}
