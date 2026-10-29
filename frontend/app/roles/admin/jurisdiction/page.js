'use client'

import { useEffect, useMemo, useState } from 'react'
import {
	AlertCircle,
	BadgeCheck,
	Building2,
	ChevronDown,
	ChevronRight,
	Eye,
	Layers3,
	LoaderCircle,
	Map,
	MapPin,
	MoreVertical,
	Pencil,
	Plus,
	Search,
	ShieldCheck,
	ToggleLeft,
	Users,
	X,
} from 'lucide-react'
import { Header } from '../../../component/layout/index'
import { PROJECTS } from '../../project-officer/my-project/projects-data'
import GISCoverageMap from './GISCoverageMap'
import {
	JURISDICTION_TYPES,
	canManageJurisdiction,
	getAdminProfile,
	hasGlobalAccess,
	normalizeUser,
	readJurisdictions,
	readOrSeedUsers,
	recordAdminActivity,
	saveJurisdictions,
	saveUsers,
} from '../../../lib/adminManagementStore'

const emptyJurisdiction = { name: '', type: 'State', parentId: '', status: 'Active', coverage: '', boundary: '' }

const statusTone = {
	Active: 'bg-emerald-50 text-emerald-700',
	Inactive: 'bg-slate-100 text-slate-600',
	Pending: 'bg-amber-50 text-amber-700',
}

function Modal({ title, onClose, children, wide = false }) {
	return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className={`max-h-[92vh] w-full overflow-y-auto rounded-3xl border border-white/70 bg-white shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-lg'}`}><header className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-base font-bold text-slate-900">{title}</h2><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X className="h-4 w-4" /></button></header>{children}</div></div>
}

function Field({ label, value, onChange, required = false, placeholder = '' }) {
	return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}{required ? ' *' : ''}</span><input required={required} value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" /></label>
}

function SelectField({ label, value, options, onChange }) {
	return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span><span className="relative block"><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></span></label>
}

function DetailCard({ icon: Icon, label, children }) {
	return <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/70 p-3"><div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><Icon className="h-3.5 w-3.5 text-emerald-600" />{label}</div><div className="mt-1.5 min-w-0 text-sm font-semibold text-slate-800">{children}</div></div>
}

