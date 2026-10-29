'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, Polygon, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Card from '../../../component/common/Card'
import { PROJECTS, districtOptions, projectTypeOptions, riskOptions, statusOptions } from '../../project-officer/my-project/projects-data'

const riskColor = (risk) => {
  switch (risk) {
    case 'Critical':
      return '#dc2626'
    case 'High':
      return '#ef4444'
    case 'Medium':
      return '#f59e0b'
    case 'Low':
      return '#10b981'
    default:
      return '#64748b'
  }
}

const getStatusProgress = (status) => {
  switch (status) {
    case 'Completed':
      return 100
    case 'Under Acquisition':
      return 68
    case 'Pending LAO Verification':
      return 41
    case 'On Hold':
      return 33
    case 'Draft':
      return 18
    default:
      return 0
  }
}

const isLinearProject = (type) => ['Highway', 'Railway', 'Metro', 'Road'].includes(type)

const buildGeometry = (project) => {
  const lat = Number(project.coordinates?.latitude ?? 20.5937)
  const lng = Number(project.coordinates?.longitude ?? 78.9629)

  if (isLinearProject(project.type)) {
    return {
      route: [
        [lat - 0.12, lng - 0.18],
        [lat - 0.04, lng - 0.02],
        [lat + 0.06, lng + 0.16],
        [lat + 0.14, lng + 0.28],
      ],
      polygon: null,
    }
  }

  const delta = 0.12
  return {
    route: null,
    polygon: [
      [lat + delta, lng - delta],
      [lat + delta, lng + delta],
      [lat - delta, lng + delta],
      [lat - delta, lng - delta],
    ],
  }
}

const buildParcelData = (project) => {
  const baseLat = Number(project.coordinates?.latitude ?? 20.5937)
  const baseLng = Number(project.coordinates?.longitude ?? 78.9629)
  const candidate = [
    [baseLat + 0.10, baseLng - 0.12],
    [baseLat + 0.12, baseLng + 0.04],
    [baseLat + 0.08, baseLng + 0.14],
    [baseLat + 0.02, baseLng + 0.10],
  ]

  const verified = [
    [baseLat - 0.04, baseLng - 0.05],
    [baseLat + 0.02, baseLng - 0.02],
    [baseLat + 0.03, baseLng + 0.09],
    [baseLat - 0.02, baseLng + 0.06],
  ]

  return {
    available: project.id % 2 === 0 || project.id === 1 || project.id === 8,
    candidate,
    verified,
  }
}

function MapBoundsController({ projects }) {
  const map = useMap()

  useEffect(() => {
    if (!projects.length) return

    const points = projects.flatMap((project) => {
      const geometry = buildGeometry(project)
      const coords = []

      if (geometry.route) coords.push(...geometry.route)
      if (geometry.polygon) coords.push(...geometry.polygon)
      coords.push([project.coordinates.latitude, project.coordinates.longitude])
      return coords
    })

    if (points.length) {
      map.fitBounds(points, { padding: [28, 28], maxZoom: 7 })
    }
  }, [projects, map])

  return null
}

