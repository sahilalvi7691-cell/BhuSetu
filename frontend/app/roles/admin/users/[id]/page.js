'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, Building2, CalendarClock, CheckCircle2, Mail, MapPinned, Phone, ShieldCheck, UserRound, Users } from 'lucide-react'

const getStoredUsers = () => {
  if (typeof window === 'undefined') return []
  try {
    const saved = window.localStorage.getItem('BhuSetuUsersData')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const roleStyles = {
  'Project Officer': 'bg-sky-50 text-sky-700 ring-sky-200',
  'Land Acquisition Officer': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Nodal Officer': 'bg-violet-50 text-violet-700 ring-violet-200',
  'System Admin': 'bg-amber-50 text-amber-700 ring-amber-200'
}

const statusStyles = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Inactive: 'bg-slate-200 text-slate-700 ring-slate-300',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Suspended: 'bg-rose-50 text-rose-700 ring-rose-200'
}

const projectSummary = (projects = []) => {
  if (!Array.isArray(projects) || projects.length === 0) return 'No active assignment'

  return projects.map((project) => project.title || project).slice(0, 3).join(', ')
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        setError('')

        const localUsers = getStoredUsers()
        const cachedUser = localUsers.find((entry) => String(entry.id) === String(params.id))
        if (cachedUser) {
          setUser(cachedUser)
          setLoading(false)
          return
        }

        const response = await fetch('/data/users.json')
        if (!response.ok) throw new Error('Failed to load user profile.')

        const data = await response.json()
        const selectedUser = data.find((entry) => String(entry.id) === String(params.id))

        if (!selectedUser) {
          setUser(null)
          setLoading(false)
          return
        }

        setUser(selectedUser)
      } catch (loadError) {
        setError(loadError.message || 'Unable to load the selected profile.')
      } finally {
        setLoading(false)
      }
    }

    if (params?.id) {
      loadUser()
    }
  }, [params?.id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">Loading user details…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-rose-600" />
          <h2 className="text-lg font-bold text-slate-900">Unable to load profile</h2>
          <p className="mt-2 text-sm text-rose-700">{error}</p>
          <button onClick={() => router.push('/roles/admin/users')} className="mt-4 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500">Back to Users</button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Users className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">User not found</h2>
          <p className="mt-2 text-sm text-slate-600">The requested profile is not available in the current dataset.</p>
          <button onClick={() => router.push('/roles/admin/users')} className="mt-4 rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500">Back to Users</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_20%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/roles/admin/users')} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-200">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">User Profile</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">{user.name}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${roleStyles[user.role] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>{user.role}</span>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${statusStyles[user.status] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>{user.status}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-sky-100 bg-linear-to-br from-sky-50 via-white to-indigo-50 p-4 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.25)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-sky-200">
                {user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{user.employeeId} • {user.department}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"><Mail className="h-4 w-4 text-sky-600" /> {user.email}</span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"><Phone className="h-4 w-4 text-sky-600" /> {user.phone}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Basic Info</h3>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Employee ID</p>
                <p className="mt-1 font-semibold text-slate-800">{user.employeeId}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Date of Birth</p>
                <p className="mt-1 font-semibold text-slate-800">{user.dateOfBirth || 'Not provided'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Gender</p>
                <p className="mt-1 font-semibold text-slate-800">{user.gender || 'Not provided'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">District</p>
                <p className="mt-1 font-semibold text-slate-800">{user.district || 'N/A'}</p>
              </div>
              <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Address</p>
                <p className="mt-1 font-medium text-slate-800">{user.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-violet-600" />
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Role & Jurisdiction</h3>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Role</p>
                <p className="mt-1 font-semibold text-slate-800">{user.role}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Department</p>
                <p className="mt-1 font-semibold text-slate-800">{user.department}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Jurisdiction</p>
                <p className="mt-1 font-semibold text-slate-800">{user.jurisdiction}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Manager</p>
                <p className="mt-1 font-semibold text-slate-800">{user.manager || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.35)] lg:col-span-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Assigned Projects</h3>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(Array.isArray(user.assignedProjects) && user.assignedProjects.length > 0 ? user.assignedProjects : [{ id: 'N/A', title: 'No project assigned' }]).map((project) => (
                <div key={project.id || project.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{project.id || 'Project'}</p>
                  <p className="mt-1 font-semibold text-slate-800">{project.title || 'No project assigned'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Permissions</h3>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Array.isArray(user.permissions) && user.permissions.length > 0 ? user.permissions : ['View Records', 'Update Records']).map((permission) => (
                <span key={permission} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">{permission}</span>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Account Status</h3>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Status</p>
                <p className="mt-1 font-semibold text-slate-800">{user.status}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Last Login</p>
                <p className="mt-1 font-semibold text-slate-800">{user.lastLogin}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Security Level</p>
                <p className="mt-1 font-semibold text-slate-800">{user.account?.securityLevel || 'Standard'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.35)] lg:col-span-2">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Recent Activity</h3>
            </div>
            <div className="mt-4 space-y-3"> 
              {(Array.isArray(user.recentActivity) && user.recentActivity.length > 0 ? user.recentActivity : [{ title: 'Assigned project review', detail: 'Reviewed GIS and land status updates.', time: 'Today' }]).map((activity) => (
                <div key={`${activity.title}-${activity.time}`} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800">{activity.title}</p>
                      <span className="text-[11px] font-medium text-slate-500">{activity.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{activity.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
