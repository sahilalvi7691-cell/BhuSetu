import React from 'react'

const trendValues = [26, 29, 32, 34, 36, 39, 42, 46]
const points = trendValues
  .map((value, index) => {
    const x = index * 38 + 10
    const y = 120 - value * 1.5
    return `${x},${y}`
  })
  .join(' ')

const trend = () => {
  return (
    <section className="dashboard-card risk-trend-card">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Trajectory</p>
          <h2>Risk Trend</h2>
        </div>
        <span className="status-pill trend-up">Trending up</span>
      </div>

      <div className="sparkline-card">
        <svg className="sparkline" viewBox="0 0 300 140" preserveAspectRatio="none" aria-label="Risk trend chart">
          <g>
            <line className="sparkline-grid" x1="0" y1="20" x2="300" y2="20" />
            <line className="sparkline-grid" x1="0" y1="60" x2="300" y2="60" />
            <line className="sparkline-grid" x1="0" y1="100" x2="300" y2="100" />
            <line className="sparkline-grid" x1="0" y1="140" x2="300" y2="140" />
          </g>
          <polyline className="sparkline-area" points={`10,120 ${points} 290,120`} />
          <polyline className="sparkline-line" points={points} />
        </svg>
      </div>

      <div className="trend-summary">
        <div>
          <div className="alert-meta">Current risk index</div>
          <strong>46 / 100</strong>
        </div>
        <span className="status-pill trend-up">+12% MoM</span>
      </div>
    </section>
  )
}

export default trend