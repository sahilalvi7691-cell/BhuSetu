import { PROJECTS } from "../project-officer/my-project/projects-data";

const STORAGE_KEY = "BhuSetu-super-admin-state";
const EVENT_NAME = "BhuSetu-super-admin-updated";

const initialState = {
  admins: [
    { id: "admin-1", name: "Rakesh Sharma", email: "rakesh.sharma@bhusetu.ai", role: "Admin", jurisdiction: "Uttar Pradesh", status: "Active" },
    { id: "admin-2", name: "Priya Menon", email: "priya.menon@bhusetu.ai", role: "Admin", jurisdiction: "Maharashtra", status: "Active" },
  ],
  users: [
    { id: "user-1", name: "Ali Arzan Zaidi", email: "ali.zaidi@bhusetu.ai", role: "Project Officer", jurisdiction: "Delhi", status: "Active", projects: [1, 2] },
    { id: "user-2", name: "Rajesh Kumar", email: "rajesh.kumar@bhusetu.ai", role: "LAO", jurisdiction: "Uttar Pradesh", status: "Active", projects: [1, 3] },
    { id: "user-3", name: "Amit Sharma", email: "amit.sharma@bhusetu.ai", role: "Nodal Officer", jurisdiction: "Uttar Pradesh", status: "Active", projects: [1, 10] },
    { id: "user-4", name: "Sahil Alvi", email: "sahil.alvi@bhusetu.ai", role: "Nodal Officer", jurisdiction: "Delhi", status: "Active", projects: [] },
  ],
  roles: [
    { id: "super-admin", name: "Super Admin", description: "Global platform governance", permissions: ["all"] },
    { id: "admin", name: "Admin", description: "Assigned jurisdiction administration", permissions: ["users.view", "projects.view", "assignments.manage", "notifications.view"] },
    { id: "project-officer", name: "Project Officer", description: "Create and manage permitted projects", permissions: ["projects.create", "projects.view"] },
    { id: "lao", name: "LAO", description: "Land acquisition verification", permissions: ["projects.view", "parcels.manage"] },
    { id: "nodal-officer", name: "Nodal Officer", description: "Assigned project monitoring", permissions: ["projects.view", "risk.view", "notifications.view"] },
  ],
  jurisdictions: [
    { id: "jur-1", state: "Uttar Pradesh", district: "Ghaziabad", tehsil: "Modinagar", villages: "Modinagar, Muradnagar", admin: "Rakesh Sharma", status: "Active", coverage: "92%" },
    { id: "jur-2", state: "Maharashtra", district: "Pune", tehsil: "Khed", villages: "Chakan, Rajgurunagar", admin: "Priya Menon", status: "Active", coverage: "86%" },
    { id: "jur-3", state: "Delhi", district: "Delhi", tehsil: "Delhi", villages: "Ujwa, Baprola", admin: "Unassigned", status: "Active", coverage: "74%" },
  ],
  assignments: [
    { id: "assignment-1", projectId: 1, projectOfficer: "Ali Arzan Zaidi", lao: "Rajesh Kumar", nodalOfficer: "Amit Sharma", status: "Active", jurisdiction: "Uttar Pradesh" },
    { id: "assignment-2", projectId: 2, projectOfficer: "Ali Arzan Zaidi", lao: "Unassigned", nodalOfficer: "Sahil Alvi", status: "Pending", jurisdiction: "West Bengal" },
    { id: "assignment-3", projectId: 3, projectOfficer: "Ali Arzan Zaidi", lao: "Rajesh Kumar", nodalOfficer: "Unassigned", status: "Pending", jurisdiction: "Madhya Pradesh" },
  ],
  notifications: [
    { id: "notification-1", title: "Assignment pending", detail: "Eastern Metro Link needs an LAO", type: "Assignment", time: "Today, 09:42", read: false },
    { id: "notification-2", title: "GIS data missing", detail: "One project has incomplete boundary data", type: "GIS", time: "Yesterday, 16:10", read: false },
    { id: "notification-3", title: "Admin created", detail: "Priya Menon was added as an Admin", type: "Administration", time: "10 Sep 2026", read: true },
  ],
  auditLogs: [
    { id: "audit-1", action: "Admin created", actor: "Super Admin", target: "Priya Menon", category: "Admin changes", time: "10 Sep 2026, 14:20", status: "Success" },
    { id: "audit-2", action: "LAO assigned", actor: "Rakesh Sharma", target: "Delhi–Meerut Highway Expansion", category: "Assignments", time: "09 Sep 2026, 11:05", status: "Success" },
    { id: "audit-3", action: "Login", actor: "Super Admin", target: "Web console", category: "Login/logout", time: "09 Sep 2026, 09:12", status: "Success" },
  ],
  configuration: { projectTypes: "Highway, Railway, Metro, Road, Irrigation, Industrial, Other", projectStatuses: "Draft, Pending LAO Verification, Under Acquisition, On Hold, Completed", notifications: true, gisLabels: true, aiLabels: true },
  security: { passwordLength: 10, sessionTimeout: 30, lockoutAttempts: 5, mfaRequired: true, loginAlerts: true },
  projects: PROJECTS.map((project) => ({
    ...project,
    workflowStatus: project.workflowStatus || project.status,
    nodalReviewCompleted: false,
    submittedAt: null,
    submittedBy: null,
    verification: null,
    workflowActivity: [],
  })),
};

const clone = (value) => JSON.parse(JSON.stringify(value));

export function getSuperAdminState() {
  if (typeof window === "undefined") return clone(initialState);
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...clone(initialState), ...JSON.parse(saved) } : clone(initialState);
  } catch {
    return clone(initialState);
  }
}

export function updateSuperAdminState(updater) {
  if (typeof window === "undefined") return;
  const next = updater(getSuperAdminState());
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function subscribeToSuperAdminState(callback) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback(getSuperAdminState());
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

export function addAuditLog(state, action, target, category = "Administration", mutate) {
  const nextState = typeof mutate === "function" ? mutate(state) : state;
  return {
    ...nextState,
    auditLogs: [{ id: `audit-${Date.now()}`, action, actor: "Super Admin", target, category, time: new Date().toLocaleString("en-IN"), status: "Success" }, ...nextState.auditLogs],
  };
}

export function updateProjectWorkflow(projectId, mutate) {
  updateSuperAdminState((current) => {
    const project = current.projects.find((item) => String(item.id) === String(projectId) || String(item.projectId) === String(projectId));
    if (!project) return current;

    const nextProject = mutate(project);
    return {
      ...current,
      projects: current.projects.map((item) => String(item.id) === String(projectId) || String(item.projectId) === String(projectId) ? nextProject : item),
    };
  });
}
