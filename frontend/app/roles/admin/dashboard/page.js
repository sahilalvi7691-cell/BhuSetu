import React from 'react'
import './page.css'
import {Header} from '../../../component/layout/index'
import {KPI,Project,User,Gis,Assignment,Activity,Alert} from './components/index'

const page = () => {
  return (
    <>
      <Header title="Dashboard" />

      <div className="admin-dashboard">
        <div className="dashboard-shell">
          <header className="dashboard-header">
            <div>
              <p className="eyebrow">State Overview</p>
              <h1>Admin Dashboard</h1>
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
            <User/>
            <Project />
            <Gis />
            <Assignment/>
            <Activity/>
            <Alert/>
          </div>
        </div>
      </div>
    </>
  )
}

export default page