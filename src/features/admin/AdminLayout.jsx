import { useState } from 'react'
import { NavLink, Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import './AdminLayout.css'

export function AdminLayout() {
  const { profile } = useAuth()
  const isManager = profile?.role === 'manager'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'is-open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-brand-icon">A</span>
          Admin Panel
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin/products"
            end={false}
            className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}
            onClick={closeSidebar}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M20 7H4a1 1 0 00-1 1v11a2 2 0 002 2h14a2 2 0 002-2V8a1 1 0 00-1-1zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Products
          </NavLink>

          {isManager && (
            <NavLink
              to="/admin/staff"
              className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}
              onClick={closeSidebar}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Staff
            </NavLink>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-sidebar-back">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to store
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="admin-content">
        <Outlet />
      </div>

      {/* Mobile toggle */}
      <button
        className="admin-sidebar-toggle"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="Toggle admin menu"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 12h18M3 6h18M3 18h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}
