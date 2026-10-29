'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
	AlertCircle,
	CheckCircle2,
	ChevronDown,
	Crosshair,
	Expand,
	FolderKanban,
	Layers3,
	Loader2,
	MapPinned,
	Minus,
	Plus,
	Search,
	X,
} from 'lucide-react'
import { Header } from '../../../component/layout/index'
import { PROJECTS } from '../../project-officer/my-project/projects-data'
import { applyProjectAssignments, readProjectAssignments } from '../../../lib/assignmentStore'
import 'leaflet/dist/leaflet.css'

const MapContainer = dynamic(() => import('react-leaflet').then((module) => module.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((module) => module.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then((module) => module.CircleMarker), { ssr: false })
const Polygon = dynamic(() => import('react-leaflet').then((module) => module.Polygon), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then((module) => module.Polyline), { ssr: false })

const USERS_KEY = 'BhuSetuUsersData'
const ADMIN_ROLES = ['System Admin', 'Admin']
const ALL = 'All'

const geometryFor = (project) => {
	const latitude = Number(project.coordinates?.latitude)
	const longitude = Number(project.coordinates?.longitude)
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

	if (['Highway', 'Railway', 'Metro', 'Road'].includes(project.type)) {
		return {
			point: [latitude, longitude],
			route: [[latitude - 0.12, longitude - 0.18], [latitude - 0.04, longitude - 0.02], [latitude + 0.06, longitude + 0.16], [latitude + 0.14, longitude + 0.28]],
			boundary: null,
		}
	}

	const delta = 0.12
	return {
		point: [latitude, longitude],
		route: null,
		boundary: [[latitude + delta, longitude - delta], [latitude + delta, longitude + delta], [latitude - delta, longitude + delta], [latitude - delta, longitude - delta]],
	}
}

const gisStatusFor = (project) => project.gisStatus || (project.id % 3 === 0 ? 'Not Available' : project.id % 2 === 0 ? 'Partial' : 'Available')

const statusTone = {
	Available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
	Partial: 'bg-amber-50 text-amber-700 ring-amber-200',
	'Not Available': 'bg-rose-50 text-rose-700 ring-rose-200',
}

function Badge({ children, tone = 'bg-slate-100 text-slate-600 ring-slate-200' }) {
	return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ring-1 ${tone}`}>{children}</span>
}

function MapController({ mapRef, projects }) {
	const { useMap } = require('react-leaflet')
	const map = useMap()

	useEffect(() => {
		mapRef.current = map
	}, [map, mapRef])

	useEffect(() => {
		const points = projects.flatMap((project) => {
			const geometry = geometryFor(project)
			if (!geometry) return []
			return geometry.route || geometry.boundary || [geometry.point]
		})
		if (points.length) map.fitBounds(points, { padding: [30, 30], maxZoom: 7 })
	}, [map, projects])

	return null
}

function DetailField({ label, value }) {
	return <div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value || 'Not available'}</p></div>
}

export default function GisOverviewPage() {
	const mapRef = useRef(null)
	const [projects, setProjects] = useState([])
	const [users, setUsers] = useState([])
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [accessDenied, setAccessDenied] = useState(false)
	const [filters, setFilters] = useState({ district: ALL, tehsil: ALL, type: ALL, status: ALL, gisStatus: ALL })
	const [query, setQuery] = useState('')
	const [selectedId, setSelectedId] = useState(null)
	const [showLayers, setShowLayers] = useState(true)
	const [layers, setLayers] = useState({ markers: true, routes: true, boundaries: true })

	useEffect(() => {
		const load = async () => {
			try {
				const storedProfile = window.localStorage.getItem('adminProfile') || window.localStorage.getItem('currentProfile') || window.localStorage.getItem('selectedProfile')
				let resolvedProfile = storedProfile ? JSON.parse(storedProfile) : null
				if (!resolvedProfile) {
					const profileResponse = await fetch('/data/profiles.json')
					if (!profileResponse.ok) throw new Error('Unable to load administrator profile.')
					resolvedProfile = (await profileResponse.json()).system_admin
				}
				if (!ADMIN_ROLES.includes(resolvedProfile?.role)) {
					setAccessDenied(true)
					return
				}

				const storedUsers = window.localStorage.getItem(USERS_KEY)
				const userResponse = storedUsers ? null : await fetch('/data/users.json')
				if (userResponse && !userResponse.ok) throw new Error('Unable to load officer records.')
				const loadedUsers = storedUsers ? JSON.parse(storedUsers) : await userResponse.json()
				const assignments = readProjectAssignments()
				const scopedProjects = applyProjectAssignments(PROJECTS, assignments).filter((project) => {
					const stateMatches = !resolvedProfile.state || resolvedProfile.jurisdiction === 'All States' || project.state === resolvedProfile.state
					const districtMatches = !resolvedProfile.district || resolvedProfile.jurisdiction === 'All States' || resolvedProfile.jurisdiction === 'State Level' || project.district === resolvedProfile.district
					return stateMatches && districtMatches
				})

				setProfile(resolvedProfile)
				setUsers(loadedUsers)
				setProjects(scopedProjects)
				setSelectedId(scopedProjects[0]?.id ?? null)
			} catch (loadError) {
				setError(loadError.message || 'Unable to load GIS records.')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	const userName = (id) => users.find((user) => user.id === id || user.employeeId === id)?.name || 'Unassigned'
	const enrichedProjects = useMemo(() => projects.map((project) => ({ ...project, gisStatus: gisStatusFor(project), tehsil: project.tehsil || project.village || 'Not specified', geometry: geometryFor(project) })), [projects])
	const districts = useMemo(() => [...new Set(enrichedProjects.map((project) => project.district))], [enrichedProjects])
	const tehsils = useMemo(() => [...new Set(enrichedProjects.map((project) => project.tehsil))], [enrichedProjects])
	const filteredProjects = useMemo(() => enrichedProjects.filter((project) => {
		const searchable = `${project.name} ${project.projectId} ${project.district} ${project.tehsil}`.toLowerCase()
		return (!query || searchable.includes(query.toLowerCase())) &&
			(filters.district === ALL || project.district === filters.district) &&
			(filters.tehsil === ALL || project.tehsil === filters.tehsil) &&
			(filters.type === ALL || project.type === filters.type) &&
			(filters.status === ALL || project.status === filters.status) &&
			(filters.gisStatus === ALL || project.gisStatus === filters.gisStatus)
	}), [enrichedProjects, filters, query])
	const selectedProject = filteredProjects.find((project) => project.id === selectedId) || filteredProjects[0] || null
	const projectTypes = [...new Set(enrichedProjects.map((project) => project.type))]
	const projectStatuses = [...new Set(enrichedProjects.map((project) => project.status))]
	const kpis = { total: enrichedProjects.length, available: enrichedProjects.filter((project) => project.gisStatus === 'Available').length, missing: enrichedProjects.filter((project) => project.gisStatus !== 'Available').length, districts: districts.length }

	const resetMap = () => {
		if (!mapRef.current || !filteredProjects.length) return
		const points = filteredProjects.flatMap((project) => project.geometry?.route || project.geometry?.boundary || [project.geometry?.point])
		mapRef.current.fitBounds(points, { padding: [30, 30], maxZoom: 7 })
	}

	if (loading) return <><Header title="GIS Overview" /><main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading jurisdiction GIS data...</main></>
	if (accessDenied) return <><Header title="GIS Overview" /><main className="min-h-screen bg-slate-50 px-4 py-12"><div className="mx-auto max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm"><AlertCircle className="mx-auto h-9 w-9 text-rose-500" /><h1 className="mt-3 text-xl font-bold text-slate-900">Access restricted</h1><p className="mt-2 text-sm text-slate-600">This geographic overview is available to authorized administrators only.</p></div></main></>

	return <>
		<Header title="GIS Overview" />
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.1),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<section className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] sm:p-7"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">Administrative geographic overview</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Project GIS coverage</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">{profile?.jurisdiction === 'All States' ? 'All-state administrative view' : `${profile?.state || 'Assigned'} jurisdiction view`} · project geometry and GIS readiness only.</p></div><Badge tone="bg-emerald-50 text-emerald-700 ring-emerald-200"><CheckCircle2 className="mr-1 h-3 w-3" /> RBAC scoped</Badge></div></section>
				{error && <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="h-4 w-4" />{error}</div>}
				<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Total Projects', kpis.total, FolderKanban, 'bg-sky-50 text-sky-700'], ['GIS Available', kpis.available, CheckCircle2, 'bg-emerald-50 text-emerald-700'], ['GIS Missing / Partial', kpis.missing, AlertCircle, 'bg-amber-50 text-amber-700'], ['Districts Covered', kpis.districts, MapPinned, 'bg-violet-50 text-violet-700']].map(([label, value, Icon, tone]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold text-slate-900">{value}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span></div></div>)}</section>
				<section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 xl:flex-row xl:items-center"><label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search project, ID, district or tehsil" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" /></label>{[['district', 'District', districts], ['tehsil', 'Tehsil', tehsils], ['type', 'Project Type', projectTypes], ['status', 'Project Status', projectStatuses], ['gisStatus', 'GIS Status', ['Available', 'Partial', 'Not Available']]].map(([key, label, options]) => <select key={key} value={filters[key]} onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400" aria-label={label}><option value={ALL}>All {label}s</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>)}</div></section>
				<section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
					<div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3"><div><h2 className="font-bold text-slate-900">Jurisdiction map</h2><p className="mt-1 text-xs text-slate-500">{filteredProjects.length} projects in the current view</p></div><div className="flex items-center gap-1"><button type="button" onClick={() => mapRef.current?.zoomIn()} aria-label="Zoom in" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Plus className="h-4 w-4" /></button><button type="button" onClick={() => mapRef.current?.zoomOut()} aria-label="Zoom out" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Minus className="h-4 w-4" /></button><button type="button" onClick={resetMap} aria-label="Reset map view" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Crosshair className="h-4 w-4" /></button><button type="button" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Fullscreen map" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Expand className="h-4 w-4" /></button><div className="relative"><button type="button" onClick={() => setShowLayers((value) => !value)} aria-label="Map layers" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Layers3 className="h-4 w-4" /></button>{showLayers && <div className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xl">{Object.entries(layers).map(([key, value]) => <label key={key} className="flex items-center gap-2 py-1.5 capitalize"><input type="checkbox" checked={value} onChange={() => setLayers((current) => ({ ...current, [key]: !current[key] }))} />{key}</label>)}</div>}</div></div></div><div className="h-[520px] w-full bg-slate-100">{filteredProjects.length ? <MapContainer center={[23, 78]} zoom={5} scrollWheelZoom className="h-full w-full" attributionControl={false}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapController mapRef={mapRef} projects={filteredProjects} />{filteredProjects.map((project) => project.geometry && <div key={project.id}>{layers.boundaries && project.geometry.boundary && <Polygon positions={project.geometry.boundary} pathOptions={{ color: '#0f766e', fillColor: '#14b8a6', fillOpacity: 0.14, weight: 2 }} eventHandlers={{ click: () => setSelectedId(project.id) }} />}{layers.routes && project.geometry.route && <Polyline positions={project.geometry.route} pathOptions={{ color: '#0f766e', weight: 4, opacity: 0.8 }} eventHandlers={{ click: () => setSelectedId(project.id) }} />}{layers.markers && <CircleMarker center={project.geometry.point} radius={selectedProject?.id === project.id ? 10 : 7} pathOptions={{ color: '#ffffff', weight: 2, fillColor: project.gisStatus === 'Available' ? '#10b981' : project.gisStatus === 'Partial' ? '#f59e0b' : '#ef4444', fillOpacity: 1 }} eventHandlers={{ click: () => setSelectedId(project.id) }} />}</div>)}</MapContainer> : <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-500">No project geometry is available for the current filters and jurisdiction.</div>}</div><div className="flex flex-wrap gap-4 border-t border-slate-100 px-4 py-3 text-xs text-slate-500"><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />Available</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />Partial</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />Not Available</span><span className="ml-auto">Boundary and route layers are project-derived</span></div></div>
					<aside className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">{selectedProject ? <><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">Selected project</p><h2 className="mt-2 text-xl font-bold text-slate-900">{selectedProject.name}</h2><p className="mt-1 font-mono text-xs text-slate-500">{selectedProject.projectId}</p></div><button type="button" onClick={() => setSelectedId(null)} aria-label="Clear selected project" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5"><DetailField label="Type" value={selectedProject.type} /><DetailField label="GIS status" value={<Badge tone={statusTone[selectedProject.gisStatus]}>{selectedProject.gisStatus}</Badge>} /><DetailField label="District" value={selectedProject.district} /><DetailField label="Tehsil" value={selectedProject.tehsil} /><DetailField label="Location" value={`${selectedProject.coordinates.latitude}, ${selectedProject.coordinates.longitude}`} /><DetailField label="Boundary / route" value={selectedProject.geometry?.route ? 'Route available' : selectedProject.geometry?.boundary ? 'Boundary available' : 'Not available'} /><DetailField label="Required land area" value={`${selectedProject.requiredLandArea} ${selectedProject.landUnit}`} /><DetailField label="Project status" value={selectedProject.status} /><DetailField label="Project Officer" value={userName(selectedProject.assignment?.poId)} /><DetailField label="LAO" value={userName(selectedProject.assignment?.laoId)} /><DetailField label="Nodal Officer" value={userName(selectedProject.assignment?.nodalId)} /></div><div className="mt-6 flex gap-2"><Link href={`/roles/project-officer/my-project/${selectedProject.id}`} className="flex-1 rounded-xl bg-slate-900 px-3 py-2.5 text-center text-xs font-bold text-white hover:bg-slate-800">Open PO project</Link><Link href={`/roles/nodal-officer/projects/${selectedProject.id}`} className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50">Open nodal view</Link></div></> : <div className="flex min-h-[380px] flex-col items-center justify-center text-center"><MapPinned className="h-10 w-10 text-slate-300" /><h2 className="mt-4 font-bold text-slate-800">Select a project</h2><p className="mt-1 max-w-xs text-sm text-slate-500">Choose a marker or adjust the filters to inspect administrative GIS details.</p></div>}</aside>
				</section>
				<section className="rounded-[26px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">Project coverage register</h2><p className="mt-1 text-xs text-slate-500">{filteredProjects.length} of {enrichedProjects.length} jurisdiction-scoped projects</p></div><ChevronDown className="h-4 w-4 text-slate-400" /></div>{filteredProjects.length ? <div className="overflow-x-auto"><table className="min-w-[780px] w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[0.14em] text-slate-500"><tr>{['Project', 'District / Tehsil', 'Type', 'Status', 'GIS', 'Action'].map((heading) => <th key={heading} className="px-5 py-3 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filteredProjects.map((project) => <tr key={project.id} className={`cursor-pointer hover:bg-emerald-50/40 ${selectedProject?.id === project.id ? 'bg-emerald-50/60' : ''}`} onClick={() => setSelectedId(project.id)}><td className="px-5 py-4"><p className="font-semibold text-slate-900">{project.name}</p><p className="mt-1 font-mono text-xs text-slate-500">{project.projectId}</p></td><td className="px-5 py-4 text-slate-600">{project.district} · {project.tehsil}</td><td className="px-5 py-4 text-slate-600">{project.type}</td><td className="px-5 py-4"><Badge>{project.status}</Badge></td><td className="px-5 py-4"><Badge tone={statusTone[project.gisStatus]}>{project.gisStatus}</Badge></td><td className="px-5 py-4"><button type="button" className="text-xs font-bold text-emerald-700 hover:underline">View details</button></td></tr>)}</tbody></table></div> : <div className="px-6 py-16 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-800">No projects in this view</h3><p className="mt-1 text-sm text-slate-500">Clear a filter or verify the administrator jurisdiction.</p></div>}</section>
			</div>
		</main>
	</>
}
