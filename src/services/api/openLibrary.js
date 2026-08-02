import { fetchJson } from './httpClient'
import { normalizeBook } from './normalize'

const BASE_URL = 'https://openlibrary.org'

/**
 * Open Library has no "popular" endpoint, so the catalog's default book
 * shelf pulls from a well-populated subject instead. Fiction is broad
 * enough to give a decent default browse view.
 */
export async function fetchPopularBooks(limit = 20, page = 1) {
  const offset = (page - 1) * limit
  const data = await fetchJson(`${BASE_URL}/subjects/fiction.json?limit=${limit}&offset=${offset}`)
  return (data.works || []).map(normalizeBook)
}

/** Free-text book search. */
export async function searchBooks(query, limit = 20, page = 1) {
  if (!query?.trim()) return []
  const url = `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`
  const data = await fetchJson(url)
  return (data.docs || []).map(normalizeBook)
}

/**
 * Full detail for a single book. `workKey` is the normalized item's
 * `sourceId`, e.g. "/works/OL45804W".
 */
export async function getBookDetails(workKey) {
  const data = await fetchJson(`${BASE_URL}${workKey}.json`)
  const base = normalizeBook({
    key: workKey,
    title: data.title,
    cover_id: data.covers?.[0],
  })

  const description = typeof data.description === 'string'
    ? data.description
    : data.description?.value || ''

  return { ...base, synopsis: description }
}
