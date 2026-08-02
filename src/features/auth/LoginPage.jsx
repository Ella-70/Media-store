import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { supabase } from '../../services/supabaseClient'
import './LoginPage.css'

export function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error)
      } else {
        navigate('/')
      }
    } else {
      // Check username uniqueness before creating the account
      if (!username.trim()) {
        setError('Please choose a username.')
        setSubmitting(false)
        return
      }

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim())
        .maybeSingle()

      if (existing) {
        setError('That username is already taken — try another one.')
        setSubmitting(false)
        return
      }

      const { error } = await signUp(email, password, username.trim())
      if (error) {
        setError(error)
      } else {
        setMessage('Account created! Check your email to confirm, then log in.')
        setMode('login')
      }
    }

    setSubmitting(false)
  }

  return (
    <div className="login-page">
      <form className="login-card card" onSubmit={handleSubmit}>
        <h1>{mode === 'login' ? 'Log In' : 'Create Account'}</h1>

        {mode === 'signup' && (
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={24}
              placeholder="e.g. bookworm42"
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        {error && <p className="login-error">{error}</p>}
        {message && <p className="login-message">{message}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>

        <p className="login-toggle">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button type="button" onClick={() => setMode('signup')}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')}>
                Log in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  )
}