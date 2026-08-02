// import { Link } from 'react-router-dom'
// import { useCart } from './CartContext'
// import './CartPage.css'

// const TYPE_LABEL = { movie: 'Film', book: 'Book', manga: 'Manga', comic: 'Comic' }
// const MOCK_PRICE = { movie: 14.99, book: 9.99, manga: 7.99, comic: 4.99 }

// export function CartPage() {
//   const { cartItems, updateCartQuantity, removeFromCart } = useCart()

//   const itemsWithPricing = cartItems.map((item) => {
//     const snapshot = item.product_snapshot || {}
//     const type = item.product_type || snapshot.type || 'movie'
//     const title = item.title || snapshot.title || 'Untitled'
//     const cover = item.cover || snapshot.cover || null
//     const year = item.year ?? snapshot.year ?? null
//     const unitPrice = snapshot.price ?? MOCK_PRICE[type] ?? 9.99
//     const quantity = item.quantity || 1
//     const lineTotal = Math.round(unitPrice * quantity * 100) / 100

//     return {
//       ...item,
//       type,
//       title,
//       cover,
//       year,
//       unitPrice,
//       quantity,
//       lineTotal,
//     }
//   })

//   const subtotal = itemsWithPricing.reduce((sum, item) => sum + item.lineTotal, 0)
//   const totalItemCount = itemsWithPricing.reduce((sum, item) => sum + item.quantity, 0)
//   const tax = Math.round(subtotal * 0.08 * 100) / 100
//   const total = Math.round((subtotal + tax) * 100) / 100

//   return (
//     <div className="container cart-page">
//       <div className="cart-header">
//         <span className="eyebrow">Checkout</span>
//         <h1>Your Cart</h1>
//       </div>

//       {itemsWithPricing.length === 0 ? (
//         <div className="cart-empty card">
//           <p>Your cart is empty.</p>
//           <Link to="/" className="btn btn-primary">Browse the shelf →</Link>
//         </div>
//       ) : (
//         <div className="cart-layout">
//           <div className="cart-list">
//             {itemsWithPricing.map((item) => (
//               <div key={item.id || item.product_id} className={`cart-item card cart-item-${item.type}`}>
//                 <div className="cart-item-cover">
//                   {item.cover ? (
//                     <img src={item.cover} alt={item.title} />
//                   ) : (
//                     <div className="cart-item-cover-fallback" aria-hidden="true">
//                       {item.title.charAt(0)}
//                     </div>
//                   )}
//                 </div>
//                 <div className="cart-item-info">
//                   <div className="cart-item-badge-wrap">
//                     <span className="cart-item-badge">{TYPE_LABEL[item.type] || item.type}</span>
//                     {item.year && <span className="cart-item-year">{item.year}</span>}
//                   </div>
//                   <Link to={`/product/${item.type}/${encodeURIComponent(item.source_id || item.product_id)}`} className="cart-item-title">
//                     {item.title}
//                   </Link>
//                   <p className="cart-item-unit-price">${item.unitPrice.toFixed(2)} each</p>
//                 </div>

//                 <div className="cart-item-actions">
//                   <div className="cart-qty-stepper">
//                     <button
//                       className="cart-qty-btn"
//                       onClick={() => {
//                         if (item.quantity > 1) {
//                           updateCartQuantity(item.product_id, item.quantity - 1)
//                         } else {
//                           removeFromCart(item.product_id)
//                         }
//                       }}
//                       aria-label="Decrease quantity"
//                     >
//                       −
//                     </button>
//                     <span className="cart-qty-val">{item.quantity}</span>
//                     <button
//                       className="cart-qty-btn"
//                       onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
//                       aria-label="Increase quantity"
//                     >
//                       +
//                     </button>
//                   </div>

//                   <span className="cart-item-line-total">${item.lineTotal.toFixed(2)}</span>

//                   <button
//                     className="btn btn-ghost cart-remove-btn"
//                     onClick={() => removeFromCart(item.product_id)}
//                     title="Remove from cart"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="cart-summary card">
//             <h2>Order Summary</h2>
//             <div className="cart-summary-row">
//               <span>Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
//               <span>${subtotal.toFixed(2)}</span>
//             </div>
//             <div className="cart-summary-row">
//               <span>Estimated Tax (8%)</span>
//               <span>${tax.toFixed(2)}</span>
//             </div>
//             <div className="cart-summary-row total">
//               <span>Total</span>
//               <span>${total.toFixed(2)}</span>
//             </div>
//             <button className="btn btn-primary cart-checkout-btn">Proceed to Checkout</button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './CartContext'
import { useAuth } from '../auth/useAuth'
import { createOrder } from '../../services/api/orders'
import './CartPage.css'

