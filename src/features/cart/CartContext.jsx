import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '../auth/useAuth'
import * as cartApi from '../../services/api/cart'
import * as wishlistApi from '../../services/api/wishlist'

const CartContext = createContext(undefined)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}

export function CartProvider({ children }) {
  const { session } = useAuth()
  const userId = session?.user?.id

  const [cartItems, setCartItems] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  // ---- Fetch on auth change ----

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setCartItems([])
      setWishlistItems([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const [cart, wish] = await Promise.all([
        cartApi.getCartItems(userId),
        wishlistApi.getWishlistItems(userId),
      ])
      setCartItems(cart)
      setWishlistItems(wish)
    } catch (err) {
      console.error('CartProvider: failed to load cart/wishlist', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ---- Cart operations (optimistic) ----

  async function addToCart(item, quantity = 1, purchaseType = 'buy', unitPrice = 0) {
    if (!userId) return

    // Optimistic — add immediately
    const optimistic = {
      id: `temp-${item.id}`,
      user_id: userId,
      product_id: item.id,
      product_type: item.type,
      product_snapshot: item,
      quantity,
      purchase_type: purchaseType,
      unit_price: unitPrice,
      added_at: new Date().toISOString(),
    }

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((c) => c.product_id === item.id)
      if (existingIdx !== -1) {
        const next = [...prev]
        next[existingIdx] = {
          ...next[existingIdx],
          quantity,
          purchase_type: purchaseType,
          unit_price: unitPrice,
        }
        return next
      }
      return [optimistic, ...prev]
    })

    try {
      const saved = await cartApi.addToCart(userId, item, quantity, purchaseType, unitPrice)
      // Replace optimistic row with the real one
      setCartItems((prev) =>
        prev.map((c) => (c.product_id === saved.product_id ? saved : c))
      )
    } catch (err) {
      // Rollback
      setCartItems((prev) => prev.filter((c) => c.id !== optimistic.id))
      console.error('addToCart failed:', err)
    }
  }

  async function updateCartQuantity(productId, quantity) {
    if (!userId) return

    // Optimistic
    const prevItems = cartItems
    setCartItems((prev) =>
      prev.map((c) => (c.product_id === productId ? { ...c, quantity } : c))
    )

    try {
      await cartApi.updateCartQuantity(userId, productId, quantity)
    } catch (err) {
      // Rollback
      setCartItems(prevItems)
      console.error('updateCartQuantity failed:', err)
    }
  }

  async function removeFromCart(productId) {
    if (!userId) return

    // Optimistic
    const prevItems = cartItems
    setCartItems((prev) => prev.filter((c) => c.product_id !== productId))

    try {
      await cartApi.removeFromCart(userId, productId)
    } catch (err) {
      setCartItems(prevItems)
      console.error('removeFromCart failed:', err)
    }
  }

  async function clearCart() {
    if (!userId) return
    const prevItems = cartItems
    setCartItems([])
    try {
      await cartApi.clearCart(userId)
    } catch (err) {
      setCartItems(prevItems)
      console.error('clearCart failed:', err)
    }
  }

  function isInCart(productId) {
    return cartItems.some((c) => c.product_id === productId)
  }

  // ---- Wishlist operations (optimistic) ----

  async function addToWishlist(item) {
    if (!userId) return

    const optimistic = {
      id: `temp-${item.id}`,
      user_id: userId,
      product_id: item.id,
      product_type: item.type,
      product_snapshot: item,
      added_at: new Date().toISOString(),
    }

    setWishlistItems((prev) => {
      if (prev.some((w) => w.product_id === item.id)) return prev
      return [optimistic, ...prev]
    })

    try {
      const saved = await wishlistApi.addToWishlist(userId, item)
      setWishlistItems((prev) =>
        prev.map((w) => w.product_id === saved.product_id ? saved : w)
      )
    } catch (err) {
      setWishlistItems((prev) => prev.filter((w) => w.id !== optimistic.id))
      console.error('addToWishlist failed:', err)
    }
  }

  async function removeFromWishlist(productId) {
    if (!userId) return

    const prevItems = wishlistItems
    setWishlistItems((prev) => prev.filter((w) => w.product_id !== productId))

    try {
      await wishlistApi.removeFromWishlist(userId, productId)
    } catch (err) {
      setWishlistItems(prevItems)
      console.error('removeFromWishlist failed:', err)
    }
  }

  function isInWishlist(productId) {
    return wishlistItems.some((w) => w.product_id === productId)
  }

  // cartCount = sum of all item quantities
  const cartCount = cartItems.reduce((sum, c) => sum + (c.quantity || 1), 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        loading,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isInCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        cartCount,
        wishlistCount: wishlistItems.length,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
