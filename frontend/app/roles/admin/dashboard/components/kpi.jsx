import React from 'react'

const adminJurisdictionData = {
  'All States': {
    totalUsers: 1842,
    activeProjects: 48,
    pendingAssignments: 29,
    activeOfficers: 126,
    districtsCovered: 18,
    systemAlerts: 7
  },
  'State Level': {
    totalUsers: 942,
    activeProjects: 26,
    pendingAssignments: 16,
    activeOfficers: 64,
    districtsCovered: 9,
    systemAlerts: 4
  },
  'District Level': {
    totalUsers: 318,
    activeProjects: 12,
    pendingAssignments: 11,
    activeOfficers: 22,
    districtsCovered: 4,
    systemAlerts: 2
  },
  'Tehsil Level': {
    totalUsers: 124,
    activeProjects: 7,
    pendingAssignments: 6,
    activeOfficers: 12,
    districtsCovered: 2,
    systemAlerts: 1
  }
}

const resolveAdminJurisdiction = () => {
  if (typeof window === 'undefined') {
    return 'All States'
  }

  const storedProfile = window.localStorage.getItem('adminProfile') || window.localStorage.getItem('currentProfile') || window.localStorage.getItem('selectedProfile')

  if (!storedProfile) {
    return 'All States'
  }

  try {
    const parsedProfile = JSON.parse(storedProfile)
    if (parsedProfile?.jurisdiction) {
      return parsedProfile.jurisdiction
    }
  } catch {
    return 'All States'
  }

  return 'All States'
}

const getKpiData = () => {
  const jurisdiction = resolveAdminJurisdiction()
  const metrics = adminJurisdictionData[jurisdiction] || adminJurisdictionData['All States']

  return [
    {
      id: 'total-users',
      label: 'Total Users',
      value: metrics.totalUsers,
      delta: '+8.4%',
      trendClass: 'low',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
          <circle cx="10" cy="7" r="4" />
          <path d="M20 19v-1a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      iconStyle: { background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)', color: '#1d4ed8' }
    },
    {
      id: 'active-projects',
      label: 'Active Projects',
      value: metrics.activeProjects,
      delta: '+4.2%',
      trendClass: 'low',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
          <path d="M8 5V3.75M16 5V3.75M4 10h16" />
        </svg>
      ),
      iconStyle: { background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)', color: '#1d4ed8' }
    },
    {
      id: 'pending-assignments',
      label: 'Pending Assignments',
      value: metrics.pendingAssignments,
      delta: '+1.1%',
      trendClass: 'medium',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      ),
      iconStyle: { background: 'linear-gradient(135deg, #fef3c7 0%, #fff7ed 100%)', color: '#d97706' }
    },
    {
      id: 'active-officers',
      label: 'Active Officers',
      value: metrics.activeOfficers,
      delta: '+2.6%',
      trendClass: 'low',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="M19 8h2M17 11l1.5 1.5" />
        </svg>
      ),
      iconStyle: { background: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)', color: '#7c3aed' }
    },
    {
      id: 'districts-covered',
      label: 'Districts Covered',
      value: metrics.districtsCovered,
      delta: '+3.4%',
      trendClass: 'low',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      ),
      iconStyle: { background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)', color: '#16a34a' }
    },
    {
      id: 'system-alerts',
      label: 'System Alerts',
      value: metrics.systemAlerts,
      delta: '-0.6%',
      trendClass: 'critical',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      ),
      iconStyle: { background: 'linear-gradient(135deg, #fee2e2 0%, #fff1f2 100%)', color: '#dc2626' }
    }
  ]
}

const KpiCards = () => {
  const kpiData = getKpiData()

  return (
    <section className="kpi-grid" aria-label="State overview KPI cards">
      {kpiData.map((item) => (
        <article key={item.id} className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">{item.label}</span>
            <div className="kpi-icon" style={item.iconStyle}>{item.icon}</div>
          </div>

          <div className="kpi-value-row">
            <span className="kpi-value">{item.value}</span>
            <span className={`kpi-trend ${item.trendClass}`}>{item.delta}</span>
          </div>
        </article>
      ))}
    </section>
  )
}

export default KpiCards