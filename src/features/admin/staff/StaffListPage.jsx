// // Placeholder — full implementation comes in Section 4
// export function StaffListPage() {
//   return (
//     <div>
//       <p className="eyebrow">Manager</p>
//       <h1>Staff &amp; Access Control</h1>
//       <p className="text-muted">Full staff management coming in Section 4…</p>
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { fetchStaffProfiles, updateStaffProfile, logStaffAction, fetchStaffLogs } from '../../../services/api/staff'
import './StaffListPage.css'

const ROLES = ['user', 'staff', 'manager']

export function StaffListPage() {
  const { profile: currentProfile } = useAuth()

  const [staff, setStaff] = useState([])
  const [logs, setLogs] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setStatus('loading')
    setError('')
    try {
      const [staffData, logsData] = await Promise.all([
        fetchStaffProfiles(),
        fetchStaffLogs().catch(() => []), // logs are a nice-to-have, don't block the page on them
      ])
      setStaff(staffData)
      setLogs(logsData)
      setStatus('ready')
    } catch (err) {
      console.error('StaffListPage: failed to load staff', err)
      setError(err.message)
      setStatus('error')
    }
  }

  async function handleRoleChange(person, newRole) {
    if (newRole === person.role) return
    await applyChange(person, { role: newRole }, `Changed role from "${person.role}" to "${newRole}"`)
  }

  async function handleStatusToggle(person) {
    const newStatus = person.status === 'active' ? 'suspended' : 'active'
    await applyChange(person, { status: newStatus }, `Changed status from "${person.status}" to "${newStatus}"`)
  }

  async function applyChange(person, updates, actionLabel) {
    setSavingId(person.id)
    try {
      const updated = await updateStaffProfile(person.id, updates)
      setStaff((prev) => prev.map((p) => (p.id === person.id ? updated : p)))

      await logStaffAction({
        action: `${actionLabel} for ${person.email}`,
        targetProfileId: person.id,
        performedBy: currentProfile?.id,
      })
      fetchStaffLogs().then(setLogs).catch(() => {})
    } catch (err) {
      console.error('StaffListPage: update failed', err)
      window.alert(`Couldn't update this profile: ${err.message}`)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="staff-list-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Manager</span>
          <h1>Staff &amp; Access Control</h1>
        </div>
      </div>

      {status === 'loading' && <p className="text-muted">Loading staff…</p>}

      {status === 'error' && (
        <div className="card admin-empty-state">
          <p>Couldn't load staff: {error}</p>
          <button className="btn btn-ghost" onClick={load}>Try again</button>
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="admin-table-wrap card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {staff.map((person) => {
                  const isSelf = person.id === currentProfile?.id
                  const isSaving = savingId === person.id
                  return (
                    <tr key={person.id}>
                      <td>{person.email}{isSelf && <span className="staff-you-badge">you</span>}</td>
                      <td>
                        <select
                          value={person.role}
                          onChange={(e) => handleRoleChange(person, e.target.value)}
                          disabled={isSelf || isSaving}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`staff-status-badge staff-status-${person.status}`}>
                          {person.status}
                        </span>
                      </td>
                      <td className="admin-table-actions">
                        <button
                          className="btn btn-ghost"
                          onClick={() => handleStatusToggle(person)}
                          disabled={isSelf || isSaving}
                        >
                          {isSaving ? 'Saving…' : person.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="staff-log-section">
            <h2>Recent Activity</h2>
            {logs.length === 0 ? (
              <p className="text-muted">No staff actions logged yet.</p>
            ) : (
              <ul className="staff-log-list card">
                {logs.map((log) => (
                  <li key={log.id}>
                    <span className="staff-log-action">{log.action}</span>
                    <span className="staff-log-time text-muted">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}

