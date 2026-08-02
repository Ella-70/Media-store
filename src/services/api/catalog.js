// This is the only module the catalog UI should import from. It fans out
// to all three sources in parallel and merges the results — components
// never call tmdb.js / openLibrary.js / manga.js directly, so the UI
// never has to know or care which API a given item came from.
import { fetchPopularMovies, searchMovies, getMovieDetails } from './tmdb'
import { fetchPopularBooks, searchBooks, getBookDetails } from './openLibrary'
import { fetchPopularManga, searchManga, getMangaDetails } from './manga'
import { fetchPopularComics, searchComics, getComicDetails } from './openLibraryComics'

/**
 * Runs one fetcher per media type and merges whatever succeeds. A single
 * source failing (rate limit, network blip, bad key) never blanks the
 * whole page — it just quietly contributes zero results, and the failure
 * reasons are returned separately so the UI can surface them if it wants.
 */
async function mergeSettled(promises, labels) {
  const results = await Promise.allSettled(promises)

  const items = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  const errors = results
    .map((r, i) => (r.status === 'rejected' ? { source: labels[i], message: r.reason.message } : null))
    .filter(Boolean)

  return { items, errors }
}

/** Default browse view: a mix of popular movies, books, manga, and comics. */
export async function fetchTrending(page = 1) {
  return mergeSettled(
    [
      fetchPopularMovies(page),
      fetchPopularBooks(20, page),
      fetchPopularManga(20, page),
      fetchPopularComics(20, page),
    ],
    ['tmdb', 'openlibrary', 'anilist', 'openlibrary-comics'],
  )
}

/**
 * Search across all sources at once.
 * @param {string} query
 * @param {{ types?: Array<'movie'|'book'|'manga'|'comic'>, page?: number }} [options]
 */
export async function searchAll(query, { types, page = 1 } = {}) {
  const wants = (type) => !types || types.includes(type)

  const jobs = []
  const labels = []
  if (wants('movie')) { jobs.push(searchMovies(query, page)); labels.push('tmdb') }
  if (wants('book')) { jobs.push(searchBooks(query, 20, page)); labels.push('openlibrary') }
  if (wants('manga')) { jobs.push(searchManga(query, 20, page)); labels.push('anilist') }
  if (wants('comic')) { jobs.push(searchComics(query, 20, page)); labels.push('openlibrary-comics') }

  return mergeSettled(jobs, labels)
}

const DETAIL_FETCHERS = {
  movie: getMovieDetails,
  book: getBookDetails,
  manga: getMangaDetails,
  comic: getComicDetails,
}

/** Fetches full detail for one item, dispatching to the right source by type. */
export async function getProductDetails(type, sourceId) {
  const fetcher = DETAIL_FETCHERS[type]
  if (!fetcher) throw new Error(`Unknown media type: ${type}`)
  return fetcher(sourceId)
}
