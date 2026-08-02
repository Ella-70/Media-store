import { Routes, Route, Navigate } from 'react-router-dom'
import { TopBar } from './components/TopBar'
import { Footer } from './components/Footer'
import { CatalogPage } from './features/catalog/CatalogPage'
import { ProductDetailPage } from './features/product-detail/ProductDetailPage'
import { LoginPage } from './features/auth/LoginPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AdminLayout } from './features/admin/AdminLayout'
import { ProductListPage } from './features/admin/products/ProductListPage'
import { ProductFormPage } from './features/admin/products/ProductFormPage'
import { StaffListPage } from './features/admin/staff/StaffListPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { CartPage } from './features/cart/CartPage'
import { WishlistPage } from './features/cart/WishlistPage'
import { OrderReceiptPage } from './features/checkout/OrderReceiptPage'
import { MyLibraryPage } from './features/checkout/MyLibraryPage'

function App() {
  return (
    <>
      <TopBar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/product/:type/:sourceId" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin panel — nested routes inside AdminLayout shell */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['staff', 'manager']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <StaffListPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <MyLibraryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order/:orderId"
            element={
              <ProtectedRoute>
                <OrderReceiptPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App