import React from 'react'

const alerts = [
  { title: 'Risk increased in Kalyani Phase 2', meta: '2 hours ago', type: 'alert', severity: 'Critical' },
  { title: 'Critical risk detected at Rajapur South', meta: '6 hours ago', type: 'alert', severity: 'High' },
  { title: 'Risk reduced after compensation settlement', meta: 'Yesterday', type: 'success', severity: 'Recovered' },
]

const alert = () => {
  return (
    <section className="dashboard-card">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Monitoring feed</p>
          <h2>Recent Risk Alerts</h2>
        </div>
        <span className="section-badge">Live</span>
      </div>

      <div className="alert-list">
        {alerts.map((alertItem) => (
          <article key={alertItem.title} className="alert-item">
            <div className={`alert-icon ${alertItem.type}`}>•</div>
            <div className="alert-content">
              <div className="alert-title">
                <span>{alertItem.title}</span>
                <span className={`status-pill ${alertItem.severity.toLowerCase() === 'critical' ? 'critical' : alertItem.severity.toLowerCase() === 'high' ? 'high' : 'low'}`}>
                  {alertItem.severity}
                </span>
              </div>
              <span className="alert-meta">{alertItem.meta}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default alert