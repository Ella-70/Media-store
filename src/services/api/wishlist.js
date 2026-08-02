// Supabase-backed wishlist operations.  Same pattern as cart.js — thin
// wrappers around Supabase queries, throwing on error.
import { supabase } from '../supabaseClient'

export async function getWishlistItems(userId) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function addToWishlist(userId, item) {
  const row = {
    user_id: userId,
    product_id: item.id,
    product_type: item.type,
    product_snapshot: item,
  }

  const { data, error } = await supabase
    .from('wishlist_items')
    .upsert(row, { onConflict: 'user_id,product_id' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function removeFromWishlist(userId, productId) {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) throw new Error(error.message)
}
