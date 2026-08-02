import { fetchJson } from './httpClient'
import { normalizeComic } from './normalize'

const BASE_URL = 'https://openlibrary.org'
const COMIC_SUBJECTS = ['comics', 'graphic_novels']

async function fetchSubjectWorks(subject, limit) {
  const data = await fetchJson(`${BASE_URL}/subjects/${subject}.json?limit=${limit}`)
  return data.works || []
}

// A title can appear under both the "comics" and "graphic_novels" subjects,
// so merge the two lists and de-duplicate by work key before capping.
function mergeUnique(workLists, limit) {
  const seen = new Set()
  const merged = []
  for (const works of workLists) {
    for (const work of works) {
      const key = work.key || `/works/${work.work_id ?? work.id ?? ''}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(work)
      if (merged.length >= limit) return merged
    }
  }
  return merged
}

/**
 * Open Library has no "popular" endpoint, so the catalog's default comic
 * shelf pulls from the comics subjects — the same workaround openLibrary.js
 * uses for books, across two subjects to widen the pool.
 */
export async function fetchPopularComics(limit = 20) {
  const works = await Promise.all(COMIC_SUBJECTS.map((s) => fetchSubjectWorks(s, limit)))
  return mergeUnique(works, limit).map(normalizeComic)
}

/** Free-text comic search, scoped to the comics and graphic_novels subjects. */
export async function searchComics(query, limit = 20) {
  if (!query?.trim()) return []
  const q = encodeURIComponent(query.trim())
  const results = await Promise.all(
    COMIC_SUBJECTS.map((s) =>
      fetchJson(`${BASE_URL}/search.json?q=${q}&subject=${s}&limit=${limit}`)
    )
  )
  return mergeUnique(results.map((r) => r.docs || []), limit).map(normalizeComic)
}

/**
 * Full detail for a single comic. `workKey` is the normalized item's
 * `sourceId`, e.g. "/works/OL45804W".
 */
export async function getComicDetails(workKey) {
  const data = await fetchJson(`${BASE_URL}${workKey}.json`)
  const base = normalizeComic({
    key: workKey,
    title: data.title,
    cover_id: data.covers?.[0],
  })

  const description = typeof data.description === 'string'
    ? data.description
    : data.description?.value || ''

  return { ...base, synopsis: description }
}
