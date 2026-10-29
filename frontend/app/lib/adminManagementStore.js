export const USERS_KEY = 'BhuSetuUsersData'
export const JURISDICTIONS_KEY = 'BhuSetuJurisdictionsData'
export const ADMIN_ACTIVITY_KEY = 'BhuSetuAdminActivity'
export const PROJECT_ASSIGNMENTS_KEY = 'BhuSetuProjectAssignments'

export const ROLE_OPTIONS = ['Project Officer', 'Land Acquisition Officer', 'Nodal Officer', 'System Admin']
export const STATUS_OPTIONS = ['Active', 'Inactive', 'Pending', 'Suspended']
export const JURISDICTION_TYPES = ['State', 'District', 'Tehsil/Block', 'Village']

const DEFAULT_JURISDICTIONS = [
  { id: 'jur-delhi', name: 'Delhi', type: 'State', parentId: null, state: 'Delhi', district: '', tehsil: '', village: '', status: 'Active', adminIds: [], coverage: 'State-wide administrative coverage', boundary: 'Delhi state boundary' },
  { id: 'jur-new-delhi', name: 'New Delhi', type: 'District', parentId: 'jur-delhi', state: 'Delhi', district: 'New Delhi', tehsil: '', village: '', status: 'Active', adminIds: [], coverage: 'Central administrative district', boundary: 'New Delhi district boundary' },
  { id: 'jur-south-delhi', name: 'South Delhi', type: 'District', parentId: 'jur-delhi', state: 'Delhi', district: 'South Delhi', tehsil: '', village: '', status: 'Active', adminIds: [], coverage: 'South district coverage', boundary: 'South Delhi district boundary' },
  { id: 'jur-saket', name: 'Saket', type: 'Tehsil/Block', parentId: 'jur-south-delhi', state: 'Delhi', district: 'South Delhi', tehsil: 'Saket', village: '', status: 'Active', adminIds: [], coverage: 'Saket block coverage', boundary: 'Saket block boundary' },
  { id: 'jur-mehrauli', name: 'Mehrauli', type: 'Village', parentId: 'jur-saket', state: 'Delhi', district: 'South Delhi', tehsil: 'Saket', village: 'Mehrauli', status: 'Active', adminIds: [], coverage: 'Mehrauli village coverage', boundary: 'Mehrauli village boundary' },
  { id: 'jur-uttar-pradesh', name: 'Uttar Pradesh', type: 'State', parentId: null, state: 'Uttar Pradesh', district: '', tehsil: '', village: '', status: 'Active', adminIds: [], coverage: 'State-wide administrative coverage', boundary: 'Uttar Pradesh state boundary' },
  { id: 'jur-lucknow', name: 'Lucknow', type: 'District', parentId: 'jur-uttar-pradesh', state: 'Uttar Pradesh', district: 'Lucknow', tehsil: '', village: '', status: 'Active', adminIds: [], coverage: 'Lucknow district coverage', boundary: 'Lucknow district boundary' },
  { id: 'jur-kanpur', name: 'Kanpur', type: 'District', parentId: 'jur-uttar-pradesh', state: 'Uttar Pradesh', district: 'Kanpur', tehsil: '', village: '', status: 'Active', adminIds: [], coverage: 'Kanpur district coverage', boundary: 'Kanpur district boundary' },
]

const readJson = (key, fallback) => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const readUsers = () => readJson(USERS_KEY, [])
export const saveUsers = (users) => window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
export const readJurisdictions = () => readJson(JURISDICTIONS_KEY, DEFAULT_JURISDICTIONS)
export const saveJurisdictions = (jurisdictions) => window.localStorage.setItem(JURISDICTIONS_KEY, JSON.stringify(jurisdictions))
export const readActivity = () => readJson(ADMIN_ACTIVITY_KEY, [])

export const recordAdminActivity = ({ action, module, target, detail }) => {
  if (typeof window === 'undefined') return
  const profileText = window.localStorage.getItem('adminProfile') || window.localStorage.getItem('currentProfile')
  let profile = {}
  try { profile = profileText ? JSON.parse(profileText) : {} } catch { profile = {} }
  const record = {
    id: `ADMIN-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: profile.name || 'System Administrator',
    role: profile.role || 'System Admin',
    action,
    module,
    target,
    detail: detail || `${action} completed for ${target}`,
    status: 'Success',
  }
  window.localStorage.setItem(ADMIN_ACTIVITY_KEY, JSON.stringify([record, ...readActivity()].slice(0, 500)))
}

export const normalizeUser = (user) => ({
  ...user,
  id: user.id || user.employeeId,
  role: user.role || 'Project Officer',
  status: user.status || 'Active',
  state: user.state || (user.jurisdiction === 'All States' ? 'All States' : 'Uttar Pradesh'),
  jurisdiction: user.jurisdiction || 'District Level',
  department: user.department || 'Project Management',
  phone: user.phone || '+91 00000 00000',
  district: user.district || 'Unassigned',
  email: user.email || `${user.name?.toLowerCase().replace(/\s+/g, '.')}@bhusetu.gov.in`,
  assignedProjects: Array.isArray(user.assignedProjects) ? user.assignedProjects : [],
  permissions: Array.isArray(user.permissions) ? user.permissions : [],
  recentActivity: Array.isArray(user.recentActivity) ? user.recentActivity : [],
  account: user.account || { createdAt: new Date().toISOString().slice(0, 10), lastPasswordReset: 'Not recorded', securityLevel: 'Standard' },
})

export const getAdminProfile = () => {
  if (typeof window === 'undefined') return { role: 'System Admin', jurisdiction: 'All States', state: 'All States' }
  const text = window.localStorage.getItem('adminProfile') || window.localStorage.getItem('currentProfile') || window.localStorage.getItem('selectedProfile')
  if (!text) return { role: 'System Admin', jurisdiction: 'All States', state: 'All States' }
  try { return JSON.parse(text) } catch { return { role: 'System Admin', jurisdiction: 'All States', state: 'All States' } }
}

export const hasGlobalAccess = (profile) => {
  const role = String(profile?.role || '').toLowerCase()
  return role.includes('super') || role === 'system admin' || role === 'system administrator' || profile?.jurisdiction === 'All States'
}

export const canManageJurisdiction = (profile, jurisdiction) => {
  if (hasGlobalAccess(profile)) return true
  const scope = String(profile?.district || profile?.state || profile?.jurisdiction || '').toLowerCase()
  return [jurisdiction?.state, jurisdiction?.district, jurisdiction?.name].some((value) => String(value || '').toLowerCase() === scope)
}

export const canManageUser = (profile, user) => {
  if (hasGlobalAccess(profile)) return true
  const scope = String(profile?.district || profile?.state || '').toLowerCase()
  return String(user?.state || '').toLowerCase() === scope || String(user?.district || '').toLowerCase() === scope
}

export const readOrSeedUsers = async () => {
  const stored = readUsers()
  if (stored.length) return stored.map(normalizeUser)
  const response = await fetch('/data/users.json')
  if (!response.ok) throw new Error('Unable to load user records.')
  const users = (await response.json()).map(normalizeUser)
  saveUsers(users)
  return users
}