export default function JurisdictionPage() {
	const [jurisdictions, setJurisdictions] = useState([])
	const [users, setUsers] = useState([])
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [query, setQuery] = useState('')
	const [filters, setFilters] = useState({ type: 'All', status: 'All' })
	const [expanded, setExpanded] = useState([])
	const [menuId, setMenuId] = useState(null)
	const [detail, setDetail] = useState(null)
	const [editor, setEditor] = useState(null)
	const [assigning, setAssigning] = useState(null)
	const [confirm, setConfirm] = useState(null)
	const [notice, setNotice] = useState('')

	useEffect(() => {
		Promise.all([Promise.resolve(readJurisdictions()), readOrSeedUsers()]).then(([nextJurisdictions, nextUsers]) => {
			setJurisdictions(nextJurisdictions)
			setUsers(nextUsers)
			setProfile(getAdminProfile())
			setExpanded(nextJurisdictions.filter((item) => item.type === 'State').map((item) => item.id))
		}).catch((loadError) => setError(loadError.message || 'Unable to load jurisdiction data.')).finally(() => setLoading(false))
	}, [])

	const globalAccess = hasGlobalAccess(profile)
	const scopeMatches = (item) => {
		if (globalAccess) return true
		const scopeValues = [profile?.district, profile?.state, profile?.jurisdiction].filter(Boolean).map((value) => String(value).toLowerCase())
		return [item.state, item.district, item.tehsil, item.village, item.name].some((value) => scopeValues.includes(String(value || '').toLowerCase()))
	}

	const isVisible = (item) => {
		if (globalAccess || scopeMatches(item)) return true
		let parent = jurisdictions.find((candidate) => candidate.id === item.parentId)
		while (parent) {
			if (scopeMatches(parent)) return true
			parent = jurisdictions.find((candidate) => candidate.id === parent.parentId)
		}
		return false
	}

	const canManage = (item) => globalAccess || canManageJurisdiction(profile, item) || (() => {
		let parent = jurisdictions.find((candidate) => candidate.id === item.parentId)
		while (parent) {
			if (canManageJurisdiction(profile, parent)) return true
			parent = jurisdictions.find((candidate) => candidate.id === parent.parentId)
		}
		return false
	})()

	const projectCounts = useMemo(() => jurisdictions.reduce((counts, item) => {
		counts[item.id] = PROJECTS.filter((project) => project.state === item.state && (!item.district || project.district === item.district) && (!item.tehsil || project.tehsil === item.tehsil) && (!item.village || project.village === item.village)).length
		return counts
	}, {}), [jurisdictions])

	const officerCounts = useMemo(() => jurisdictions.reduce((counts, item) => {
		counts[item.id] = users.filter((user) => user.status === 'Active' && user.state === item.state && (!item.district || user.district === item.district)).length
		return counts
	}, {}), [jurisdictions, users])

	const visibleItems = useMemo(() => jurisdictions.filter((item) => isVisible(item)).filter((item) => {
		const haystack = `${item.name} ${item.state} ${item.district} ${item.tehsil} ${item.village} ${item.coverage}`.toLowerCase()
		return haystack.includes(query.toLowerCase()) && (filters.type === 'All' || item.type === filters.type) && (filters.status === 'All' || item.status === filters.status)
	}), [jurisdictions, query, filters, profile])

	const childrenOf = (parentId) => visibleItems.filter((item) => item.parentId === parentId)
	const roots = visibleItems.filter((item) => !item.parentId)
	const toggleExpanded = (id) => setExpanded((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])

	const persistJurisdictions = (next, action, target) => {
		setJurisdictions(next)
		saveJurisdictions(next)
		recordAdminActivity({ action, module: 'Jurisdiction', target })
		setNotice(`${action} completed.`)
		setMenuId(null)
	}

	const saveEditor = (event) => {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		const data = Object.fromEntries(form.entries())
		const parent = jurisdictions.find((item) => item.id === data.parentId)
		if (!data.name?.trim()) return setError('Jurisdiction name is required.')
		if (editor.mode === 'create' && data.type !== 'State' && !parent) return setError('Select a valid parent jurisdiction.')
		if (editor.mode === 'edit' && !canManage(editor.item)) return setError('You cannot edit outside your authorized jurisdiction.')
		const base = editor.mode === 'edit' ? editor.item : { id: `jur-${Date.now()}`, adminIds: [] }
		const next = { ...base, ...data, parentId: data.type === 'State' ? null : data.parentId, state: data.type === 'State' ? data.name : parent?.state || base.state || '', district: data.type === 'District' ? data.name : parent?.district || base.district || '', tehsil: data.type === 'Tehsil/Block' ? data.name : parent?.tehsil || base.tehsil || '', village: data.type === 'Village' ? data.name : parent?.village || base.village || '' }
		persistJurisdictions(editor.mode === 'edit' ? jurisdictions.map((item) => item.id === base.id ? next : item) : [...jurisdictions, next], editor.mode === 'edit' ? 'Jurisdiction updated' : 'Jurisdiction created', next.name)
		setEditor(null)
		setError('')
	}

	const toggleStatus = (item) => {
		if (!canManage(item)) return setError('You cannot modify outside your authorized jurisdiction.')
		const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active'
		setConfirm({ title: `${nextStatus} jurisdiction?`, message: `Change ${item.name} to ${nextStatus}?`, onConfirm: () => { persistJurisdictions(jurisdictions.map((entry) => entry.id === item.id ? { ...entry, status: nextStatus } : entry), `Jurisdiction ${nextStatus.toLowerCase()}`, item.name); setConfirm(null) } })
	}

	const saveAssignments = (event) => {
		event.preventDefault()
		const ids = [...new FormData(event.currentTarget).entries()].filter(([key, value]) => key === 'userId' && value).map(([, value]) => value)
		const item = assigning.item
		if (!canManage(item)) return setError('You cannot assign officers outside your authorized jurisdiction.')
		const nextUsers = users.map((user) => ids.includes(user.id) ? normalizeUser({ ...user, state: item.state, district: item.district || user.district, jurisdiction: `${item.type} Level` }) : user)
		setUsers(nextUsers)
		saveUsers(nextUsers)
		persistJurisdictions(jurisdictions.map((entry) => entry.id === item.id ? { ...entry, adminIds: ids } : entry), 'Officers assigned', item.name)
		setAssigning(null)
	}

	const availableUsers = users.filter((user) => ['Project Officer', 'Land Acquisition Officer', 'Nodal Officer', 'System Admin'].includes(user.role) && user.status === 'Active' && (globalAccess || user.state === profile?.state || user.district === profile?.district))

	const renderTree = (item, depth = 0) => {
		const children = childrenOf(item.id)
		const isOpen = expanded.includes(item.id)
		return <div key={item.id}><div className="group flex items-center gap-2 border-b border-slate-100 px-4 py-3 transition hover:bg-emerald-50/40" style={{ paddingLeft: `${16 + depth * 24}px` }}><button type="button" onClick={() => toggleExpanded(item.id)} className={`flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 ${children.length ? 'hover:bg-slate-100 hover:text-slate-700' : 'invisible'}`} aria-label={isOpen ? 'Collapse' : 'Expand'}>{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><MapPin className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{item.name}</p><p className="truncate text-[11px] text-slate-500">{item.type} · {item.state || 'State not set'}</p></div><span className="hidden rounded-full bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-700 sm:inline-flex">{projectCounts[item.id] || 0} projects</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusTone[item.status] || statusTone.Pending}`}>{item.status}</span><div className="relative"><button type="button" onClick={() => setMenuId(menuId === item.id ? null : item.id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Actions for ${item.name}`}><MoreVertical className="h-4 w-4" /></button>{menuId === item.id ? <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button type="button" onClick={() => { setDetail(item); setMenuId(null) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50"><Eye className="h-3.5 w-3.5" />View details</button><button type="button" disabled={!canManage(item)} onClick={() => { setEditor({ mode: 'edit', item }); setMenuId(null) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Pencil className="h-3.5 w-3.5" />Edit jurisdiction</button><button type="button" disabled={!canManage(item)} onClick={() => { setAssigning({ item }); setMenuId(null) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Users className="h-3.5 w-3.5" />Assign officers</button><button type="button" disabled={!canManage(item)} onClick={() => { setMenuId(null); toggleStatus(item) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ToggleLeft className="h-3.5 w-3.5" />{item.status === 'Active' ? 'Deactivate' : 'Activate'}</button></div> : null}</div></div>{isOpen ? children.map((child) => renderTree(child, depth + 1)) : null}</div>
	}

	if (loading) return <><Header title="Jurisdiction" /><main className="flex min-h-[70vh] items-center justify-center bg-slate-50"><LoaderCircle className="h-7 w-7 animate-spin text-emerald-600" /></main></>
	if (error && !jurisdictions.length) return <><Header title="Jurisdiction" /><main className="min-h-[70vh] bg-slate-50 p-6"><div className="mx-auto max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm"><AlertCircle className="mx-auto h-9 w-9 text-rose-500" /><h1 className="mt-3 text-lg font-bold text-slate-900">Unable to load jurisdiction</h1><p className="mt-2 text-sm text-slate-600">{error}</p></div></main></>

	return <><Header title="Jurisdiction" /><main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef7f5_100%)] px-4 py-6 text-slate-800 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-5">
		<section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">Administrative geography</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Jurisdiction management</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Manage the State to Village hierarchy, officer coverage, and geographic boundaries within your authorized scope.</p></div><button type="button" onClick={() => setEditor({ mode: 'create', item: emptyJurisdiction })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />Add jurisdiction</button></div></section>
		{error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div> : null}{notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div> : null}
		<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{JURISDICTION_TYPES.map((type) => <div key={type} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{type}</p><p className="mt-2 text-2xl font-bold text-slate-950">{visibleItems.filter((item) => item.type === type).length}</p></div>)}</section>
		<section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search state, district, tehsil, or village" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-400" /></label><select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="All">All levels</option>{JURISDICTION_TYPES.map((type) => <option key={type}>{type}</option>)}</select><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="All">All statuses</option><option>Active</option><option>Inactive</option><option>Pending</option></select></div></section>
		<div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]"><section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">Administrative hierarchy</h2><p className="mt-1 text-xs text-slate-500">{globalAccess ? 'Super Admin scope: all jurisdictions' : `Scoped to ${profile?.district || profile?.state || profile?.jurisdiction || 'authorized coverage'}`}</p></div><Layers3 className="h-5 w-5 text-emerald-600" /></div>{roots.length ? roots.map((item) => renderTree(item)) : <div className="p-14 text-center text-sm text-slate-500">No jurisdictions match the current scope or filters.</div>}</section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Map className="h-5 w-5 text-emerald-600" /><div><h2 className="font-bold text-slate-900">GIS coverage</h2><p className="text-xs text-slate-500">Live project locations and jurisdiction coverage</p></div></div><div className="mt-5"><GISCoverageMap jurisdictions={visibleItems.filter((item) => item.boundary)} projects={PROJECTS.filter((project) => visibleItems.some((item) => item.state === project.state && (!item.district || item.district === project.district) && (!item.village || item.village === project.village)))} /></div><div className="mt-4 grid grid-cols-2 gap-3 text-center"><div><p className="text-2xl font-bold text-slate-900">{visibleItems.filter((item) => item.boundary).length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Boundaries</p></div><div><p className="text-2xl font-bold text-slate-900">{visibleItems.reduce((sum, item) => sum + (projectCounts[item.id] || 0), 0)}</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Projects covered</p></div></div></section></div>
	</div></main>
	{editor ? <Modal title={editor.mode === 'edit' ? 'Edit jurisdiction' : 'Add jurisdiction'} onClose={() => setEditor(null)}><form onSubmit={saveEditor} className="space-y-4 p-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Name" required value={editor.item.name} onChange={(value) => setEditor({ ...editor, item: { ...editor.item, name: value } })} /><SelectField label="Level" value={editor.item.type} options={JURISDICTION_TYPES} onChange={(value) => setEditor({ ...editor, item: { ...editor.item, type: value } })} /><SelectField label="Parent jurisdiction" value={editor.item.parentId || ''} options={['', ...jurisdictions.filter((item) => item.type !== 'Village').map((item) => item.id)]} onChange={(value) => setEditor({ ...editor, item: { ...editor.item, parentId: value } })} /><SelectField label="Status" value={editor.item.status} options={['Active', 'Inactive', 'Pending']} onChange={(value) => setEditor({ ...editor, item: { ...editor.item, status: value } })} /><Field label="Coverage description" value={editor.item.coverage} onChange={(value) => setEditor({ ...editor, item: { ...editor.item, coverage: value } })} placeholder="e.g. South district administrative coverage" /><Field label="GIS boundary" value={editor.item.boundary} onChange={(value) => setEditor({ ...editor, item: { ...editor.item, boundary: value } })} placeholder="Boundary reference or GeoJSON ID" /></div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setEditor(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Save jurisdiction</button></div></form></Modal> : null}
	{assigning ? <Modal title={`Assign officers · ${assigning.item.name}`} onClose={() => setAssigning(null)}><form onSubmit={saveAssignments} className="p-5"><p className="mb-4 text-sm text-slate-500">Select active officers who should inherit this jurisdiction’s state and district coverage.</p><div className="max-h-72 space-y-2 overflow-y-auto">{availableUsers.length ? availableUsers.map((user) => <label key={user.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"><input type="checkbox" name="userId" value={user.id} defaultChecked={assigning.item.adminIds?.includes(user.id)} className="h-4 w-4 accent-emerald-600" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{user.name}</span><span className="text-xs text-slate-500">{user.role} · {user.district || 'Unassigned'}</span></span></label>) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No active officers are available in this scope.</p>}</div><div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setAssigning(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Save assignments</button></div></form></Modal> : null}
	{detail ? <Modal title="Jurisdiction details" onClose={() => setDetail(null)} wide><div className="space-y-5 p-5"><div className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Coverage profile</p><h3 className="mt-1 text-xl font-bold text-slate-950">{detail.name}</h3></div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-700">{detail.type}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[detail.status]}`}>{detail.status}</span></div></div><div className="grid gap-3 sm:grid-cols-2"><DetailCard icon={Layers3} label="Hierarchy">{[detail.state, detail.district, detail.tehsil, detail.village].filter(Boolean).join(' · ')}</DetailCard><DetailCard icon={Users} label="Active officers">{officerCounts[detail.id] || 0}</DetailCard><DetailCard icon={Building2} label="Projects covered">{projectCounts[detail.id] || 0}</DetailCard><DetailCard icon={MapPin} label="Parent unit">{jurisdictions.find((item) => item.id === detail.parentId)?.name || 'Top-level unit'}</DetailCard></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">GIS coverage</p><p className="mt-1 text-sm font-semibold text-slate-800">{detail.coverage || 'Coverage description not recorded.'}</p><p className="mt-2 break-words font-mono text-xs text-slate-500">{detail.boundary || 'No boundary reference recorded.'}</p></div><div className="flex justify-end"><button type="button" onClick={() => setDetail(null)} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Close</button></div></div></Modal> : null}
	{confirm ? <Modal title={confirm.title} onClose={() => setConfirm(null)}><div className="p-5"><p className="text-sm text-slate-600">{confirm.message}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setConfirm(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="button" onClick={confirm.onConfirm} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Confirm</button></div></div></Modal> : null}
	</>
}
