import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useCatalog } from './hooks/useCatalog'
import { FeaturedBanner } from './components/FeaturedBanner'
import { SearchBar } from './components/SearchBar'
import { TypeFilter } from './components/TypeFilter'
import { CatalogGrid } from './components/CatalogGrid'
import './CatalogPage.css'

export function CatalogPage() {
  const location = useLocation()
  const [flash, setFlash] = useState(location.state?.flashMessage || '')

  // Clear the flash from history state so a back-nav doesn't re-show it
  useEffect(() => {
    if (flash) {
      window.history.replaceState({}, '')
      const timer = setTimeout(() => setFlash(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [flash])

  const {
    query,
    setQuery,
    activeTypes,
    setActiveTypes,
    items,
    trendingItems,
    status,
    isSearching,
    loadMore,
    loadingMore,
    hasMore,
  } = useCatalog()

  const sentinelRef = useRef(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && status === 'ready') {
          loadMore()
        }
      },
      { rootMargin: '400px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore, hasMore, loadingMore, status])

  // Prefer a movie with a backdrop for the hero — it's the richest image
  // available — but fall back to whatever the first trending item is.
  const featured = !isSearching
    ? trendingItems.find((item) => item.backdrop) || trendingItems[0]
    : null

  return (
    <div className="container catalog-page">
      {flash && (
        <div className="catalog-flash" role="alert">
          <p>{flash}</p>
          <button className="catalog-flash-dismiss" onClick={() => setFlash('')} aria-label="Dismiss">×</button>
        </div>
      )}
      <header className="catalog-header">
        <span className="eyebrow">The Stacks</span>
        <h1>Movies, manga, books &amp; comics, one shelf.</h1>
        <p className="text-muted">
          {isSearching ? `Results for "${query}"` : 'Trending right now, pulled fresh from TMDb, Open Library, MyAnimeList, and Comic Vine.'}
        </p>
      </header>

      {featured && <FeaturedBanner item={featured} />}

      <div className="catalog-controls">
        <SearchBar value={query} onChange={setQuery} />
        <TypeFilter active={activeTypes} onChange={setActiveTypes} />
      </div>

      <CatalogGrid items={items} status={status} />

      {/* Infinite Scroll Sentinel & Loader */}
      <div ref={sentinelRef} className="infinite-scroll-trigger">
        {loadingMore && (
          <p className="infinite-scroll-loading">Loading more titles…</p>
        )}
      </div>
    </div>
  )
}
