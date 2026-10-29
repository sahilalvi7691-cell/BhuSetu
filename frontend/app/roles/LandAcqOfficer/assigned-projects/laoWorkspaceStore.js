import { PROJECTS } from "./projects-data";
import { getWorkflowState, recalculateProjectRisk, subscribeToWorkflow } from "../../../../components/workflowStore";

const STORAGE_KEY = "BhuSetu-lao-project-workspaces";
const EVENT_NAME = "BhuSetu-lao-workspace-updated";

const seedWorkspace = (project) => ({
  projectId: project.id,
  parcels: [
    { id: `${project.id}-parcel-1`, khasra: "K-102/4", area: 2.4, location: project.village, landUse: "Agricultural", owner: "Owner reference pending", status: "Pending" },
    { id: `${project.id}-parcel-2`, khasra: "K-108/2", area: 1.8, location: project.village, landUse: "Residential", owner: "Owner reference pending", status: "Pending" },
  ],
  acquisition: {
    ownership: "Pending verification",
    compensation: "Not started",
    legal: "No dispute recorded",
    rr: "Not started",
    approvals: "In review",
    documents: "Project documents available",
    possession: "Not started",
  },
  activity: [
    { id: `${project.id}-activity-1`, action: "Project Assigned", actor: "Admin", timestamp: project.createdAt, status: "Completed" },
    { id: `${project.id}-activity-2`, action: "Parcel Verification Started", actor: "Ali Arzan Zaidi", timestamp: project.updatedAt, status: "Active" },
  ],
  submittedAt: null,
});

const clone = (value) => JSON.parse(JSON.stringify(value));

function getInitialState() {
  return Object.fromEntries(PROJECTS.map((project) => [project.id, seedWorkspace(project)]));
}

export function getLaoWorkspaces() {
  return Object.fromEntries(getWorkflowState().projects.map((project) => [project.id, project.workspace || seedWorkspace(project)]));
}

export function updateLaoWorkspace(projectId, updater) {
  const workspaces = getLaoWorkspaces();
  const current = workspaces[projectId] || seedWorkspace(PROJECTS.find((project) => project.id === Number(projectId)) || PROJECTS[0]);
  recalculateProjectRisk(projectId, updater(clone(current)), "LAO acquisition data updated");
}

export function subscribeToLaoWorkspaces(callback) {
  return subscribeToWorkflow(() => callback(getLaoWorkspaces()));
}
