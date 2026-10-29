'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo } from 'react'
import { MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const MapContainer = dynamic(() => import('react-leaflet').then((module) => module.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((module) => module.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then((module) => module.CircleMarker), { ssr: false })
const Polygon = dynamic(() => import('react-leaflet').then((module) => module.Polygon), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then((module) => module.Polyline), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((module) => module.Popup), { ssr: false })

const INDIA_CENTER = [22.9734, 78.6569]
const LINEAR_TYPES = ['Highway', 'Railway', 'Metro', 'Road']

const coordinatesFor = (project) => {
	const latitude = Number(project.coordinates?.latitude)
	const longitude = Number(project.coordinates?.longitude)
	return Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : null
}

const geometryFor = (project) => {
	const point = coordinatesFor(project)
	if (!point) return null
	if (LINEAR_TYPES.includes(project.type)) {
		return {
			point,
			route: [
				[point[0] - 0.12, point[1] - 0.18],
				[point[0] - 0.04, point[1] - 0.02],
				[point[0] + 0.06, point[1] + 0.16],
				[point[0] + 0.14, point[1] + 0.28],
			],
			polygon: null,
		}
	}
	const delta = 0.12
	return {
		point,
		route: null,
		polygon: [[point[0] + delta, point[1] - delta], [point[0] + delta, point[1] + delta], [point[0] - delta, point[1] + delta], [point[0] - delta, point[1] - delta]],
	}
}

function MapViewport({ projects }) {
	const { useMap } = require('react-leaflet')
	const map = useMap()

	useEffect(() => {
		const points = projects.flatMap((project) => {
			const geometry = geometryFor(project)
			return geometry ? geometry.route || geometry.polygon || [geometry.point] : []
		})
		if (points.length > 1) map.fitBounds(points, { padding: [24, 24], maxZoom: 7 })
		if (points.length === 1) map.setView(points[0], 8)
	}, [map, projects])

	return null
}

export default function GISCoverageMap({ jurisdictions, projects }) {
	const mappedProjects = useMemo(() => projects.map((project) => ({ ...project, geometry: geometryFor(project) })).filter((project) => project.geometry), [projects])
	const mappedJurisdictions = useMemo(() => jurisdictions.map((item, index) => {
		const related = mappedProjects.filter((project) => project.state === item.state && (!item.district || project.district === item.district) && (!item.village || project.village === item.village))
		if (!related.length) return null
		const latitude = related.reduce((sum, project) => sum + project.geometry.point[0], 0) / related.length
		const longitude = related.reduce((sum, project) => sum + project.geometry.point[1], 0) / related.length
		return { ...item, point: [latitude + (index % 3) * 0.025, longitude + (index % 2) * 0.025], relatedCount: related.length }
	}).filter(Boolean), [jurisdictions, mappedProjects])

	return <div className="relative h-72 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-80">
		{mappedProjects.length ? <MapContainer center={INDIA_CENTER} zoom={5} scrollWheelZoom className="h-full w-full" zoomControl attributionControl>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
			<MapViewport projects={mappedProjects} />
			{mappedProjects.map((project) => <div key={`geometry-${project.id}`}>
				{project.geometry.polygon ? <Polygon positions={project.geometry.polygon} pathOptions={{ color: '#10b981', fillColor: '#34d399', fillOpacity: 0.16, weight: 2 }} /> : null}
				{project.geometry.route ? <Polyline positions={project.geometry.route} pathOptions={{ color: '#0284c7', weight: 4, opacity: 0.72 }} /> : null}
				<CircleMarker center={project.geometry.point} radius={7} pathOptions={{ color: '#ffffff', weight: 2, fillColor: project.riskCategory === 'Critical' || project.riskCategory === 'High' ? '#ef4444' : '#059669', fillOpacity: 1 }}>
					<Popup><strong>{project.name}</strong><br />{project.type} · {project.state}<br />GIS project location</Popup>
				</CircleMarker>
			</div>)}
			{mappedJurisdictions.map((item) => <CircleMarker key={item.id} center={item.point} radius={5} pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#7c3aed', fillOpacity: 0.95 }}><Popup><strong>{item.name}</strong><br />{item.type} · {item.relatedCount} project{item.relatedCount === 1 ? '' : 's'} covered</Popup></CircleMarker>)}
		</MapContainer> : <div className="flex h-full items-center justify-center p-6 text-center"><div><MapPin className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-2 text-sm font-semibold text-slate-700">No project coordinates in this scope</p><p className="mt-1 text-xs text-slate-500">Add coordinates to a project to display it on the GIS map.</p></div></div>}
		<div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />Project area</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-violet-600" />Jurisdiction</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-600" />Linear project</span></div>
	</div>
}
