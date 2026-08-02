import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export function ProtectedRoute({ children, allowedRoles }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p>Loading...</p>
  }

  // Not logged in at all — send to login page
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Profile hasn't loaded yet (edge case, rare) or account is suspended/banned
  if (!profile || profile.status !== 'active') {
    return <Navigate to="/login" replace />
  }

  // Logged in, but role not allowed here (e.g. a 'user' trying to hit /admin)
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    const message =
      location.pathname.startsWith('/admin')
        ? 'You don\u2019t have staff privileges to access the admin panel.'
        : 'You don\u2019t have permission to access that page.'

    return <Navigate to="/" replace state={{ flashMessage: message }} />
  }

  return children
}