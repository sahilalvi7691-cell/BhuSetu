'use client'

import React, { useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip)

const projectStatusMap = {
  'All States': {
    active: 26,
    underAcquisition: 14,
    completed: 9,
    onHold: 3
  },
  'State Level': {
    active: 18,
    underAcquisition: 9,
    completed: 6,
    onHold: 2
  },
  'District Level': {
    active: 8,
    underAcquisition: 5,
    completed: 4,
    onHold: 1
  },
  'Tehsil Level': {
    active: 4,
    underAcquisition: 3,
    completed: 2,
    onHold: 1
  }
}

const resolveAdminJurisdiction = () => {
  if (typeof window === 'undefined') {
    return 'All States'
  }

  const storedProfile = window.localStorage.getItem('adminProfile') || window.localStorage.getItem('currentProfile') || window.localStorage.getItem('selectedProfile')

  if (!storedProfile) {
    return 'All States'
  }

  try {
    const parsedProfile = JSON.parse(storedProfile)
    if (parsedProfile?.jurisdiction) {
      return parsedProfile.jurisdiction
    }
  } catch {
    return 'All States'
  }

  return 'All States'
}

const getProjectOverviewData = () => {
  const jurisdiction = resolveAdminJurisdiction()
  const statusValues = projectStatusMap[jurisdiction] || projectStatusMap['All States']

  const tasks = [
    {
      key: 'active',
      label: 'Active',
      value: statusValues.active,
      color: '#2563eb'
    },
    {
      key: 'underAcquisition',
      label: 'Under Acquisition',
      value: statusValues.underAcquisition,
      color: '#14b8a6'
    },
    {
      key: 'completed',
      label: 'Completed',
      value: statusValues.completed,
      color: '#22c55e'
    },
    {
      key: 'onHold',
      label: 'On Hold',
      value: statusValues.onHold,
      color: '#f59e0b'
    }
  ]

  const total = tasks.reduce((sum, item) => sum + item.value, 0)

  return tasks.map((item) => ({
    ...item,
    total,
    percent: total ? Math.round((item.value / total) * 100) : 0
  }))
}

const gaugeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  rotation: -90,
  circumference: 360,
  animation: {
    duration: 800,
    easing: 'easeOutCubic'
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#f8fafc',
      bodyColor: '#f8fafc',
      padding: 10,
      displayColors: false,
      callbacks: {
        label: (context) => `${context.label}: ${context.formattedValue}`
      }
    }
  },
  layout: {
    padding: 0
  }
}

const Project = () => {
  const projectStatus = useMemo(() => getProjectOverviewData(), [])
  const totalProjects = projectStatus.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="dashboard-card project-overview-panel">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Portfolio</p>
          <h2>Project Overview</h2>
        </div>
        <span className="section-badge">{totalProjects} total</span>
      </div>

      <div className="project-overview-shell">
        <div className="project-donut-shell">
          <div className="project-donut-wrap">
            <Doughnut
              data={{
                labels: projectStatus.map((item) => item.label),
                datasets: [
                  {
                    data: projectStatus.map((item) => item.value),
                    backgroundColor: projectStatus.map((item) => item.color),
                    borderWidth: 0,
                    hoverOffset: 4,
                    borderRadius: 0,
                    spacing: 0
                  }
                  
                ]
              }}
              style={{ transform: 'rotate(90deg)' }}
              options={gaugeOptions}
            />
          </div>

          <div className="project-donut-center">
            <strong>{totalProjects}</strong>
            <span>Projects</span>
          </div>
        </div>

        <div className="project-status-legend">
          {projectStatus.map((item) => (
            <div key={item.key} className="project-status-item">
              <div className="project-status-left">
                <span className="project-status-swatch" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Project