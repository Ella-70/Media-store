import { fetchJson } from './httpClient'
import { normalizeManga } from './normalize'

// AniList GraphQL API — free, no API key required.
const BASE_URL = 'https://graphql.anilist.co'

const MEDIA_FIELDS = `
  id
  title { romaji english }
  coverImage { large }
  startDate { year }
  averageScore
  description
`

async function postQuery(query, variables) {
  const data = await fetchJson(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  return data
}

export async function fetchPopularManga(limit = 20, page = 1) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: TRENDING_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `
  const data = await postQuery(query, { page, perPage: limit })
  return (data.data?.Page?.media || []).map(normalizeManga)
}

/** Free-text manga search. */
export async function searchManga(query, limit = 20, page = 1) {
  if (!query?.trim()) return []
  const q = query.trim()
  const graphQuery = `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: SEARCH_MATCH, search: $search) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `
  const data = await postQuery(graphQuery, { search: q, page, perPage: limit })
  return (data.data?.Page?.media || []).map(normalizeManga)
}

/** Full detail for a single manga, by its AniList id (the `sourceId` on a normalized item). */
export async function getMangaDetails(anilistId) {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: MANGA) {
        ${MEDIA_FIELDS}
      }
    }
  `
  const data = await postQuery(query, { id: Number(anilistId) })
  const media = data.data?.Media
  return media ? normalizeManga(media) : null
}