const TYPE_LABEL = { movie: 'Film', book: 'Book', manga: 'Manga', comic: 'Comic' }
const MOCK_PRICE = { movie: 14.99, book: 9.99, manga: 7.99, comic: 4.99 }

export function CartPage() {
  const { cartItems, updateCartQuantity, removeFromCart, clearCart } = useCart()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const itemsWithPricing = cartItems.map((item) => {
    const snapshot = item.product_snapshot || {}
    const type = item.product_type || snapshot.type || 'movie'
    const title = item.title || snapshot.title || 'Untitled'
    const cover = item.cover || snapshot.cover || null
    const year = item.year ?? snapshot.year ?? null
    const unitPrice = snapshot.price ?? MOCK_PRICE[type] ?? 9.99
    const quantity = item.quantity || 1
    const lineTotal = Math.round(unitPrice * quantity * 100) / 100

    return {
      ...item,
      type,
      title,
      cover,
      year,
      unitPrice,
      quantity,
      lineTotal,
    }
  })

  const subtotal = itemsWithPricing.reduce((sum, item) => sum + item.lineTotal, 0)
  const totalItemCount = itemsWithPricing.reduce((sum, item) => sum + item.quantity, 0)
  const tax = Math.round(subtotal * 0.08 * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100

  async function handleCheckout() {
    const userId = session?.user?.id
    if (!userId) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    if (itemsWithPricing.length === 0) return

    setCheckoutError('')
    setCheckingOut(true)

    try {
      // Lock in the price shown on screen right now — cart rows themselves
      // may have unit_price=0 if it was never set at add-to-cart time, so
      // we use the same computed unitPrice the receipt/summary already show.
      const orderItems = itemsWithPricing.map((item) => ({
        product_id: item.product_id,
        product_snapshot: item.product_snapshot || { ...item },
        purchase_type: item.purchase_type || 'buy',
        unit_price: item.unitPrice,
        quantity: item.quantity,
      }))

      const order = await createOrder(userId, { total, items: orderItems })
      await clearCart()
      navigate(`/order/${order.id}`)
    } catch (err) {
      console.error('Checkout failed:', err)
      setCheckoutError('Something went wrong placing your order. Please try again.')
      setCheckingOut(false)
    }
  }

  return (
    <div className="container cart-page">
      <div className="cart-header">
        <span className="eyebrow">Checkout</span>
        <h1>Your Cart</h1>
      </div>

      {itemsWithPricing.length === 0 ? (
        <div className="cart-empty card">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary">Browse the shelf →</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {itemsWithPricing.map((item) => (
              <div key={item.id || item.product_id} className={`cart-item card cart-item-${item.type}`}>
                <div className="cart-item-cover">
                  {item.cover ? (
                    <img src={item.cover} alt={item.title} />
                  ) : (
                    <div className="cart-item-cover-fallback" aria-hidden="true">
                      {item.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-badge-wrap">
                    <span className="cart-item-badge">{TYPE_LABEL[item.type] || item.type}</span>
                    {item.year && <span className="cart-item-year">{item.year}</span>}
                  </div>
                  <Link to={`/product/${item.type}/${encodeURIComponent(item.source_id || item.product_id)}`} className="cart-item-title">
                    {item.title}
                  </Link>
                  <p className="cart-item-unit-price">${item.unitPrice.toFixed(2)} each</p>
                </div>

                <div className="cart-item-actions">
                  <div className="cart-qty-stepper">
                    <button
                      className="cart-qty-btn"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateCartQuantity(item.product_id, item.quantity - 1)
                        } else {
                          removeFromCart(item.product_id)
                        }
                      }}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="cart-qty-val">{item.quantity}</span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <span className="cart-item-line-total">${item.lineTotal.toFixed(2)}</span>

                  <button
                    className="btn btn-ghost cart-remove-btn"
                    onClick={() => removeFromCart(item.product_id)}
                    title="Remove from cart"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary card">
            <h2>Order Summary</h2>
            <div className="cart-summary-row">
              <span>Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Estimated Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {checkoutError && <p className="cart-checkout-error">{checkoutError}</p>}
            <button
              className="btn btn-primary cart-checkout-btn"
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Placing order…' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
