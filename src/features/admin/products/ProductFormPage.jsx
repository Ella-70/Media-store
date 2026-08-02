// // Placeholder — full implementation comes in Section 3
// export function ProductFormPage() {
//   return (
//     <div>
//       <p className="eyebrow">Admin</p>
//       <h1>Product Form</h1>
//       <p className="text-muted">Full product form coming in Section 3…</p>
//     </div>
//   )
// }


import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { createProduct, updateProduct, fetchAllProducts } from '../../../services/api/products'
import './ProductFormPage.css'

const TYPES = ['movie', 'book', 'manga', 'comic']

// Matches the real columns on the `products` table:
// id, title, type, price, description, cover_image, api_reference_id, created_at
const EMPTY_FORM = {
  title: '',
  type: 'movie',
  cover_image: '',
  price: '',
  description: '',
}

export function ProductFormPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready') // loading | ready | notfound
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return

    // Prefer the product handed over via navigation state (from the list
    // page) so we don't have to re-fetch — fall back to a lookup if the
    // form was opened directly (e.g. page refresh, shared link).
    const passedProduct = location.state?.product
    if (passedProduct) {
      setForm(productToForm(passedProduct))
      setStatus('ready')
      return
    }

    fetchAllProducts()
      .then((all) => {
        const match = all.find((p) => String(p.id) === String(id))
        if (!match) {
          setStatus('notfound')
          return
        }
        setForm(productToForm(match))
        setStatus('ready')
      })
      .catch((err) => {
        console.error('ProductFormPage: failed to load product', err)
        setError(err.message)
        setStatus('notfound')
      })
  }, [id, isEdit, location.state])

  function productToForm(product) {
    return {
      title: product.title || '',
      type: product.type || 'movie',
      cover_image: product.cover_image || '',
      price: product.price ?? '',
      description: product.description || '',
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }

    const payload = {
      title: form.title.trim(),
      type: form.type,
      cover_image: form.cover_image.trim() || null,
      price: form.price === '' ? 0 : Number(form.price),
      description: form.description.trim(),
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateProduct(id, payload)
      } else {
        await createProduct(payload)
      }
      navigate('/admin/products')
    } catch (err) {
      console.error('ProductFormPage: save failed', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="product-form-page">
        <span className="eyebrow">Admin</span>
        <h1>Product Form</h1>
        <p className="text-muted">Loading product…</p>
      </div>
    )
  }

  if (status === 'notfound') {
    return (
      <div className="product-form-page">
        <span className="eyebrow">Admin</span>
        <h1>Product not found</h1>
        <p className="text-muted">{error || "This product doesn't exist or may have been deleted."}</p>
        <Link to="/admin/products" className="btn btn-primary">← Back to products</Link>
      </div>
    )
  }

  return (
    <div className="product-form-page">
      <span className="eyebrow">Admin</span>
      <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form className="product-form card" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. The Midnight Library"
            required
          />
        </label>

        <div className="product-form-row">
          <label>
            Type
            <select value={form.type} onChange={(e) => updateField('type', e.target.value)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </label>
          <label>
            Price ($)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              placeholder="9.99"
            />
          </label>
        </div>

        <label>
          Cover image URL
          <input
            type="url"
            value={form.cover_image}
            onChange={(e) => updateField('cover_image', e.target.value)}
            placeholder="https://…"
          />
        </label>

        <label>
          Description
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="What's this title about?"
          />
        </label>

        {error && <p className="product-form-error">{error}</p>}

        <div className="product-form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <Link to="/admin/products" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  )
}

