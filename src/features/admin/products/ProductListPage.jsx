// // Placeholder — full implementation comes in Section 3
// export function ProductListPage() {
//   return (
//     <div>
//       <p className="eyebrow">Admin</p>
//       <h1>Product Management</h1>
//       <p className="text-muted">Full product list coming in Section 3…</p>
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllProducts, deleteProduct } from '../../../services/api/products'
import './ProductListPage.css'

const TYPE_LABEL = { movie: 'Film', book: 'Book', manga: 'Manga', comic: 'Comic' }

export function ProductListPage() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setStatus('loading')
    setError('')
    try {
      const data = await fetchAllProducts()
      setProducts(data)
      setStatus('ready')
    } catch (err) {
      console.error('ProductListPage: failed to load products', err)
      setError(err.message)
      setStatus('error')
    }
  }

  async function handleDelete(product) {
    const ok = window.confirm(`Delete "${product.title}"? This can't be undone.`)
    if (!ok) return

    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch (err) {
      console.error('ProductListPage: failed to delete product', err)
      window.alert(`Couldn't delete this product: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="product-list-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Product Management</h1>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">
          + Add Product
        </Link>
      </div>

      {status === 'loading' && <p className="text-muted">Loading products…</p>}

      {status === 'error' && (
        <div className="card admin-empty-state">
          <p>Couldn't load products: {error}</p>
          <button className="btn btn-ghost" onClick={load}>Try again</button>
        </div>
      )}

      {status === 'ready' && products.length === 0 && (
        <div className="card admin-empty-state">
          <p>No custom products yet.</p>
          <Link to="/admin/products/new" className="btn btn-primary">Add your first product</Link>
        </div>
      )}

      {status === 'ready' && products.length > 0 && (
        <div className="admin-table-wrap card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Price</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="product-list-title-cell">
                    {product.cover_image ? (
                      <img src={product.cover_image} alt="" className="product-list-thumb" />
                    ) : (
                      <div className="product-list-thumb product-list-thumb-fallback" aria-hidden="true">
                        {(product.title || '?').charAt(0)}
                      </div>
                    )}
                    <span>{product.title || 'Untitled'}</span>
                  </td>
                  <td>{TYPE_LABEL[product.type] || product.type || '—'}</td>
                  <td>{product.price != null ? `$${Number(product.price).toFixed(2)}` : '—'}</td>
                  <td className="admin-table-actions">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      state={{ product }}
                      className="btn btn-ghost"
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
