import { useEffect, useState, useCallback } from 'react'
import { fetchTrending, searchAll } from '../../../services/api/catalog'
import { useDebounce } from '../../../hooks/useDebounce'

/**
 * Owns all catalog browsing state: search query, active type filters,
 * merged items, and infinite scrolling pagination.
 */
export function useCatalog() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 400)
  const [activeTypes, setActiveTypes] = useState([])

  const [trendingItems, setTrendingItems] = useState([])
  const [searchItems, setSearchItems] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [errors, setErrors] = useState([])

  // Infinite scroll pagination state
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  function dedupe(existing, newItems) {
    const ids = new Set(existing.map((item) => item.id))
    const uniqueNew = newItems.filter((item) => !ids.has(item.id))
    return [...existing, ...uniqueNew]
  }

  // Load the default browse shelf (Page 1) once
  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setPage(1)
    setHasMore(true)
    fetchTrending(1)
      .then(({ items, errors }) => {
        if (cancelled) return
        setTrendingItems(items)
        setErrors(errors)
        setStatus('ready')
        if (items.length === 0) setHasMore(false)
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => { cancelled = true }
  }, [])

  // Re-search whenever debounced query or active filters change
  useEffect(() => {
    let cancelled = false

    if (!debouncedQuery.trim()) {
      setSearchItems(null)
      setPage(1)
      setHasMore(true)
      return
    }

    setStatus('loading')
    setPage(1)
    setHasMore(true)
    searchAll(debouncedQuery, { types: activeTypes, page: 1 })
      .then(({ items, errors }) => {
        if (cancelled) return
        setSearchItems(items)
        setErrors(errors)
        setStatus('ready')
        if (items.length === 0) setHasMore(false)
      })
      .catch(() => !cancelled && setStatus('error'))

    return () => { cancelled = true }
  }, [debouncedQuery, activeTypes])

  // Loads the next page of results as the user scrolls
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || status === 'loading') return

    setLoadingMore(true)
    const nextPage = page + 1

    try {
      if (searchItems !== null) {
        const { items: newItems } = await searchAll(debouncedQuery, { types: activeTypes, page: nextPage })
        if (newItems.length === 0) {
          setHasMore(false)
        } else {
          setSearchItems((prev) => dedupe(prev || [], newItems))
          setPage(nextPage)
        }
      } else {
        const { items: newItems } = await fetchTrending(nextPage)
        if (newItems.length === 0) {
          setHasMore(false)
        } else {
          setTrendingItems((prev) => dedupe(prev, newItems))
          setPage(nextPage)
        }
      }
    } catch {
      // Quietly ignore network blips during background page fetches
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, status, searchItems, debouncedQuery, activeTypes, page])

  const isSearching = searchItems !== null
  const baseItems = isSearching ? searchItems : trendingItems
  const items = activeTypes.length
    ? baseItems.filter((item) => activeTypes.includes(item.type))
    : baseItems

  return {
    query,
    setQuery,
    activeTypes,
    setActiveTypes,
    items,
    trendingItems,
    status,
    errors,
    isSearching,
    loadMore,
    loadingMore,
    hasMore,
  }
}