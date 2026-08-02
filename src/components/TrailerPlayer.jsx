import './TrailerPlayer.css'

export function TrailerPlayer({ videoKey, title, name, className = '' }) {
  if (!videoKey) return null

  return (
    <div className={`trailer-player card ${className}`}>
      <div className="trailer-player-header">
        <span className="eyebrow">{title}</span>
        {name && <span className="trailer-name text-muted">{name}</span>}
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
  )
}