export default function GisClient() {
  const [query, setQuery] = useState('')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [riskFilter, setRiskFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showMarkers, setShowMarkers] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showRiskZones, setShowRiskZones] = useState(true)
  const [showParcels, setShowParcels] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECTS[0]?.id ?? null)

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((project) => {
      const matchesQuery = `${project.projectId} ${project.name} ${project.village} ${project.district}`
        .toLowerCase()
        .includes(query.toLowerCase())

      const matchesDistrict = districtFilter === 'All' || project.district === districtFilter
      const matchesType = typeFilter === 'All' || project.type === typeFilter
      const matchesRisk = riskFilter === 'All' || project.riskCategory === riskFilter
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter

      return matchesQuery && matchesDistrict && matchesType && matchesRisk && matchesStatus
    })
  }, [districtFilter, query, riskFilter, statusFilter, typeFilter])

  useEffect(() => {
    if (!filteredProjects.length) return

    if (!filteredProjects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(filteredProjects[0].id)
    }
  }, [filteredProjects, selectedProjectId])

  const selectedProject = filteredProjects.find((project) => project.id === selectedProjectId) ?? filteredProjects[0] ?? null

  const hasAuthorizedParcelData = useMemo(
    () => filteredProjects.some((project) => buildParcelData(project).available),
    [filteredProjects],
  )

  return (
    <Card className="w-full max-w-full  p-0">
      
      <div className="grid gap-0 ">
        <div className="h-[330px] w-full md:h-[380px]">
          {filteredProjects.length ? (
            <MapContainer
              center={[23.0225, 78.5714]}
              zoom={5}
              scrollWheelZoom
              className="relative z-0 h-full w-full"
              attributionControl={false}
              style={{ overscrollBehavior: "contain", zIndex: 1 }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapBoundsController projects={filteredProjects} />

              {filteredProjects.map((project) => {
                const geometry = buildGeometry(project)
                const parcelData = buildParcelData(project)
                const projectRisk = riskColor(project.riskCategory)

                return (
                  <React.Fragment key={project.id}>
                    {showRiskZones && (
                      <Circle
                        center={[project.coordinates.latitude, project.coordinates.longitude]}
                        radius={Math.max(18000, project.riskProbability * 800)}
                        pathOptions={{
                          color: projectRisk,
                          fillColor: projectRisk,
                          fillOpacity: 0.09,
                          weight: 1,
                        }}
                      />
                    )}

                    {geometry.polygon && showRoutes && (
                      <Polygon
                        positions={geometry.polygon}
                        pathOptions={{
                          color: projectRisk,
                          fillColor: projectRisk,
                          fillOpacity: 0.18,
                          weight: 2,
                        }}
                        eventHandlers={{
                          click: () => setSelectedProjectId(project.id),
                        }}
                      />
                    )}

                    {geometry.route && showRoutes && (
                      <Polyline
                        positions={geometry.route}
                        pathOptions={{
                          color: projectRisk,
                          weight: 4,
                          opacity: 0.8,
                        }}
                        eventHandlers={{
                          click: () => setSelectedProjectId(project.id),
                        }}
                      />
                    )}

                    {showParcels && parcelData.available && (
                      <React.Fragment>
                        <Polygon
                          positions={parcelData.candidate}
                          pathOptions={{
                            color: '#f59e0b',
                            fillColor: '#f59e0b',
                            fillOpacity: 0.12,
                            weight: 1,
                          }}
                        />
                        <Polygon
                          positions={parcelData.verified}
                          pathOptions={{
                            color: '#16a34a',
                            fillColor: '#16a34a',
                            fillOpacity: 0.14,
                            weight: 1,
                          }}
                        />
                      </React.Fragment>
                    )}

                    {showMarkers && (
                      <CircleMarker
                        center={[project.coordinates.latitude, project.coordinates.longitude]}
                        radius={7}
                        pathOptions={{
                          color: projectRisk,
                          fillColor: projectRisk,
                          fillOpacity: 0.95,
                          weight: 2,
                        }}
                        eventHandlers={{
                          click: () => setSelectedProjectId(project.id),
                        }}
                      >
                        <Popup>
                          <div className="min-w-[180px] text-sm">
                            <div className="font-semibold text-slate-800">{project.name}</div>
                            <div className="mt-1 text-xs text-slate-600">{project.projectId}</div>
                            <div className="mt-2 text-xs">
                              <span className="font-medium text-slate-600">Risk:</span>{' '}
                              <span className="font-semibold" style={{ color: projectRisk }}>
                                {project.riskCategory}
                              </span>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    )}
                  </React.Fragment>
                )
              })}
            </MapContainer>
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-50 p-6 text-sm text-slate-600">
              No projects match the selected filters.
            </div>
          )}
        </div>

        
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-3 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-800">Legend</span>
          {['Critical', 'High', 'Medium', 'Low'].map((risk) => (
            <div key={risk} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: riskColor(risk) }} />
              <span className="text-xs">{risk}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
