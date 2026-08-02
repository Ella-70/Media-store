// Supabase-backed order operations.
import { supabase } from '../supabaseClient'

const accessCache = new Map()

export function clearAccessCache() {
  accessCache.clear()
}

/**
 * Checks whether a user owns or has an active rental for a specific product.
 * Returns true if purchase_type === 'buy' OR (purchase_type === 'rental' && rental_expires_at > now).
 * Single query per product with in-memory caching.
 * @param {string} userId
 * @param {string} productId
 * @returns {Promise<boolean>}
 */
export async function hasAccess(userId, productId) {
  if (!userId || !productId) return false

  const cacheKey = `${userId}:${productId}`
  if (accessCache.has(cacheKey)) {
    return accessCache.get(cacheKey)
  }

  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('id, purchase_type, rental_expires_at, orders!inner(user_id, status)')
      .eq('product_id', productId)
      .eq('orders.user_id', userId)
      .eq('orders.status', 'paid')

    if (error || !data || data.length === 0) {
      accessCache.set(cacheKey, false)
      return false
    }

    const now = new Date()
    const allowed = data.some((item) => {
      if (item.purchase_type === 'buy') return true
      if (item.purchase_type === 'rental' && item.rental_expires_at) {
        return new Date(item.rental_expires_at) > now
      }
      return false
    })

    accessCache.set(cacheKey, allowed)
    return allowed
  } catch (err) {
    console.error('hasAccess error:', err)
    return false
  }
}

export async function getOrderById(userId, orderId) {
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()

  if (orderErr) throw new Error(orderErr.message)

  const { data: items, error: itemsErr } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (itemsErr) throw new Error(itemsErr.message)

  return {
    ...order,
    items: items || [],
  }
}

export async function getUserLibrary(userId) {
  if (!userId) return { owned: [], rentals: [] }

  const { data, error } = await supabase
    .from('order_items')
    .select('*, orders!inner(user_id, status, created_at)')
    .eq('orders.user_id', userId)
    .eq('orders.status', 'paid')
    .order('created_at', { foreignTable: 'orders', ascending: false })

  if (error) throw new Error(error.message)

  const items = data || []

  // Owned: purchase_type === 'buy', deduplicated by product_id
  const ownedMap = new Map()
  items.forEach((item) => {
    if (item.purchase_type === 'buy' && !ownedMap.has(item.product_id)) {
      ownedMap.set(item.product_id, item)
    }
  })

  // Rentals: purchase_type === 'rental'
  const rentals = items.filter((item) => item.purchase_type === 'rental')

  return {
    owned: Array.from(ownedMap.values()),
    rentals,
  }
}

export async function createOrder(userId, { status = 'paid', total, items }) {
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert([{ user_id: userId, status, total }])
    .select()
    .single()

  if (orderErr) throw new Error(orderErr.message)

  const orderItemsRows = items.map((item) => {
    const snapshot = item.product_snapshot || item
    const purchaseType = item.purchase_type || 'buy'
    const unitPrice = item.unit_price || 0
    const quantity = item.quantity || 1
    const lineTotal = Math.round(unitPrice * quantity * 100) / 100

    let rentalExpiresAt = null
    if (purchaseType === 'rental') {
      const expires = new Date()
      expires.setHours(expires.getHours() + 48)
      rentalExpiresAt = expires.toISOString()
    }

    return {
      order_id: order.id,
      product_id: item.product_id || item.id,
      product_snapshot: snapshot,
      quantity,
      purchase_type: purchaseType,
      unit_price: unitPrice,
      line_total: lineTotal,
      rental_expires_at: rentalExpiresAt,
    }
  })

  const { data: createdItems, error: itemsErr } = await supabase
    .from('order_items')
    .insert(orderItemsRows)
    .select()

  if (itemsErr) throw new Error(itemsErr.message)

  // Clear access cache so new purchase access registers immediately
  clearAccessCache()

  return {
    ...order,
    items: createdItems,
  }
}
