'use client'

import React, { useMemo } from 'react'

const activityMap = {
  'All States': [
    { title: 'Project update', detail: 'North District expansion approved', time: '12 min ago', tone: 'blue' },
    { title: 'Role change', detail: '2 officers promoted to nodal access', time: '41 min ago', tone: 'purple' },
    { title: 'Officer assignment', detail: 'LAO assigned to Zone 3 parcel review', time: '1 hr ago', tone: 'green' },
    { title: 'User created', detail: '4 new project officers added', time: '3 hrs ago', tone: 'amber' }
  ],
  'State Level': [
    { title: 'Project update', detail: 'Civic works progress refreshed', time: '18 min ago', tone: 'blue' },
    { title: 'User created', detail: '3 field officers added to state roster', time: '52 min ago', tone: 'amber' },
    { title: 'Role change', detail: 'District admin access reviewed', time: '2 hrs ago', tone: 'purple' }
  ],
  'District Level': [
    { title: 'Officer assignment', detail: 'LAO reassigned to district boundary audit', time: '22 min ago', tone: 'green' },
    { title: 'Project update', detail: 'Two parcels moved to acquisition phase', time: '1 hr ago', tone: 'blue' },
    { title: 'User created', detail: 'A team member joined the district office', time: '5 hrs ago', tone: 'amber' }
  ],
  'Tehsil Level': [
    { title: 'Project update', detail: 'Site survey completed for 2 plots', time: '15 min ago', tone: 'blue' },
    { title: 'Officer assignment', detail: 'Nodal officer confirmed for current block', time: '58 min ago', tone: 'green' },
    { title: 'Role change', detail: 'Field access updated for one user', time: '3 hrs ago', tone: 'purple' }
  ]
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

const RecentActivity = () => {
  const feed = useMemo(() => {
    const jurisdiction = resolveAdminJurisdiction()
    return activityMap[jurisdiction] || activityMap['All States']
  }, [])

  return (
    <section className="dashboard-card">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Update Feed</p>
          <h2>Recent Activity</h2>
        </div>
        <span className="section-badge">Today</span>
      </div>

      <div className="activity-feed">
        {feed.map((item) => (
          <div key={`${item.title}-${item.time}`} className="activity-item">
            <span className={`activity-dot activity-dot--${item.tone}`} />
            <div className="activity-copy">
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </div>
            <time>{item.time}</time>
          </div>
        ))}
      </div>
    </section>
  )
}

export default RecentActivity
