import React from 'react'

const kpiData = [
  {
    id: 'total-projects',
    label: 'Total Projects',
    value: 18,
    delta: '+4.2%',
    trendClass: 'low',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
        <path d="M8 5V3.75M16 5V3.75M4 10h16" />
      </svg>
    ),
    badgeColor: 'background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); color: #1d4ed8;'
  },
  {
    id: 'high-critical',
    label: 'High / Critical',
    value: 6,
    delta: '+1.1%',
    trendClass: 'critical',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      </svg>
    ),
    badgeColor: 'background: linear-gradient(135deg, #fee2e2 0%, #fff1f2 100%); color: #dc2626;'
  },
  {
    id: 'medium-risk',
    label: 'Medium Risk',
    value: 7,
    delta: '-0.8%',
    trendClass: 'medium',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v10M12 22V12M18 6l-6 6-6-6" />
      </svg>
    ),
    badgeColor: 'background: linear-gradient(135deg, #fef3c7 0%, #fff7ed 100%); color: #d97706;'
  },
  {
    id: 'low-risk',
    label: 'Low Risk',
    value: 5,
    delta: '+2.5%',
    trendClass: 'low',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 12.5 10 15.5 17 8.5" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
    badgeColor: 'background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%); color: #16a34a;'
  },
  {
    id: 'pending-interventions',
    label: 'Pending Interventions',
    value: 11,
    delta: '+3.1%',
    trendClass: 'medium',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    badgeColor: 'background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); color: #7c3aed;'
  }
]

const KpiCards = () => {
  return (
    <section className="kpi-grid" aria-label="State overview KPI cards">
      {kpiData.map((item) => (
        <article key={item.id} className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">{item.label}</span>
            <div className={`kpi-icon ${item.badgeColor}`}>{item.icon}</div>
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