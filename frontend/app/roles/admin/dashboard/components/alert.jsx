'use client'

import React, { useMemo } from 'react'

const alertMap = {
  'All States': {
    missingGis: 3,
    unassignedProjects: 8,
    inactiveUsers: 4,
    pendingAssignments: 12
  },
  'State Level': {
    missingGis: 1,
    unassignedProjects: 5,
    inactiveUsers: 2,
    pendingAssignments: 7
  },
  'District Level': {
    missingGis: 1,
    unassignedProjects: 3,
    inactiveUsers: 2,
    pendingAssignments: 4
  },
  'Tehsil Level': {
    missingGis: 0,
    unassignedProjects: 2,
    inactiveUsers: 1,
    pendingAssignments: 3
  }
}

const resolveAdminJurisdiction = () => {
  if (typeof window === 'undefined') {
    return 'All States'
  }

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

const SystemAlerts = () => {
  const alertData = useMemo(() => {
    const jurisdiction = resolveAdminJurisdiction()
    return alertMap[jurisdiction] || alertMap['All States']
  }, [])

  const alerts = [
    { label: 'Missing GIS', value: alertData.missingGis, tone: 'warning' },
    { label: 'Unassigned Projects', value: alertData.unassignedProjects, tone: 'error' },
    { label: 'Inactive Users', value: alertData.inactiveUsers, tone: 'info' },
    { label: 'Pending Assignments', value: alertData.pendingAssignments, tone: 'success' }
  ]

  return (
    <section className="dashboard-card">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Operations</p>
          <h2>System Alerts</h2>
        </div>
        <span className="section-badge">{alerts.reduce((sum, item) => sum + item.value, 0)} items</span>
      </div>

      <div className="alert-list">
        {alerts.map((item) => (
          <div key={item.label} className={`alert-item alert-item--${item.tone}`}>
            <span className="alert-icon">!</span>
            <div className="alert-copy">
              <strong>{item.label}</strong>
              <span>{item.value} requiring action</span>
            </div>
            <span className={`alert-badge alert-badge--${item.tone}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default SystemAlerts
