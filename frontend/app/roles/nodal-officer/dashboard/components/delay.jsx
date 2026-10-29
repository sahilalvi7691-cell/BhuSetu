import React from 'react'

const drivers = [
  { label: 'Legal Disputes', value: 38, color: '#ef4444' },
  { label: 'Compensation', value: 26, color: '#f97316' },
  { label: 'R&R', value: 20, color: '#fbbf24' },
  { label: 'Approvals', value: 16, color: '#22c55e' },
]

const delay = () => {
  return (
    <section className="dashboard-card">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Delay analysis</p>
          <h2>Top Delay Drivers</h2>
        </div>
        <span className="section-badge">This month</span>
      </div>

      <div className="delay-list">
        {drivers.map((driver) => (
          <div key={driver.label} className="delay-item">
            <div className="delay-top">
              <span>{driver.label}</span>
              <span>{driver.value}%</span>
            </div>
            <div className="delay-bar">
              <span style={{ width: `${driver.value}%`, background: driver.color }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default delay