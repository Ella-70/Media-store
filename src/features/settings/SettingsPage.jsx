import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { supabase } from '../../services/supabaseClient'
import './SettingsPage.css'

export function SettingsPage() {
  const { profile, signOut, refreshProfile } = useAuth()

  const [username, setUsername] = useState(profile?.username || '')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    const trimmed = username.trim()
    if (!trimmed) {
      setError('Username cannot be empty.')
      return
    }

    if (trimmed === profile?.username) {
      setMessage('No changes to save.')
      return
    }

    setSaving(true)

    // Check uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', trimmed)
      .neq('id', profile.id)
      .maybeSingle()

    if (existing) {
      setError('That username is already taken — try another one.')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: trimmed })
      .eq('id', profile.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setMessage('Username updated!')
      await refreshProfile()
    }

    setSaving(false)
  }

  return (
    <div className="container settings-page">
      <div className="settings-header">
        <span className="eyebrow">Account Settings</span>
        <h1>Settings</h1>
      </div>

      <form className="settings-card card" onSubmit={handleSave}>
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={24}
          />
        </label>

        <div className="settings-field-row">
          <label>
            Email
            <input type="email" value={profile?.email || ''} readOnly />
          </label>
          <label>
            Role
            <input type="text" value={profile?.role || ''} readOnly />
          </label>
        </div>

        {error && <p className="settings-error">{error}</p>}
        {message && <p className="settings-message">{message}</p>}

        <div className="settings-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </form>
    </div>
  )
}
