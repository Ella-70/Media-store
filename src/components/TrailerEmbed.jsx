import './TrailerEmbed.css'

/**
 * Shared TrailerEmbed component.
 * Renders locked, unlocked, loading, and fallback trailer states.
 * Reused across ProductDetailPage, OrderReceiptPage, and MyLibraryPage.
 */
export function TrailerEmbed({
  title = 'Trailer',
  hasAccess = false,
  videoKey = null,
  videoName = null,
  loading = false,
  noVideoFound = false,
  className = '',
}) {
  // Loading skeleton state
  if (loading) {
    return (
      <div className={`trailer-embed-container ${className}`}>
        <div className="trailer-skeleton card">
          <div className="trailer-skeleton-header" />
          <div className="trailer-skeleton-box" />
        </div>
      </div>
    )
  }

  // Locked State (user does not own/rent the title)
  if (!hasAccess) {
    return (
      <div className={`trailer-embed-container ${className}`}>
        <div className="trailer-locked-card card">
          <div className="trailer-locked-header">
            <span className="eyebrow">{title}</span>
            <span className="trailer-locked-badge">Locked</span>
          </div>
          <div className="trailer-locked-body">
            <svg
              className="trailer-lock-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <p className="trailer-locked-text">Buy or rent to unlock the trailer</p>
          </div>
        </div>
      </div>
    )
  }

  // Unlocked State — No Trailer Available on TMDb
  if (noVideoFound || !videoKey) {
    return (
      <div className={`trailer-embed-container ${className}`}>
        <div className="trailer-unlocked-card card">
          <div className="trailer-locked-header">
            <span className="eyebrow">{title}</span>
          </div>
          <p className="trailer-empty-text text-muted">No trailer available for this title.</p>
        </div>
      </div>
    )
  }

  // Unlocked State — Playable Embed
  return (
    <div className={`trailer-embed-container ${className}`}>
      <div className="trailer-player card">
        <div className="trailer-player-header">
          <span className="eyebrow">{title}</span>
          {videoName && <span className="trailer-name text-muted">{videoName}</span>}
        </div>
        <div className="trailer-player-embed">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoKey}`}
            title={`${title} Trailer`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}
