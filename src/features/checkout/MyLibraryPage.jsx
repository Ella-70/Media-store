import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getUserLibrary } from '../../services/api/orders'
import { getMovieVideos } from '../../services/api/tmdb'
import { ProductCard } from '../catalog/components/ProductCard'
import { TrailerEmbed } from '../../components/TrailerEmbed'
import './MyLibraryPage.css'

export function MyLibraryPage() {
  const { session } = useAuth()
  const userId = session?.user?.id

  const [owned, setOwned] = useState([])
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)

  // Active trailer state for inline playback
  const [activeTrailerId, setActiveTrailerId] = useState(null)
  const [trailerData, setTrailerData] = useState({})
  const [trailerLoadingId, setTrailerLoadingId] = useState(null)

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    setLoading(true)

    getUserLibrary(userId)
      .then((lib) => {
        if (cancelled) return
        setOwned(lib.owned || [])
        setRentals(lib.rentals || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('MyLibraryPage error:', err)
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  async function handleToggleTrailer(item) {
    const productId = item.product_id
    if (activeTrailerId === productId) {
      setActiveTrailerId(null)
      return
    }

    setActiveTrailerId(productId)
    if (trailerData[productId]) return

    const snapshot = item.product_snapshot || {}
    const sourceId = snapshot.sourceId || productId.replace('movie-', '')

    setTrailerLoadingId(productId)
    const video = await getMovieVideos(sourceId)
    setTrailerLoadingId(null)

    setTrailerData((prev) => ({
      ...prev,
      [productId]: video || { noVideo: true },
    }))
  }

  function formatRentalTimeLeft(expiresAt) {
    if (!expiresAt) return { expired: true, text: 'Expired' }
    const now = new Date()
    const exp = new Date(expiresAt)
    const diffMs = exp - now

    if (diffMs <= 0) {
      return { expired: true, text: 'Expired' }
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return {
      expired: false,
      text: `${hours}h ${minutes}m left`,
    }
  }

  return (
    <div className="container library-page">
      <div className="library-header">
        <span className="eyebrow">Personal Shelf</span>
        <h1>My Library</h1>
      </div>

      {loading ? (
        <p className="library-state">Loading your library…</p>
      ) : owned.length === 0 && rentals.length === 0 ? (
        <div className="library-empty card">
          <p>You haven't bought or rented any titles yet.</p>
          <Link to="/" className="btn btn-primary">
            Explore the Catalog →
          </Link>
        </div>
      ) : (
        <div className="library-sections">
          {/* Owned Section */}
          <section className="library-section">
            <div className="library-section-header">
              <h2>Owned ({owned.length})</h2>
            </div>

            {owned.length === 0 ? (
              <p className="text-muted">No purchased titles yet.</p>
            ) : (
              <div className="library-grid">
                {owned.map((item) => {
                  const normalizedItem = item.product_snapshot || {
                    id: item.product_id,
                    type: item.product_type,
                    title: item.title,
                    cover: item.cover,
                    year: item.year,
                    rating: item.rating,
                    sourceId: item.product_id,
                  }
                  const isMovie = (item.product_type || normalizedItem.type) === 'movie'
                  const productId = item.product_id
                  const isTrailerOpen = activeTrailerId === productId
                  const videoState = trailerData[productId]

                  return (
                    <div key={item.id} className="library-card-wrapper">
                      <ProductCard item={normalizedItem} />
                      {isMovie && (
                        <div className="library-card-actions">
                          <button
                            className="btn btn-ghost library-action-btn"
                            onClick={() => handleToggleTrailer(item)}
                          >
                            {isTrailerOpen ? '✕ Close Trailer' : '▶ Watch Trailer'}
                          </button>
                        </div>
                      )}

                      {isMovie && isTrailerOpen && (
                        <div className="library-trailer-popover">
                          <TrailerEmbed
                            title={normalizedItem.title}
                            hasAccess={true}
                            loading={trailerLoadingId === productId}
                            videoKey={videoState?.key}
                            videoName={videoState?.name}
                            noVideoFound={videoState?.noVideo}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Rentals Section */}
          <section className="library-section">
            <div className="library-section-header">
              <h2>Rentals ({rentals.length})</h2>
            </div>

            {rentals.length === 0 ? (
              <p className="text-muted">No rented titles yet.</p>
            ) : (
              <div className="library-grid">
                {rentals.map((item) => {
                  const normalizedItem = item.product_snapshot || {
                    id: item.product_id,
                    type: item.product_type,
                    title: item.title,
                    cover: item.cover,
                    year: item.year,
                    rating: item.rating,
                    sourceId: item.product_id,
                  }
                  const isMovie = (item.product_type || normalizedItem.type) === 'movie'
                  const rentalInfo = formatRentalTimeLeft(item.rental_expires_at)
                  const productId = item.product_id
                  const isTrailerOpen = activeTrailerId === productId
                  const videoState = trailerData[productId]

                  return (
                    <div
                      key={item.id}
                      className={`library-card-wrapper ${rentalInfo.expired ? 'rental-expired' : ''}`}
                    >
                      <div className="rental-status-bar">
                        <span className={`rental-badge ${rentalInfo.expired ? 'expired' : 'active'}`}>
                          {rentalInfo.text}
                        </span>
                      </div>
                      <ProductCard item={normalizedItem} />

                      {isMovie && !rentalInfo.expired && (
                        <div className="library-card-actions">
                          <button
                            className="btn btn-ghost library-action-btn"
                            onClick={() => handleToggleTrailer(item)}
                          >
                            {isTrailerOpen ? '✕ Close Trailer' : '▶ Watch Trailer'}
                          </button>
                        </div>
                      )}

                      {isMovie && !rentalInfo.expired && isTrailerOpen && (
                        <div className="library-trailer-popover">
                          <TrailerEmbed
                            title={normalizedItem.title}
                            hasAccess={true}
                            loading={trailerLoadingId === productId}
                            videoKey={videoState?.key}
                            videoName={videoState?.name}
                            noVideoFound={videoState?.noVideo}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
