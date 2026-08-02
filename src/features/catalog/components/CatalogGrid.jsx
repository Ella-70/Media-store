import { ProductCard } from './ProductCard'
import './CatalogGrid.css'

export function CatalogGrid({ items, status }) {
  if (status === 'loading' && items.length === 0) {
    return <p className="catalog-state">Loading the shelves…</p>
  }

  if (status === 'error') {
    return <p className="catalog-state catalog-state-error">Couldn't reach the catalog. Try again in a moment.</p>
  }

  if (items.length === 0) {
    return <p className="catalog-state">No matches. Try a different search or filter.</p>
  }

  return (
    <div className="catalog-grid">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  )
}
