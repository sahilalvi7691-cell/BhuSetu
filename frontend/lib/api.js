const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const normalizeProject = (project) => ({
  ...project,
  riskProbability: project.riskProbability == null ? project.riskProbability : Number(project.riskProbability),
  riskCategory: project.riskCategory ? `${project.riskCategory[0]}${project.riskCategory.slice(1).toLowerCase()}` : project.riskCategory,
  coordinates: project.coordinates || (project.geometry?.type === "Point" ? { latitude: project.geometry.coordinates[1], longitude: project.geometry.coordinates[0] } : null),
});

export const mergeProjectCollections = (localProjects, backendProjects) => {
  const byProjectCode = new Map();
  (localProjects || []).forEach((project) => {
    const code = String(project.projectId || project.id);
    if (!byProjectCode.has(code)) byProjectCode.set(code, project);
  });
  (backendProjects || []).forEach((project) => {
    const normalized = normalizeProject(project);
    const code = String(normalized.projectId || normalized.id);
    byProjectCode.set(code, { ...(byProjectCode.get(code) || {}), ...normalized });
  });
  return [...byProjectCode.values()];
};

export const api = {
  health: () => request("/api/health"),
  listProjects: (query = "") => request(`/api/projects${query}`),
  createProject: (project) => request("/api/projects", { method: "POST", body: JSON.stringify(project) }),
  getProject: (id) => request(`/api/projects/${id}`),
  getProjectByCode: (code) => request(`/api/projects/by-code/${encodeURIComponent(code)}`),
  getGeometry: (id) => request(`/api/projects/${id}/geometry`),
  updateProjectWorkflow: (id, data) => request(`/api/projects/${id}/workflow`, { method: "PUT", body: JSON.stringify(data) }),
  createDecision: (id, data) => request(`/api/projects/${id}/decisions`, { method: "POST", body: JSON.stringify(data) }),
  getInterventions: (id) => request(`/api/projects/${id}/interventions`),
  updateAcquisition: (id, data) => request(`/api/projects/${id}/acquisition`, { method: "PUT", body: JSON.stringify(data) }),
  predict: (id) => request(`/api/ai/predict/${id}`, { method: "POST" }),
  getAssessment: (id) => request(`/api/ai/assessment/${id}`),
  getHistory: (id) => request(`/api/ai/history/${id}`),
  createIntervention: (intervention) => request("/api/interventions", { method: "POST", body: JSON.stringify(intervention) }),
  getRiskDistribution: () => request("/api/analytics/risk-distribution"),
};
