// CRUD operations against our own Supabase `products` table (custom
// staff-added items) — separate from tmdb/openLibrary/manga, which only
// ever fetch from external catalogs and can't be edited.
import { supabase } from '../supabaseClient'

export async function fetchAllProducts() {
const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

if (error) throw new Error(error.message)
return data
}

export async function createProduct(product) {
const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()

if (error) throw new Error(error.message)
return data
}

export async function updateProduct(id, updates) {
const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

if (error) throw new Error(error.message)
return data
}

export async function deleteProduct(id) {
const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

if (error) throw new Error(error.message)
}