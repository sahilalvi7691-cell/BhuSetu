'use client'

import React, { useMemo } from 'react'

const assignmentMap = {
  'All States': {
    assignedProjects: 42,
    unassignedProjects: 8,
    laosAssigned: 18,
    nodalOfficersAssigned: 6
  },
  'State Level': {
    assignedProjects: 26,
    unassignedProjects: 5,
    laosAssigned: 11,
    nodalOfficersAssigned: 4
  },
  'District Level': {
    assignedProjects: 12,
    unassignedProjects: 4,
    laosAssigned: 6,
    nodalOfficersAssigned: 2
  },
  'Tehsil Level': {
    assignedProjects: 7,
    unassignedProjects: 2,
    laosAssigned: 3,
    nodalOfficersAssigned: 1
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

const AssignmentOverview = () => {
  const metrics = useMemo(() => {
    const jurisdiction = resolveAdminJurisdiction()
    return assignmentMap[jurisdiction] || assignmentMap['All States']
  }, [])

  const items = [
    { label: 'Assigned Projects', value: metrics.assignedProjects, tone: 'sky' },
    { label: 'Unassigned Projects', value: metrics.unassignedProjects, tone: 'amber' },
    { label: 'LAOs Assigned', value: metrics.laosAssigned, tone: 'teal' },
    { label: 'Nodal Officers Assigned', value: metrics.nodalOfficersAssigned, tone: 'violet' }
  ]

  return (
    <section className="dashboard-card">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Coverage</p>
          <h2>Assignment Overview</h2>
        </div>
        <span className="section-badge">Live</span>
      </div>

      <div className="assignment-grid">
        {items.map((item) => (
          <div key={item.label} className={`assignment-item assignment-item--${item.tone}`}>
            <span className="assignment-label">{item.label}</span>
            <strong className="assignment-value">{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AssignmentOverview
