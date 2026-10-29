import React from 'react'

const projects = [
  { name: 'Nizamabad Industrial Belt', risk: 'Critical', progress: '82% risk', note: 'Compensation dispute escalated in phase 3' },
  { name: 'Sriram Nagar Village', risk: 'High', progress: '74% risk', note: 'R&R transfer pending for 26 households' },
  { name: 'Kaveri Link Road', risk: 'Critical', progress: '89% risk', note: 'Approvals delayed by state agency review' },
  { name: 'Rajapur Expansion', risk: 'High', progress: '71% risk', note: 'Legal objection filed by local claimant' },
]

const attention = () => {
  return (
    <section className="dashboard-card">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Priority watchlist</p>
          <h2>Projects Requiring Attention</h2>
        </div>
        <span className="section-badge">⭐ 4 flagged</span>
      </div>

      <div className="attention-list">
        {projects.map((project) => (
          <article key={project.name} className="attention-item">
            <div className="attention-icon">★</div>

            <div className="attention-details">
              <div className="attention-title">
                <span>{project.name}</span>
                <span className={`risk-tag ${project.risk.toLowerCase()}`}>{project.risk}</span>
              </div>
              <span className="attention-sub">{project.progress}</span>
              <span className="attention-sub">{project.note}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default attention