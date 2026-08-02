import { Link } from 'react-router-dom'
import { useCart } from './CartContext'
import { ProductCard } from '../catalog/components/ProductCard'
import './WishlistPage.css'

export function WishlistPage() {
  const { wishlistItems, removeFromWishlist, addToCart, isInCart } = useCart()

  return (
    <div className="container wishlist-page">
      <div className="wishlist-header">
        <span className="eyebrow">Saved Items</span>
        <h1>Your Wishlist</h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="wishlist-empty card">
          <p>Your wishlist is empty.</p>
          <Link to="/" className="btn btn-primary">Discover something new →</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map((item) => {
            const normalizedItem = item.product_snapshot || {
              id: item.product_id,
              type: item.product_type,
              title: item.title,
              cover: item.cover,
              year: item.year,
              rating: item.rating,
              sourceId: item.source_id || item.product_id,
            }

            const productId = item.product_id || normalizedItem.id
            const inCart = isInCart(productId)

            function handleMoveToCart(e) {
              e.preventDefault()
              e.stopPropagation()
              addToCart(normalizedItem)
              removeFromWishlist(productId)
            }

            function handleRemove(e) {
              e.preventDefault()
              e.stopPropagation()
              removeFromWishlist(productId)
            }

            return (
              <div key={productId} className="wishlist-card-wrapper">
                <ProductCard item={normalizedItem} />
                <div className="wishlist-card-actions">
                  <button
                    className="btn btn-primary wishlist-action-btn"
                    disabled={inCart}
                    onClick={handleMoveToCart}
                  >
                    {inCart ? '✓ In Cart' : 'Move to Cart'}
                  </button>
                  <button
                    className="btn btn-ghost wishlist-action-btn"
                    onClick={handleRemove}
                    title="Remove from wishlist"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
