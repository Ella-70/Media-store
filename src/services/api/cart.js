// Supabase-backed cart operations. Separated from CartContext so the
// context only holds state + optimistic logic, while this file owns
// the actual DB calls. Follows the same throw-on-error pattern as
// the other service files in this folder.
import { supabase } from '../supabaseClient'

export async function getCartItems(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

/**
 * Add an item to the cart. Uses upsert so that adding a duplicate
 * bumps quantity/updates purchase_type instead of throwing a constraint violation.
 * @param {string} userId
 * @param {object} item — normalized product shape from catalog
 * @param {number} [quantity=1]
 * @param {string} [purchaseType='buy'] — 'buy' | 'rental'
 * @param {number} [unitPrice=0] — locked-in price at add time
 */
export async function addToCart(userId, item, quantity = 1, purchaseType = 'buy', unitPrice = 0) {
  const row = {
    user_id: userId,
    product_id: item.id,
    product_type: item.type,
    product_snapshot: item,
    quantity,
    purchase_type: purchaseType,
    unit_price: unitPrice,
  }

  const { data, error } = await supabase
    .from('cart_items')
    .upsert(row, { onConflict: 'user_id,product_id' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateCartQuantity(userId, productId, quantity) {
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('product_id', productId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function removeFromCart(userId, productId) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) throw new Error(error.message)
}

export async function clearCart(userId) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}
