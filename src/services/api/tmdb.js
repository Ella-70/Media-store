import { fetchJson } from './httpClient'
import { normalizeMovie } from './normalize'

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('language', 'en-US')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

/** Popular movies right now — used for the catalog's default/browse view. */
export async function fetchPopularMovies(page = 1) {
  const data = await fetchJson(buildUrl('/movie/popular', { page }))
  return data.results.map(normalizeMovie)
}

/** Free-text movie search. */
export async function searchMovies(query, page = 1) {
  if (!query?.trim()) return []
  const data = await fetchJson(buildUrl('/search/movie', { query, page }))
  return data.results.map(normalizeMovie)
}

/** Full detail for a single movie, by its TMDb id (the `sourceId` on a normalized item). */
export async function getMovieDetails(tmdbId) {
  const data = await fetchJson(buildUrl(`/movie/${tmdbId}`))
  return normalizeMovie(data)
}

/**
 * Fetches YouTube trailers for a movie by TMDb id.
 * Filters to YouTube trailers, preferring official === true.
 * @param {string|number} tmdbId
 * @returns {Promise<{ key: string, name: string } | null>}
 */
export async function getMovieVideos(tmdbId) {
  try {
    const data = await fetchJson(buildUrl(`/movie/${tmdbId}/videos`))
    const results = data.results || []

    const trailers = results.filter(
      (v) => v.site === 'YouTube' && v.type === 'Trailer'
    )

    if (trailers.length === 0) return null

    const official = trailers.find((v) => v.official === true)
    const choice = official || trailers[0]

    return {
      key: choice.key,
      name: choice.name || 'Official Trailer',
    }
  } catch (err) {
    console.error(`Failed to fetch videos for movie ${tmdbId}:`, err.message)
    return null
  }
}