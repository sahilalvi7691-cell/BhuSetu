const DEFAULT_SETTINGS = {
  inAppNotifications: true,
  emailNotifications: true,
  riskAlerts: true,
  interventionReminders: true,
  projectUpdates: true,
  showRiskLayerByDefault: true,
  defaultMapView: "State",
  language: "English",
  appVersion: "v1.0",
};

const roleSettings = {
  "project-officer": { ...DEFAULT_SETTINGS },
  project_officer: { ...DEFAULT_SETTINGS },
  "LandAcqOfficer": { ...DEFAULT_SETTINGS },
  land_acquisition_officer: { ...DEFAULT_SETTINGS },
  "nodal-officer": { ...DEFAULT_SETTINGS },
  nodal_officer: { ...DEFAULT_SETTINGS },
  "system-admin": { ...DEFAULT_SETTINGS },
  system_admin: { ...DEFAULT_SETTINGS },
  "super-admin": { ...DEFAULT_SETTINGS },
  super_admin: { ...DEFAULT_SETTINGS },
};

const listeners = new Map();

const normalizeRoleKey = (role) => {
  const value = String(role ?? "").trim().toLowerCase();

  if (!value) return "project_officer";
  if (value.includes("project")) return "project_officer";
  if (value.includes("land") || value.includes("acquisition")) return "land_acquisition_officer";
  if (value.includes("nodal")) return "nodal_officer";
  if (value.includes("super")) return "super_admin";
  if (value.includes("admin") || value.includes("system")) return "system_admin";

  return "project_officer";
};

export const getSettingsForRole = (role) => {
  const key = normalizeRoleKey(role);
  if (!roleSettings[key]) {
    roleSettings[key] = { ...DEFAULT_SETTINGS };
  }

  return { ...roleSettings[key] };
};

export const setSettingsForRole = (role, valueOrUpdater) => {
  const key = normalizeRoleKey(role);
  const current = roleSettings[key] ?? { ...DEFAULT_SETTINGS };
  const next = typeof valueOrUpdater === "function" ? valueOrUpdater(current) : valueOrUpdater;

  roleSettings[key] = { ...current, ...next };

  const handlers = listeners.get(key) ?? [];
  handlers.forEach((fn) => fn({ ...roleSettings[key] }));
};

export const subscribeToSettings = (role, callback) => {
  const key = normalizeRoleKey(role);
  const handlers = listeners.get(key) ?? [];
  listeners.set(key, [...handlers, callback]);

  return () => {
    const remaining = (listeners.get(key) ?? []).filter((fn) => fn !== callback);
    if (remaining.length) {
      listeners.set(key, remaining);
    } else {
      listeners.delete(key);
    }
  };
};
