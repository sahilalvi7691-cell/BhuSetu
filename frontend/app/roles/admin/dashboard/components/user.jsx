'use client'

import { useEffect, useMemo, useState } from 'react'

const ROLE_META = {
  project_officer: { label: 'PO', color: '#2563eb' },
  land_acquisition_officer: { label: 'LAO', color: '#14b8a6' },
  nodal_officer: { label: 'Nodal', color: '#8b5cf6' },
  system_admin: { label: 'Admin', color: '#f59e0b' }
}

const normalizeRoleKey = (role = '') => {
  const value = String(role).trim().toLowerCase()

  if (!value) return 'project_officer'
  if (value.includes('admin') || value.includes('system')) return 'system_admin'
  if (value.includes('nodal')) return 'nodal_officer'
  if (value.includes('land') || value.includes('acquisition')) return 'land_acquisition_officer'
  if (value.includes('project')) return 'project_officer'

  return 'project_officer'
}

const resolveAdminJurisdiction = () => {
  if (typeof window === 'undefined') return 'All States'

  const storedProfile = window.localStorage.getItem('adminProfile') || window.localStorage.getItem('currentProfile') || window.localStorage.getItem('selectedProfile')

  if (!storedProfile) return 'All States'

  try {
    const parsedProfile = JSON.parse(storedProfile)
    if (parsedProfile?.jurisdiction) return parsedProfile.jurisdiction
  } catch {
    return 'All States'
  }

  return 'All States'
}

const UserOverview = () => {
  const [roleCounts, setRoleCounts] = useState({
    project_officer: 0,
    land_acquisition_officer: 0,
    nodal_officer: 0,
    system_admin: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const fetchUserStats = async () => {
      try {
        const response = await fetch('/data/profiles.json')

        if (!response.ok) throw new Error('Unable to load user data')

        const payload = await response.json()
        const counts = {
          project_officer: 45,
          land_acquisition_officer: 16,
          nodal_officer: 50,
          system_admin: 5
        }

        Object.values(payload).forEach((profile) => {
          if (!profile || typeof profile !== 'object') return

          const key = normalizeRoleKey(profile.role)
          if (counts[key] !== undefined) {
            counts[key] += 1
          }
        })

        if (mounted) {
          setRoleCounts(counts)
          setError('')
        }
      } catch (fetchError) {
        if (mounted) {
          setError(fetchError.message || 'Unable to load user data')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchUserStats()

    return () => {
      mounted = false
    }
  }, [])

  const distribution = useMemo(() => {
    const entries = Object.entries(ROLE_META).map(([key, meta]) => ({
      key,
      label: meta.label,
      color: meta.color,
      value: roleCounts[key] || 0
    }))

    const total = entries.reduce((sum, entry) => sum + entry.value, 0)

    return entries.map((entry) => ({
      ...entry,
      share: total ? Math.round((entry.value / total) * 100) : 0
    }))
  }, [roleCounts])

  const totalUsers = distribution.reduce((sum, entry) => sum + entry.value, 0)

  const gaugeBackground = useMemo(() => {
    const activeEntries = distribution.filter((entry) => entry.value > 0)

    if (!activeEntries.length) {
      return 'conic-gradient(#e2e8f0 0 100%)'
    }

    const total = activeEntries.reduce((sum, entry) => sum + entry.value, 0)
    let start = 0

    const segments = activeEntries.map((entry) => {
      const share = (entry.value / total) * 100
      const end = start + share
      const segment = `${entry.color} ${start}% ${end}%`
      start = end
      return segment
    })

    return `conic-gradient(${segments.join(', ')})`
  }, [distribution])

  const jurisdictionLabel = resolveAdminJurisdiction()

  return (
    <section className="dashboard-card  user-overview-panel">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Access</p>
          <h2>User Overview</h2>
        </div>
        <span className="section-badge">{jurisdictionLabel}</span>
      </div>

      {error ? (
        <div className="status-inline status-inline--error">{error}</div>
      ) : (
        <div className="user-overview-shell">
          <div className="user-gauge-wrap">
            <div className="user-gauge-ring" style={{ background: gaugeBackground }}>
              <div className="user-gauge-center">
                <span className="user-gauge-label">Officers</span>
                <strong>{loading ? '—' : totalUsers}</strong>
              </div>
            </div>
          </div>

          <div className="user-metrics-panel">
            <div className="user-metric-topline">
              <span className="user-metric-tag">Composition</span>
              <strong>{loading ? '—' : `${totalUsers} total`}</strong>
            </div>

            <div className="user-role-grid">
              {distribution.map((item) => (
                <div key={item.key} className="user-role-item">
                  <div className="user-role-name">
                    <span className="user-role-dot" style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default UserOverview
