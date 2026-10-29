import React from 'react'

const interventions = [
  { project: 'North ByPass Corridor', status: 'Pending', owner: 'Land acquisition team', due: 'Due today' },
  { project: 'Anandapur Utility Project', status: 'In Progress', owner: 'Field officer', due: 'Due in 3 days' },
  { project: 'Vikram Nagar Access Road', status: 'Completed', owner: 'R&R unit', due: 'Closed yesterday' },
]

const intervention = () => {
  return (
    <section className="dashboard-card dashboard-card--wide">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Operational status</p>
          <h2>Recent Interventions / Intervention Status</h2>
        </div>
        <span className="section-badge">This week</span>
      </div>

      <div className="intervention-summary">
        <div className="summary-card">
          <strong>08</strong>
          <span>Pending</span>
        </div>
        <div className="summary-card">
          <strong>12</strong>
          <span>Completed</span>
        </div>
        <div className="summary-card">
          <strong>04</strong>
          <span>Recently logged</span>
        </div>
      </div>

      <div className="intervention-list">
        {interventions.map((item) => (
          <article key={item.project} className="intervention-item">
            <div className="intervention-content">
              <div className="intervention-title">
                <span>{item.project}</span>
                <span className={`intervention-status ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {item.status}
                </span>
              </div>
              <span className="intervention-meta">{item.owner}</span>
            </div>
            <span className="alert-meta">{item.due}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default intervention