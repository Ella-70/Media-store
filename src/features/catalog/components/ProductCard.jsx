import { Link } from 'react-router-dom'
import './ProductCard.css'

const TYPE_LABEL = { movie: 'Film', book: 'Book', manga: 'Manga', comic: 'Comic' }

export function ProductCard({ item }) {
  return (
    <Link
      to={`/product/${item.type}/${encodeURIComponent(item.sourceId)}`}
      state={{ item }}
      className={`product-card product-card-${item.type}`}
    >
      <div className="product-card-cover">
        {item.cover ? (
          <img src={item.cover} alt="" loading="lazy" />
        ) : (
          <div className="product-card-cover-fallback" aria-hidden="true">
            {item.title.charAt(0)}
          </div>
        )}
        <span className="product-card-type">{TYPE_LABEL[item.type]}</span>
        {item.rating != null && (
          <span className="product-card-rating">★ {item.rating.toFixed(1)}</span>
        )}
      </div>
      <div className="product-card-body">
        <h3 className="product-card-title">{item.title}</h3>
        <p className="product-card-year">{item.year ?? '—'}</p>
      </div>
    </Link>
  )
}
