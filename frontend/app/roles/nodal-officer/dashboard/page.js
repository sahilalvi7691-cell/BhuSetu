import React from 'react'
import './page.css'
import {Header} from '../../../component/layout/index'
import {KPI,Gis,RiskDistribution,RiskAlert,Delay,Attention,Intervention,RiskTrend} from './components/index'

const page = () => {
  return (
    <>
      <Header title="Dashboard" />

      <div className="nodal-dashboard">
        <div className="dashboard-shell">
          <header className="dashboard-header">
            <div>
              <p className="eyebrow">State Overview</p>
              <h1>Nodal Officer Dashboard</h1>
            </div>

            <div className="header-meta">
              <span>Updated 8 minutes ago</span>
              <button type="button" className="header-action">
                View all alerts
              </button>
            </div>
          </header>

          <KPI />

          <div className="dashboard-grid">
            <Attention />
            <Gis />
            <RiskDistribution />
            <RiskTrend />
            <Delay />
            <RiskAlert />
            
            <Intervention />
          </div>
        </div>
      </div>
    </>
  )
}

export default page