import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getOrderById } from '../../services/api/orders'
import { getMovieVideos } from '../../services/api/tmdb'
import { TrailerEmbed } from '../../components/TrailerEmbed'
import './OrderReceiptPage.css'

const TYPE_LABEL = { movie: 'Film', book: 'Book', manga: 'Manga', comic: 'Comic' }

export function OrderReceiptPage() {
  const { orderId } = useParams()
  const { session } = useAuth()
  const userId = session?.user?.id

  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('loading')
  const [trailers, setTrailers] = useState([])
  const [trailersLoading, setTrailersLoading] = useState(true)

  useEffect(() => {
    if (!userId || !orderId) return

    let cancelled = false
    setStatus('loading')

    getOrderById(userId, orderId)
      .then((orderData) => {
        if (cancelled) return
        setOrder(orderData)
        setStatus('ready')

        // Filter movie items
        const movieItems = (orderData.items || []).filter((item) => {
          const snapshot = item.product_snapshot || {}
          const type = item.product_type || snapshot.type
          return type === 'movie'
        })

        if (movieItems.length === 0) {
          setTrailersLoading(false)
          return
        }

        // Fetch trailers directly for all movie items (purchase just succeeded)
        setTrailersLoading(true)
        const trailerPromises = movieItems.map(async (item) => {
          const snapshot = item.product_snapshot || {}
          const sourceId = snapshot.sourceId || item.product_id?.replace('movie-', '')
          const title = snapshot.title || item.title || 'Movie'

          if (!sourceId) return null

          const video = await getMovieVideos(sourceId)
          if (!video) return null

          return {
            id: item.id || item.product_id,
            title,
            videoKey: video.key,
            videoName: video.name,
          }
        })

        Promise.all(trailerPromises).then((results) => {
          if (cancelled) return
          setTrailers(results.filter(Boolean))
          setTrailersLoading(false)
        })
      })
      .catch((err) => {
        if (!cancelled) setStatus('error')
        console.error('OrderReceiptPage error:', err)
      })

    return () => {
      cancelled = true
    }
  }, [userId, orderId])

  if (status === 'error') {
    return (
      <div className="container receipt-page">
        <p className="receipt-state receipt-state-error">
          Order not found or you do not have permission to view it.
        </p>
        <p className="receipt-back"><Link to="/">← Back to the shelf</Link></p>
      </div>
    )
  }

  if (status === 'loading' || !order) {
    return (
      <div className="container receipt-page">
        <p className="receipt-state">Loading receipt details…</p>
      </div>
    )
  }

  const movieItemsCount = (order.items || []).filter((item) => {
    const snapshot = item.product_snapshot || {}
    return (item.product_type || snapshot.type) === 'movie'
  }).length

  return (
    <div className="container receipt-page">
      <div className="receipt-header">
        <span className="eyebrow">Order Confirmed</span>
        <h1>Thank you for your order!</h1>
        <p className="text-muted">
          Order #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="receipt-card card">
        <h2>Itemized Receipt</h2>

        <div className="receipt-items">
          {order.items.map((item) => {
            const snapshot = item.product_snapshot || {}
            const type = item.product_type || snapshot.type || 'movie'
            const title = snapshot.title || item.title || 'Untitled'
            const purchaseType = item.purchase_type || 'buy'
            const unitPrice = item.unit_price || 0
            const quantity = item.quantity || 1
            const lineTotal = item.line_total || Math.round(unitPrice * quantity * 100) / 100

            return (
              <div key={item.id || item.product_id} className="receipt-item-row">
                <div className="receipt-item-info">
                  <div className="receipt-item-badges">
                    <span className={`receipt-badge badge-${purchaseType}`}>
                      {purchaseType === 'rental' ? 'Rental (48h)' : 'Buy'}
                    </span>
                    <span className="receipt-type">{TYPE_LABEL[type] || type}</span>
                  </div>
                  <p className="receipt-item-title">{title}</p>
                  <p className="receipt-item-meta">
                    {quantity} × ${unitPrice.toFixed(2)}
                  </p>
                </div>
                <span className="receipt-item-total">${lineTotal.toFixed(2)}</span>
              </div>
            )
          })}
        </div>

        <div className="receipt-summary-total">
          <span>Order Total</span>
          <span className="total-amount">${Number(order.total || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Now Playing Trailers Section */}
      {movieItemsCount > 0 && (
        <div className="receipt-trailers-section">
          <div className="receipt-section-header">
            <span className="eyebrow">Now Playing</span>
            <h2>Movie Trailers</h2>
            <p className="text-muted">Enjoy official trailers for the movies in your order.</p>
          </div>

          {trailersLoading ? (
            <div className="receipt-trailers-grid">
              {Array.from({ length: movieItemsCount }).map((_, i) => (
                <TrailerEmbed key={i} loading={true} />
              ))}
            </div>
          ) : trailers.length > 0 ? (
            <div className="receipt-trailers-grid">
              {trailers.map((t) => (
                <TrailerEmbed
                  key={t.id}
                  title={t.title}
                  hasAccess={true}
                  videoKey={t.videoKey}
                  videoName={t.videoName}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}

      <div className="receipt-footer-actions">
        <Link to="/" className="btn btn-primary">
          Continue Browsing →
        </Link>
      </div>
    </div>
  )
}
