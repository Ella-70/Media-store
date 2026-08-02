// Every source (TMDb, Open Library, AniList) returns a differently-shaped
// object. Nothing outside this file — no component, no page — should ever
// touch a raw API response. Everything downstream works with this one
// shape instead:
//
//   {
//     id:        string   — globally unique across all sources, e.g. "movie-603"
//     type:      'movie' | 'book' | 'manga' | 'comic'
//     title:     string
//     cover:     string | null   — absolute image URL
//     year:      number | null
//     rating:    number | null   — always on a 0–10 scale, or null if unknown
//     synopsis:  string          — may be empty, never null (safe to render directly)
//     source:    'tmdb' | 'openlibrary' | 'anilist'
//     sourceId:  string | number — the id in the original API, for detail lookups
//   }

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280'
const OPEN_LIBRARY_COVER_BASE = 'https://covers.openlibrary.org/b/id'

export function normalizeMovie(movie) {
  return {
    id: `movie-${movie.id}`,
    type: 'movie',
    title: movie.title || movie.original_title || 'Untitled',
    cover: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
    backdrop: movie.backdrop_path ? `${TMDB_BACKDROP_BASE}${movie.backdrop_path}` : null,
    year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
    rating: typeof movie.vote_average === 'number' ? Math.round(movie.vote_average * 10) / 10 : null,
    synopsis: movie.overview || '',
    source: 'tmdb',
    sourceId: movie.id,
  }
}

export function normalizeBook(book) {
  // Open Library's search.json docs and its /subjects/*.json works arrays
  // use slightly different field names for the same data, so this accepts
  // either shape.
  const coverId = book.cover_i ?? book.cover_id ?? null
  const workKey = book.key || `/works/${book.work_id ?? book.id ?? ''}`
  const year = book.first_publish_year ?? null

  return {
    id: `book-${workKey}`,
    type: 'book',
    title: book.title || 'Untitled',
    cover: coverId ? `${OPEN_LIBRARY_COVER_BASE}/${coverId}-M.jpg` : null,
    year: year ? Number(year) : null,
    rating: typeof book.ratings_average === 'number' ? Math.round(book.ratings_average * 10) / 10 : null,
    synopsis: '', // search results don't include a description; fetched on the detail page
    source: 'openlibrary',
    sourceId: workKey,
  }
}

export function normalizeManga(media) {
  return {
    id: `manga-${media.id}`,
    type: 'manga',
    title: media.title?.english || media.title?.romaji || 'Untitled',
    cover: media.coverImage?.large || null,
    year: media.startDate?.year || null,
    rating: typeof media.averageScore === 'number' ? Math.round(media.averageScore) / 10 : null,
    synopsis: stripHtml(media.description || ''),
    source: 'anilist',
    sourceId: media.id,
  }
}

export function normalizeComic(work) {
  return {
    ...normalizeBook(work),
    id: `comic-${work.key || `/works/${work.work_id ?? work.id ?? ''}`}`,
    type: 'comic',
  }
}

function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
