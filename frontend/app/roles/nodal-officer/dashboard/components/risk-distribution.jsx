import React from 'react'

const distribution = [
  { label: 'Low', percent: 42, color: '#22c55e' },
  { label: 'Medium', percent: 28, color: '#fbbf24' },
  { label: 'High', percent: 21, color: '#f97316' },
  { label: 'Critical', percent: 9, color: '#ef4444' },
]

const risk = () => {
  return (
    <section className="dashboard-card">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Portfolio mix</p>
          <h2>Risk Distribution</h2>
        </div>
        <span className="section-badge">Q3</span>
      </div>

      <div className="risk-distribution-wrap">
        <div className="donut-chart" aria-label="Risk distribution donut chart">
          <div className="donut-value">18</div>
        </div>

        <div className="legend-list">
          {distribution.map((item) => (
            <div key={item.label} className="legend-item">
              <div className="legend-meta">
                <span className="legend-swatch" style={{ background: item.color }} />
                {item.label}
              </div>
              <span className="legend-value">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default risk