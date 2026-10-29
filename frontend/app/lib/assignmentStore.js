export const PROJECT_ASSIGNMENTS_KEY = 'BhuSetuProjectAssignments'

export const readProjectAssignments = () => {
  if (typeof window === 'undefined') return {}

  try {
    const saved = window.localStorage.getItem(PROJECT_ASSIGNMENTS_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

export const saveProjectAssignments = (assignments) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PROJECT_ASSIGNMENTS_KEY, JSON.stringify(assignments))
  }
}

export const applyProjectAssignments = (projects, assignments) => projects.map((project) => ({
  ...project,
  assignment: assignments[String(project.id)] || project.assignment || null
}))