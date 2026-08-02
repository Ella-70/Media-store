import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { getProductDetails } from '../../services/api/catalog'
import { getMovieVideos } from '../../services/api/tmdb'
import { hasAccess } from '../../services/api/orders'
import { useCart } from '../cart/CartContext'
import { useAuth } from '../auth/useAuth'
import { TrailerEmbed } from '../../components/TrailerEmbed'
import './ProductDetailPage.css'

const TYPE_LABEL = { movie: 'Film', book: 'Book', manga: 'Manga', comic: 'Comic' }

export function ProductDetailPage() {
  const { type, sourceId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { session } = useAuth()
  const { addToCart, addToWishlist, removeFromWishlist, isInCart, isInWishlist } = useCart()

  const preview = location.state?.item ?? null
  const [item, setItem] = useState(preview)
  const [status, setStatus] = useState(preview ? 'ready' : 'loading')

  const [userHasAccess, setUserHasAccess] = useState(false)
  const [trailerVideo, setTrailerVideo] = useState(null)
  const [trailerLoading, setTrailerLoading] = useState(false)
  const [noTrailerFound, setNoTrailerFound] = useState(false)

  function handleAddToCart() {
    if (!session) { navigate('/login', { state: { from: location.pathname } }); return }
    addToCart(item)
  }

  function handleToggleWishlist() {
    if (!session) { navigate('/login', { state: { from: location.pathname } }); return }
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id)
    } else {
      addToWishlist(item)
    }
  }

  useEffect(() => {
    let cancelled = false
    getProductDetails(type, decodeURIComponent(sourceId))
      .then((full) => {
        if (cancelled) return
        setItem((prev) => ({ ...prev, ...full }))
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus((prev) => (prev === 'ready' ? prev : 'error'))
      })
    return () => { cancelled = true }
  }, [type, sourceId])

  // Check ownership/rental access and load unlocked trailer if allowed
  useEffect(() => {
    if (!item || item.type !== 'movie') return

    let cancelled = false
    const userId = session?.user?.id

    if (!userId) {
      setUserHasAccess(false)
      return
    }

    hasAccess(userId, item.id).then((access) => {
      if (cancelled) return
      setUserHasAccess(access)

      if (access) {
        setTrailerLoading(true)
        getMovieVideos(item.sourceId).then((video) => {
          if (cancelled) return
          setTrailerLoading(false)
          if (video) {
            setTrailerVideo(video)
          } else {
            setNoTrailerFound(true)
          }
        })
      }
    })

    return () => {
      cancelled = true
    }
  }, [item?.id, item?.type, item?.sourceId, session?.user?.id])

  if (status === 'error') {
    return (
      <div className="container detail-page">
        <Link to="/" className="detail-back">← Back to the shelf</Link>
        <p className="detail-state detail-state-error">Couldn't load this title. It may have moved, or the source is briefly unavailable.</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container detail-page">
        <Link to="/" className="detail-back">← Back to the shelf</Link>
        <p className="detail-state">Loading…</p>
      </div>
    )
  }

  return (
    <div className={`container detail-page detail-page-${item.type}`}>
      <Link to="/" className="detail-back">← Back to the shelf</Link>

      <div className="detail-layout">
        <div className="detail-cover-frame">
          <div className="detail-cover">
            {item.cover ? (
              <img src={item.cover} alt="" />
            ) : (
              <div className="detail-cover-fallback" aria-hidden="true">{item.title.charAt(0)}</div>
            )}
          </div>
        </div>

        <div className="detail-content">
          <span className="eyebrow">{TYPE_LABEL[item.type]} · {item.source}</span>
          <h1>{item.title}</h1>

          <div className="detail-meta">
            {item.year && <span>{item.year}</span>}
            {item.rating != null && <span>★ {item.rating.toFixed(1)}</span>}
            <span>{TYPE_LABEL[item.type]}</span>
          </div>

          <div className="detail-divider" />

          {item.synopsis ? (
            <p className="detail-synopsis">{item.synopsis}</p>
          ) : (
            <p className="detail-synopsis text-muted">No synopsis available for this title yet.</p>
          )}

          <div className="detail-actions">
            <button
              className="btn btn-primary"
              disabled={session && isInCart(item.id)}
              onClick={handleAddToCart}
            >
              {session && isInCart(item.id) ? '✓ In Cart' : 'Add to Cart'}
            </button>
            <button
              className={`btn btn-ghost${session && isInWishlist(item.id) ? ' detail-wishlist-active' : ''}`}
              onClick={handleToggleWishlist}
            >
              {session && isInWishlist(item.id) ? '♥ Wishlisted' : '♡ Add to Wishlist'}
            </button>
          </div>

          {/* Locked or Unlocked Trailer Section */}
          {item.type === 'movie' && (
            <div className="detail-trailer-wrapper">
              <TrailerEmbed
                title={item.title}
                hasAccess={userHasAccess}
                videoKey={trailerVideo?.key}
                videoName={trailerVideo?.name}
                loading={trailerLoading}
                noVideoFound={noTrailerFound}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
