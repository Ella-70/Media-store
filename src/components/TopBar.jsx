import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { useCart } from '../features/cart/CartContext'
import './TopBar.css'

export function TopBar() {
  const { session, profile, signOut } = useAuth()
  const { cartCount, wishlistCount } = useCart()
  const canAccessAdmin = profile?.role === 'staff' || profile?.role === 'manager'
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="top-bar">
      <div className="container top-bar-inner">
        <Link to="/" className="top-bar-brand">
          <svg className="top-bar-logo" width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="4" y="22" width="24" height="5" rx="1" fill="#4a6fe0"/>
            <rect x="6" y="15" width="20" height="5" rx="1" fill="#f2a93b"/>
            <rect x="8" y="8" width="16" height="5" rx="1" fill="#e15a4b"/>
          </svg>
          The Stacks
        </Link>

        <button
          type="button"
          className="top-bar-menu-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          )}
        </button>

        {menuOpen && (
          <nav className="top-bar-mobile-menu">
            <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => `top-bar-mobile-link ${isActive ? 'is-active' : ''}`}>
              Shelf
            </NavLink>
            {session && (
              <NavLink to="/library" onClick={closeMenu} className={({ isActive }) => `top-bar-mobile-link ${isActive ? 'is-active' : ''}`}>
                Library
              </NavLink>
            )}
            {session && (
              <button
                type="button"
                className="top-bar-mobile-link top-bar-mobile-signout"
                onClick={() => { closeMenu(); signOut() }}
              >
                Sign out
              </button>
            )}
          </nav>
        )}

        {session ? (
          <div className="top-bar-account">
            <NavLink to="/" end className={({ isActive }) => `top-bar-nav-link ${isActive ? 'is-active' : ''}`}>
              Shelf
            </NavLink>
            <NavLink to="/library" className={({ isActive }) => `top-bar-nav-link ${isActive ? 'is-active' : ''}`}>
              Library
            </NavLink>

            {canAccessAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `top-bar-icon-btn ${isActive ? 'is-active' : ''}`}
                title="Admin panel"
                aria-label="Admin panel"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </NavLink>
            )}

            <NavLink
              to="/wishlist"
              className={({ isActive }) => `top-bar-icon-btn ${isActive ? 'is-active' : ''}`}
              title="Wishlist"
              aria-label="Wishlist"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.6" fill="none"/>
              </svg>
              {wishlistCount > 0 && <span className="top-bar-badge">{wishlistCount}</span>}
            </NavLink>

            <NavLink
              to="/cart"
              className={({ isActive }) => `top-bar-icon-btn ${isActive ? 'is-active' : ''}`}
              title="Cart"
              aria-label="Cart"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              {cartCount > 0 && <span className="top-bar-badge">{cartCount}</span>}
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) => `top-bar-icon-btn ${isActive ? 'is-active' : ''}`}
              title="Settings"
              aria-label="Settings"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.6" fill="none"/>
              </svg>
            </NavLink>

            <Link to="/settings" className="text-muted top-bar-email" title="Profile settings">
              {profile?.username ? `@${profile.username}` : profile?.email}
            </Link>
            <button className="btn btn-ghost top-bar-signout-desktop" onClick={signOut}>Sign out</button>
          </div>
        ) : (
          <div className="top-bar-account">
            <NavLink to="/" end className={({ isActive }) => `top-bar-nav-link ${isActive ? 'is-active' : ''}`}>
              Shelf
            </NavLink>
            <Link className="btn btn-primary" to="/login">Log in</Link>
          </div>
        )}
      </div>
    </header>
  )
}