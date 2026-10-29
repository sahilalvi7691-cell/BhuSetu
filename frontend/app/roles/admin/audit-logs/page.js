'use client'

import { useEffect, useMemo, useState } from 'react'
import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	Download,
	Eye,
	FileClock,
	Filter,
	Search,
	ShieldCheck,
	X
} from 'lucide-react'
import { Header } from '../../../component/layout/index'
import { PROJECTS } from '../../project-officer/my-project/projects-data'
import { readProjectAssignments } from '../../../lib/assignmentStore'
import { buildAuditLogs, readAuditLogs } from '../../../lib/auditLogStore'

const ADMIN_ROLES = ['Admin', 'System Admin']
const PAGE_SIZE = 8
const filterOptions = {
	role: ['All', 'Admin', 'System Admin', 'Project Officer', 'Land Acquisition Officer', 'Nodal Officer', 'System'],
	module: ['All', 'Users', 'Assignments', 'Jurisdiction', 'Projects', 'GIS', 'Configuration', 'Security', 'Login activity'],
	status: ['All', 'Success', 'Failed', 'Pending']
}

const formatDateTime = (value) => {
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? 'Unknown time' : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const dateOnly = (value) => value ? new Date(`${value}T00:00:00`) : null

const statusTone = {
	Success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
	Failed: 'bg-rose-50 text-rose-700 ring-rose-200',
	Pending: 'bg-amber-50 text-amber-700 ring-amber-200'
}

function StatusBadge({ status }) {
	return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${statusTone[status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{status}</span>
}

function SelectFilter({ label, value, options, onChange }) {
	return <label className="min-w-[150px] flex-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100">{options.map((option) => <option key={option} value={option}>{option === 'All' ? `All ${label}s` : option}</option>)}</select></label>
}

function DetailField({ label, value }) {
	return <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{value || 'Not available'}</p></div>
}

export default function AuditLogsPage() {
	const [logs, setLogs] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [accessDenied, setAccessDenied] = useState(false)
	const [query, setQuery] = useState('')
	const [filters, setFilters] = useState({ role: 'All', module: 'All', status: 'All', from: '', to: '' })
	const [page, setPage] = useState(1)
	const [selectedLog, setSelectedLog] = useState(null)
	const [exportPending, setExportPending] = useState(false)
	const [exported, setExported] = useState(false)

	useEffect(() => {
		const load = async () => {
			try {
				const profileText = window.localStorage.getItem('adminProfile') || window.localStorage.getItem('currentProfile')
				if (profileText) {
					const profile = JSON.parse(profileText)
					if (profile.role && !ADMIN_ROLES.includes(profile.role)) setAccessDenied(true)
				}
				const savedUsers = window.localStorage.getItem('BhuSetuUsersData')
				const response = savedUsers ? null : await fetch('/data/users.json')
				if (response && !response.ok) throw new Error('Unable to load user activity records.')
				const users = savedUsers ? JSON.parse(savedUsers) : await response.json()
				const derived = buildAuditLogs({ users, projects: PROJECTS, assignments: readProjectAssignments() })
				const persisted = readAuditLogs()
				setLogs([...persisted, ...derived].reduce((unique, log) => unique.some((item) => item.id === log.id) ? unique : [...unique, log], []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
			} catch (loadError) {
				setError(loadError.message || 'Unable to load audit records.')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	const filteredLogs = useMemo(() => {
		const search = query.trim().toLowerCase()
		const from = dateOnly(filters.from)
		const to = dateOnly(filters.to)
		if (to) to.setHours(23, 59, 59, 999)
		return logs.filter((log) => {
			const haystack = `${log.user} ${log.role} ${log.action} ${log.module} ${log.target}`.toLowerCase()
			const timestamp = new Date(log.timestamp)
			return (!search || haystack.includes(search)) &&
				(filters.role === 'All' || log.role === filters.role) &&
				(filters.module === 'All' || log.module === filters.module) &&
				(filters.status === 'All' || log.status === filters.status) &&
				(!from || timestamp >= from) && (!to || timestamp <= to)
		})
	}, [filters, logs, query])

	const pageCount = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
	const visibleLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
	const setFilter = (key, value) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1) }

	const exportCsv = () => {
		const header = ['Date/Time', 'User', 'Role', 'Action', 'Module', 'Target', 'Status']
		const rows = filteredLogs.map((log) => [formatDateTime(log.timestamp), log.user, log.role, log.action, log.module, log.target, log.status])
		const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
		const link = document.createElement('a')
		link.href = url
		link.download = `bhusetu-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
		link.click()
		URL.revokeObjectURL(url)
		setExportPending(false)
		setExported(true)
		window.setTimeout(() => setExported(false), 2400)
	}

	if (loading) return <><Header title="Audit Logs" /><main className="min-h-screen bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">Loading audit records...</main></>
	if (accessDenied) return <><Header title="Audit Logs" /><main className="min-h-screen bg-slate-50 px-4 py-12"><div className="mx-auto max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm"><ShieldCheck className="mx-auto h-10 w-10 text-rose-500" /><h1 className="mt-3 text-xl font-bold text-slate-900">Access restricted</h1><p className="mt-2 text-sm text-slate-600">Audit records are available to authorized administrators only.</p></div></main></>

	return <>
		<Header title="Audit Logs" />
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.1),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<section className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)]"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600">Admin accountability</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Audit logs</h1><p className="mt-2 text-sm text-slate-500">A read-only record of activity across the BhuSetu administration surface.</p></div><button type="button" onClick={() => setExportPending(true)} disabled={!filteredLogs.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"><Download className="h-4 w-4" />Export CSV</button></div></section>
				{error && <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="h-4 w-4" />{error}</div>}
				{exported && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">Audit export downloaded successfully.</div>}
				<section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3"><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search user, action, module, or target" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" /></label><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"><Filter className="h-4 w-4" />Refine records</div><div className="flex flex-wrap gap-3"><SelectFilter label="User role" value={filters.role} options={filterOptions.role} onChange={(value) => setFilter('role', value)} /><SelectFilter label="Module" value={filters.module} options={filterOptions.module} onChange={(value) => setFilter('module', value)} /><SelectFilter label="Status" value={filters.status} options={filterOptions.status} onChange={(value) => setFilter('status', value)} /><label className="min-w-[145px] flex-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><span>From date</span><input type="date" value={filters.from} onChange={(event) => setFilter('from', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-sky-400" /></label><label className="min-w-[145px] flex-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><span>To date</span><input type="date" value={filters.to} onChange={(event) => setFilter('to', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-sky-400" /></label></div></div></section>
				<section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">Activity register</h2><p className="mt-1 text-xs text-slate-500">{filteredLogs.length} matching record{filteredLogs.length === 1 ? '' : 's'} · read-only</p></div><FileClock className="h-5 w-5 text-sky-600" /></div>{visibleLogs.length === 0 ? <div className="px-6 py-16 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-800">No audit records found</h3><p className="mt-1 text-sm text-slate-500">Try clearing a filter or changing the date range.</p></div> : <div className="overflow-x-auto"><table className="min-w-[1050px] w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[0.14em] text-slate-500"><tr>{['Date / Time', 'User', 'Role', 'Action', 'Module', 'Target', 'Status', 'View'].map((heading) => <th key={heading} className="px-5 py-3 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visibleLogs.map((log) => <tr key={log.id} className="hover:bg-sky-50/30"><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">{formatDateTime(log.timestamp)}</td><td className="px-5 py-4 font-semibold text-slate-900">{log.user}</td><td className="px-5 py-4 text-xs text-slate-600">{log.role}</td><td className="max-w-[190px] truncate px-5 py-4 text-slate-700">{log.action}</td><td className="px-5 py-4 text-slate-600">{log.module}</td><td className="max-w-[210px] truncate px-5 py-4 text-xs text-slate-600">{log.target}</td><td className="px-5 py-4"><StatusBadge status={log.status} /></td><td className="px-5 py-4"><button type="button" onClick={() => setSelectedLog(log)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50"><Eye className="h-4 w-4" />View</button></td></tr>)}</tbody></table></div>}<div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><span>Page {page} of {pageCount}</span><div className="flex gap-1"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-30" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-30" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div></div></section>
			</div>
		</main>
		{selectedLog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-100 p-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-600">Audit record</p><h2 className="mt-1 text-xl font-bold text-slate-900">{selectedLog.action}</h2><p className="mt-1 font-mono text-xs text-slate-500">{selectedLog.id}</p></div><button type="button" onClick={() => setSelectedLog(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close details"><X className="h-5 w-5" /></button></div><div className="grid gap-5 p-5 sm:grid-cols-2"><DetailField label="User" value={selectedLog.user} /><DetailField label="Role" value={selectedLog.role} /><DetailField label="Timestamp" value={formatDateTime(selectedLog.timestamp)} /><DetailField label="Module" value={selectedLog.module} /><DetailField label="Target" value={selectedLog.target} /><DetailField label="Status" value={<StatusBadge status={selectedLog.status} />} /><DetailField label="Previous value" value={selectedLog.previousValue} /><DetailField label="New value" value={selectedLog.newValue} /><DetailField label="Remarks" value={selectedLog.remarks} /><DetailField label="Device" value={selectedLog.device} /><DetailField label="IP address" value={selectedLog.ip} /></div><div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-right"><button type="button" onClick={() => setSelectedLog(null)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Close</button></div></div></div>}
		{exportPending && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"><Download className="mx-auto h-9 w-9 text-sky-600" /><h2 className="mt-3 font-bold text-slate-900">Export filtered records?</h2><p className="mt-2 text-sm text-slate-500">This downloads {filteredLogs.length} read-only records as a CSV file.</p><div className="mt-6 flex justify-center gap-2"><button type="button" onClick={() => setExportPending(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="button" onClick={exportCsv} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Export</button></div></div></div>}
	</>
}
