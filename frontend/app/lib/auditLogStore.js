export const AUDIT_LOGS_KEY = 'BhuSetuAuditLogs'

const safeDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

const inferModule = (title = '') => {
  const text = title.toLowerCase()
  if (text.includes('assign') || text.includes('officer')) return 'Assignments'
  if (text.includes('gis') || text.includes('map') || text.includes('boundary')) return 'GIS'
  if (text.includes('login') || text.includes('logon') || text.includes('sign')) return 'Login activity'
  if (text.includes('jurisdiction') || text.includes('district') || text.includes('zone')) return 'Jurisdiction'
  if (text.includes('config') || text.includes('policy') || text.includes('permission')) return 'Configuration'
  if (text.includes('security') || text.includes('password') || text.includes('access')) return 'Security'
  return 'Projects'
}

const normalize = (record, index) => ({
  id: record.id || `AUD-${Date.now()}-${index}`,
  timestamp: safeDate(record.timestamp || record.date || record.createdAt),
  user: record.user || 'System',
  userId: record.userId || '',
  role: record.role || 'System',
  action: record.action || 'Activity recorded',
  module: record.module || inferModule(record.action),
  target: record.target || 'System record',
  status: record.status || 'Success',
  previousValue: record.previousValue ?? 'Not available',
  newValue: record.newValue ?? 'Not available',
  remarks: record.remarks || record.detail || 'No additional remarks.',
  device: record.device || 'Not available',
  ip: record.ip || 'Not available'
})

export const readAuditLogs = () => {
  if (typeof window === 'undefined') return []
  try {
    const saved = window.localStorage.getItem(AUDIT_LOGS_KEY)
    return saved ? JSON.parse(saved).map(normalize) : []
  } catch {
    return []
  }
}

export const writeAuditLogs = (logs) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs.map(normalize)))
  }
}

export const buildAuditLogs = ({ users = [], projects = [], assignments = {} }) => {
  const records = []

  users.forEach((user) => {
    const activities = Array.isArray(user.recentActivity) ? user.recentActivity : []
    activities.forEach((activity, index) => records.push(normalize({
      id: `USER-ACT-${user.id}-${index}`,
      timestamp: activity.timestamp || activity.date || user.lastLogin,
      user: user.name,
      userId: user.id,
      role: user.role,
      action: activity.title,
      module: inferModule(activity.title),
      target: activity.detail || user.name,
      remarks: activity.detail,
      status: activity.title.toLowerCase().includes('failed') ? 'Failed' : 'Success'
    }, records.length)))

    if (user.lastLogin) records.push(normalize({
      id: `LOGIN-${user.id}`,
      timestamp: user.lastLogin,
      user: user.name,
      userId: user.id,
      role: user.role,
      action: 'Successful login',
      module: 'Login activity',
      target: 'BhuSetu portal',
      remarks: 'Login timestamp from the user profile record.',
      device: user.device,
      ip: user.ip
    }, records.length))
  })

  projects.forEach((project) => {
    records.push(normalize({
      id: `PROJECT-${project.id}`,
      timestamp: project.updatedAt || project.createdAt,
      user: project.projectOfficer || 'Project Officer',
      role: 'Project Officer',
      action: 'Project record updated',
      module: 'Projects',
      target: `${project.name} (${project.projectId})`,
      newValue: project.status,
      remarks: project.description
    }, records.length))
  })

  Object.entries(assignments).forEach(([projectId, assignment]) => {
    ;(assignment.history || []).forEach((event, index) => records.push(normalize({
      id: `ASSIGN-${projectId}-${index}`,
      timestamp: event.date,
      user: event.userName || 'Admin',
      role: event.role || 'Admin',
      action: event.action || 'Officer assignment updated',
      module: 'Assignments',
      target: assignment.projectId || `Project ${projectId}`,
      previousValue: event.previousValue,
      newValue: event.newValue || `LAO: ${event.laoId || 'Unassigned'}; Nodal: ${event.nodalId || 'Unassigned'}`,
      remarks: 'Assignment history from the project record.'
    }, records.length)))
  })

  return records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}
