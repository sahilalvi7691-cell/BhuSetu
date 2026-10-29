'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  Filter,
  FolderKanban,
  History,
  MapPinned,
  MoreVertical,
  Search,
  Users,
  X
} from 'lucide-react'
import { Header } from '../../../component/layout/index'
import { PROJECTS } from '../../project-officer/my-project/projects-data'
import { applyProjectAssignments, readProjectAssignments, saveProjectAssignments } from '../../../lib/assignmentStore'

const USERS_KEY = 'BhuSetuUsersData'
const ADMIN_ROLES = ['System Admin', 'Admin']

const readStoredUsers = () => {
  if (typeof window === 'undefined') return []
  try {
    const stored = window.localStorage.getItem(USERS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const normalizeUser = (user) => ({
  ...user,
  id: user.id || user.employeeId,
  role: user.role || 'Project Officer',
  status: user.status || 'Active',
  assignedProjects: Array.isArray(user.assignedProjects) ? user.assignedProjects : []
})

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
  : 'Not assigned'

const assignmentStatus = (assignment) => {
  if (!assignment?.nodalId && !assignment?.laoId) return 'Unassigned'
  if (!assignment.nodalId || !assignment.laoId) return 'Partially Assigned'
  return 'Assigned'
}

const statusTone = {
  Assigned: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Partially Assigned': 'bg-amber-50 text-amber-700 ring-amber-200',
  Unassigned: 'bg-slate-100 text-slate-600 ring-slate-200'
}

function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${statusTone[status]}`}>{status}</span>
}

function Field({ label, value }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-1 wrap-break-word text-sm font-semibold text-slate-800">{value || 'Not provided'}</p></div>
}

const projectField = (project, key) => {
  const aliases = { projectName: ['projectName', 'name'], projectType: ['projectType', 'type'], villages: ['villages', 'village'], acquisitionRequirement: ['acquisitionRequirement'], purpose: ['purpose'], department: ['department'], requiredLandArea: ['requiredLandArea'], unit: ['unit', 'landUnit'] }
  const keys = aliases[key] || [key]
  return keys.map((field) => project?.[field]).find((value) => value !== undefined && value !== null && value !== '') || ''
}

export default function AssignmentsPage() {
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [assignments, setAssignments] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ district: 'All', lao: 'All', nodal: 'All', status: 'All' })
  const [openMenu, setOpenMenu] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [editor, setEditor] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [formError, setFormError] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)
  const [adminProfile, setAdminProfile] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const profileText = window.localStorage.getItem('adminProfile') || window.localStorage.getItem('currentProfile')
        if (profileText) {
          const profile = JSON.parse(profileText)
          setAdminProfile(profile)
          if (profile.role && !ADMIN_ROLES.includes(profile.role)) setAccessDenied(true)
        }

        const storedUsers = readStoredUsers()
        const response = storedUsers.length ? null : await fetch('/data/users.json')
        if (response && !response.ok) throw new Error('Unable to load user records.')
        const userData = storedUsers.length ? storedUsers : await response.json()
        const nextUsers = userData.map(normalizeUser)
        const nextAssignments = readProjectAssignments()
        setUsers(nextUsers)
        setAssignments(nextAssignments)
        setProjects(applyProjectAssignments(PROJECTS, nextAssignments))
      } catch (loadError) {
        setError(loadError.message || 'Unable to load assignment records.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hasGlobalAccess = String(adminProfile?.role || '').toLowerCase().includes('super') || String(adminProfile?.role || '').toLowerCase().includes('system') || adminProfile?.jurisdiction === 'All States'
  const inAdminScope = (user) => hasGlobalAccess || !adminProfile || user.state === adminProfile.state || user.district === adminProfile.district
  const nodalUsers = users.filter((user) => user.role === 'Nodal Officer' && user.status === 'Active' && inAdminScope(user))
  const laoUsers = users.filter((user) => (user.role === 'Land Acquisition Officer' || user.role === 'LAO') && user.status === 'Active' && inAdminScope(user))
  const userName = (id) => users.find((user) => user.id === id)?.name || 'Unassigned'

  const rows = useMemo(() => projects.map((project) => {
    const assignment = project.assignment || {}
    return { ...project, assignment, lao: userName(assignment.laoId), nodal: userName(assignment.nodalId), status: assignmentStatus(assignment) }
  }), [projects, users])

  const districts = [...new Set(rows.map((row) => row.district))]
  const filteredRows = rows.filter((row) => {
    const haystack = `${row.name} ${row.projectId} ${row.district}`.toLowerCase()
    return (!query || haystack.includes(query.toLowerCase())) &&
      (filters.district === 'All' || row.district === filters.district) &&
      (filters.lao === 'All' || row.assignment.laoId === filters.lao) &&
      (filters.nodal === 'All' || row.assignment.nodalId === filters.nodal) &&
      (filters.status === 'All' || row.status === filters.status)
  })

  const counts = {
    total: rows.length,
    assigned: rows.filter((row) => row.status === 'Assigned').length,
    unassigned: rows.filter((row) => row.status === 'Unassigned').length,
    pending: rows.filter((row) => row.status === 'Partially Assigned').length
  }

  const persist = (nextAssignments, nextUsers = users) => {
    setAssignments(nextAssignments)
    setProjects(applyProjectAssignments(PROJECTS, nextAssignments))
    saveProjectAssignments(nextAssignments)
    window.localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers))
    setUsers(nextUsers)
  }

  const submitAssignment = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const nodalId = form.get('nodalId') || ''
    const laoId = form.get('laoId') || ''
    if (!nodalId && !laoId) {
      setFormError('Select an officer or use the remove action.')
      return
    }
    const current = assignments[String(editor.project.id)] || {}
    const now = new Date().toISOString()
    const next = {
      ...assignments,
      [String(editor.project.id)]: {
        ...current,
        nodalId,
        laoId,
        assignedDate: current.assignedDate || now,
        history: [...(current.history || []), { action: editor.action, date: now, nodalId, laoId }]
      }
    }
    const nextUsers = users.map((user) => {
      const assigned = Array.isArray(user.assignedProjects) ? user.assignedProjects.filter((item) => item?.id !== editor.project.projectId) : []
      if (user.id === nodalId || user.id === laoId) assigned.push({ id: editor.project.projectId, title: editor.project.name })
      return { ...user, assignedProjects: assigned }
    })
    persist(next, nextUsers)
    setEditor(null)
    setFormError('')
  }

  const removeOfficer = (project, officer) => {
    const current = assignments[String(project.id)] || {}
    const nextAssignment = { ...current, [`${officer}Id`]: '', history: [...(current.history || []), { action: `Remove ${officer.toUpperCase()}`, date: new Date().toISOString(), nodalId: current.nodalId || '', laoId: current.laoId || '' }] }
    const nextAssignments = { ...assignments, [String(project.id)]: nextAssignment }
    const nextUsers = users.map((user) => ({ ...user, assignedProjects: Array.isArray(user.assignedProjects) ? user.assignedProjects.filter((item) => item?.id !== project.projectId || user.id !== current[`${officer}Id`]) : [] }))
    persist(nextAssignments, nextUsers)
  }

  const removeAssignment = () => {
    const project = confirmAction.project
    if (confirmAction.officer) {
      removeOfficer(project, confirmAction.officer)
      setConfirmAction(null)
      return
    }
    const next = { ...assignments }
    delete next[String(project.id)]
    const nextUsers = users.map((user) => ({ ...user, assignedProjects: Array.isArray(user.assignedProjects) ? user.assignedProjects.filter((item) => item?.id !== project.projectId) : [] }))
    persist(next, nextUsers)
    setConfirmAction(null)
  }

  if (loading) return <><Header title="Assignments" /><main className="min-h-screen bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">Loading assignment records...</main></>
  if (accessDenied) return <><Header title="Assignments" /><main className="min-h-screen bg-slate-50 px-4 py-12"><div className="mx-auto max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm"><AlertCircle className="mx-auto h-9 w-9 text-rose-500" /><h1 className="mt-3 text-xl font-bold text-slate-900">Access restricted</h1><p className="mt-2 text-sm text-slate-600">Only authorized administrators can manage project assignments.</p></div></main></>

  return (
    <>
      <Header title="Assignments" />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.1),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-7"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600">Admin workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Project assignments</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Coordinate Nodal Officer ownership while keeping future LAO allocation ready.</p></div><div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800"><span className="font-semibold">{filteredRows.length}</span> of {rows.length} projects visible</div></div></section>
          {error && <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="h-4 w-4" />{error}</div>}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Total Projects', counts.total, FolderKanban, 'bg-sky-50 text-sky-700'], ['Assigned', counts.assigned, CheckCircle2, 'bg-emerald-50 text-emerald-700'], ['Unassigned', counts.unassigned, Users, 'bg-slate-100 text-slate-600'], ['Partially Assigned', counts.pending, History, 'bg-amber-50 text-amber-700']].map(([label, value, Icon, tone]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold text-slate-900">{value}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span></div></div>)}</section>
          <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 xl:flex-row xl:items-center"><label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search project or project ID" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" /></label><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><Filter className="h-4 w-4" /> Filters</div>{[['district', 'District', districts], ['lao', 'LAO', laoUsers.map((user) => user.id)], ['nodal', 'Nodal Officer', nodalUsers.map((user) => user.id)], ['status', 'Status', ['Assigned', 'Partially Assigned', 'Unassigned']]].map(([key, label, options]) => <select key={key} value={filters[key]} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-400" aria-label={label}><option value="All">All {label}s</option>{options.map((option) => <option key={option} value={option}>{(key === 'nodal' || key === 'lao') ? userName(option) : option}</option>)}</select>)}</div></section>
          <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">Assignment register</h2><p className="mt-1 text-xs text-slate-500">Changes are shared with the existing project and officer records.</p></div><MapPinned className="h-5 w-5 text-sky-600" /></div>{filteredRows.length === 0 ? <div className="px-6 py-16 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-800">No projects match these filters</h3><p className="mt-1 text-sm text-slate-500">Try clearing the search or selecting a different filter.</p></div> : <div className="overflow-x-auto"><table className="min-w-[1050px] w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[0.14em] text-slate-500"><tr>{['Project', 'Project ID', 'District', 'LAO', 'Nodal Officer', 'Status', 'Assigned Date', 'Actions'].map((heading) => <th key={heading} className="px-5 py-3 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filteredRows.map((row) => <tr key={row.id} className="hover:bg-sky-50/30"><td className="px-5 py-4"><p className="max-w-[230px] truncate font-semibold text-slate-900">{row.name}</p><p className="mt-1 text-xs text-slate-500">{row.type}</p></td><td className="px-5 py-4 font-mono text-xs text-slate-600">{row.projectId}</td><td className="px-5 py-4 text-slate-600">{row.district}</td><td className="px-5 py-4 text-slate-600">{row.lao}</td><td className="px-5 py-4 text-slate-600">{row.nodal}</td><td className="px-5 py-4"><StatusBadge status={row.status} /></td><td className="px-5 py-4 text-xs text-slate-500">{formatDate(row.assignment.assignedDate)}</td><td className="relative px-5 py-4"><div className="flex items-center gap-1"><button type="button" onClick={() => setSelectedProject(row)} className="rounded-lg p-2 text-sky-700 hover:bg-sky-100" aria-label={`View ${row.name}`} title="View"><Eye className="h-4 w-4" /></button><button type="button" onClick={() => setOpenMenu(openMenu === row.id ? null : row.id)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`Actions for ${row.name}`} title="More actions"><MoreVertical className="h-4 w-4" /></button></div>{openMenu === row.id && <div className="absolute right-5 top-12 z-10 w-60 rounded-xl border border-slate-200 bg-white p-1 shadow-xl"><button type="button" onClick={() => { setEditor({ project: row, action: row.assignment.laoId ? 'Reassign LAO' : 'Assign LAO', focus: 'lao' }); setOpenMenu(null) }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">{row.assignment.laoId ? 'Reassign LAO' : 'Assign LAO'}</button>{row.assignment.laoId && <button type="button" onClick={() => { setConfirmAction({ project: row, officer: 'lao' }); setOpenMenu(null) }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">Remove LAO</button>}<button type="button" onClick={() => { setEditor({ project: row, action: row.assignment.nodalId ? 'Reassign Nodal Officer' : 'Assign Nodal Officer', focus: 'nodal' }); setOpenMenu(null) }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">{row.assignment.nodalId ? 'Reassign Nodal Officer' : 'Assign Nodal Officer'}</button>{row.assignment.nodalId && <button type="button" onClick={() => { setConfirmAction({ project: row, officer: 'nodal' }); setOpenMenu(null) }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">Remove Nodal Officer</button>}</div>}</td></tr>)}</tbody></table></div>}</section>
        </div>
      </main>
      {editor && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={submitAssignment} className="w-full max-w-md rounded-3xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-600">{editor.action} assignment</p><h2 className="mt-1 font-bold text-slate-900">{editor.project.name}</h2></div><button type="button" onClick={() => setEditor(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="space-y-4 p-5"><label className="block text-sm font-semibold text-slate-700">LAO<select name="laoId" defaultValue={editor.project.assignment.laoId || ''} disabled={laoUsers.length === 0} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="">{laoUsers.length ? 'Unassigned' : 'No LAO available'}</option>{laoUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label><label className="block text-sm font-semibold text-slate-700">Nodal Officer<select name="nodalId" defaultValue={editor.project.assignment.nodalId || ''} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="">Unassigned</option>{nodalUsers.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.district}</option>)}</select></label>{formError && <p className="text-sm text-rose-600">{formError}</p>}</div><div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 p-4"><button type="button" onClick={() => setEditor(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">Cancel</button><button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Save assignment</button></div></form></div>}
      {selectedProject && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"><div className="max-h-[50vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-100 p-5"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-600">Create Project submission</p><h2 className="mt-1 text-xl font-bold text-slate-900">{projectField(selectedProject, 'projectName') || 'Not provided'}</h2><p className="mt-1 font-mono text-xs text-slate-500">{projectField(selectedProject, 'projectId') || 'Not provided'}</p></div><button type="button" onClick={() => setSelectedProject(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="space-y-5 p-5"><section><h3 className="mb-3 text-sm font-bold text-slate-900">Project details</h3><div className="grid gap-3 sm:grid-cols-2"><Field label="Project ID" value={projectField(selectedProject, 'projectId')} /><Field label="Project Name" value={projectField(selectedProject, 'projectName')} /><Field label="Project Type" value={projectField(selectedProject, 'projectType')} /><Field label="Department / Agency" value={projectField(selectedProject, 'department')} /><div className="sm:col-span-2"><Field label="Project Description" value={projectField(selectedProject, 'description')} /></div></div></section><section><h3 className="mb-3 text-sm font-bold text-slate-900">Project location</h3><div className="grid gap-3 sm:grid-cols-2"><Field label="State" value={projectField(selectedProject, 'state')} /><Field label="District" value={projectField(selectedProject, 'district')} /><Field label="Tehsil / Taluk" value={projectField(selectedProject, 'tehsil')} /><Field label="Village(s)" value={projectField(selectedProject, 'villages')} /><Field label="Location Type" value={projectField(selectedProject, 'locationType')} /><Field label="Latitude" value={projectField(selectedProject, 'latitude')} /><Field label="Longitude" value={projectField(selectedProject, 'longitude')} />{projectField(selectedProject, 'locationType') === 'linear' ? <Field label="Route Length (km)" value={projectField(selectedProject, 'routeLength')} /> : <Field label="Calculated Area" value={projectField(selectedProject, 'calculatedArea')} />}</div></section><section><h3 className="mb-3 text-sm font-bold text-slate-900">Land requirement</h3><div className="grid gap-3 sm:grid-cols-2"><Field label="Required Land Area" value={projectField(selectedProject, 'requiredLandArea')} /><Field label="Unit" value={projectField(selectedProject, 'unit')} /><Field label="Acquisition Requirement" value={projectField(selectedProject, 'acquisitionRequirement')} /><div className="sm:col-span-2"><Field label="Purpose" value={projectField(selectedProject, 'purpose')} /></div></div></section><section><h3 className="mb-3 text-sm font-bold text-slate-900">Documents</h3><Field label="Uploaded Documents" value={Array.isArray(selectedProject.documents) && selectedProject.documents.length ? selectedProject.documents.map((document) => document.name || 'Unnamed document').join(', ') : ''} /></section></div><div className="flex justify-end border-t border-slate-100 bg-slate-50 p-4"><button type="button" onClick={() => setSelectedProject(null)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Close</button></div></div></div>}
      {confirmAction && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"><AlertCircle className="mx-auto h-10 w-10 text-amber-500" /><h2 className="mt-3 font-bold text-slate-900">Remove {confirmAction.officer ? confirmAction.officer.toUpperCase() : 'assignment'}?</h2><p className="mt-2 text-sm text-slate-500">This removes only the selected officer assignment for {confirmAction.project.name}.</p><div className="mt-6 flex justify-center gap-2"><button type="button" onClick={() => setConfirmAction(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="button" onClick={removeAssignment} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500">Remove</button></div></div></div>}
    </>
  )
}