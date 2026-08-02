import './Footer.css'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <a href="/" className="footer-brand-link">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect x="4" y="22" width="24" height="5" rx="1" fill="#4a6fe0"/>
              <rect x="6" y="15" width="20" height="5" rx="1" fill="#f2a93b"/>
              <rect x="8" y="8" width="16" height="5" rx="1" fill="#e15a4b"/>
            </svg>
            The Stacks
          </a>
          <p>Movies, manga, books &amp; comics — one shelf.</p>
        </div>

        {/* Quick nav */}
        <div>
          <p className="footer-nav-heading">Navigate</p>
          <ul className="footer-nav-list">
            <li><a href="/">Browse</a></li>
            <li><a href="/cart">Cart</a></li>
            <li><a href="/wishlist">Wishlist</a></li>
            <li><a href="/settings">Settings</a></li>
          </ul>
        </div>

        {/* Data source attribution */}
        <div className="footer-attribution">
          <p className="footer-attribution-heading">Data provided by</p>
          <div className="footer-sources">
            <span className="footer-source">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="14" fill="#01d277"/>
                <path d="M10 13h4v10h-4zM18 9h4v14h-4z" fill="#fff"/>
              </svg>
              TMDb
            </span>
            <span className="footer-source">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="14" fill="#3a3a3a"/>
                <path d="M11 10c0-1 1-2 3-2h4c2 0 3 1 3 2v12c0 1-1 2-3 2h-4c-2 0-3-1-3-2z" fill="#fff" fillOpacity="0.8"/>
              </svg>
              Open Library
            </span>
            <span className="footer-source">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="14" fill="#2e51a2"/>
                <text x="16" y="21" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">A</text>
              </svg>
              AniList
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45, marginTop: 'var(--space-3xs)' }}>
            This product uses the TMDb API but is not endorsed or certified by TMDb.
            Book data from Open Library. Manga data via AniList.
            Comic data from Open Library.
          </p>
        </div>
      </div>

      <div className="container">
        <p className="footer-bottom">© {new Date().getFullYear()} The Stacks. A demo project — not a real store.</p>
      </div>
    </footer>
  )
}
