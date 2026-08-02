import { Link } from 'react-router-dom'
import './FeaturedBanner.css'

export function FeaturedBanner({ item }) {
  if (!item) return null

  const backdrop = item.backdrop || item.cover

  return (
    <Link
      to={`/product/${item.type}/${encodeURIComponent(item.sourceId)}`}
      state={{ item }}
      className={`featured-banner featured-banner-${item.type}`}
    >
      {backdrop && <img className="featured-banner-bg" src={backdrop} alt="" aria-hidden="true" />}
      <div className="featured-banner-scrim" />
      <div className="featured-banner-content">
        <span className="eyebrow">Now showing</span>
        <h2>{item.title}</h2>
        {item.synopsis && <p className="featured-banner-synopsis">{item.synopsis}</p>}
        <span className="btn btn-primary">View details</span>
      </div>
    </Link>
  )
}
