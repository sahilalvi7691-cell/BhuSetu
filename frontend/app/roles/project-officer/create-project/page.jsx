"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
// @ts-ignore
import "./page.css";
import {
  MapPin,
  FileText,
  Building2,
  LandPlot,
  Upload,
  Trash2,
  CheckCircle2,
  Save,
} from "lucide-react";
import { Header } from "../../../component/layout/index";
import { createWorkflowProject } from "../../../../components/workflowStore";
import { api } from "../../../../lib/api";

const CreateProjectMap = dynamic(() => import("./CreateProjectMap"), { ssr: false });
const steps = [
  { id: 1, title: "Project Information", icon: Building2 },
  { id: 2, title: "Administrative Location", icon: MapPin },
  { id: 3, title: "Project GIS Location", icon: LandPlot },
  { id: 4, title: "Land Requirement", icon: LandPlot },
  { id: 5, title: "Documents & Review", icon: FileText },
];

const projectTypes = [
  "Highway",
  "Railway",
  "Metro",
  "Road",
  "Irrigation",
  "Industrial",
  "Other",
];

const units = ["Hectare", "Acre"];

const documentTypes = [
  "Project Proposal",
  "Project Plan / Route",
  "Land Requirement Document",
  "Approval / Reference Document",
  "Other",
];

function SectionHeader({ icon, title, description }) {
  return (
    <div className="border-b border-slate-200 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function Required() {
  return <span className="text-red-500">*</span>;
}

function ErrorMessage({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function getGeometryCoordinateGroups(geometry) {
  if (geometry?.type === "Feature") geometry = geometry.geometry;
  if (!geometry?.coordinates) return [];

  if (geometry.type === "Point") {
    return [{ label: "Point", coordinates: [geometry.coordinates] }];
  }

  if (geometry.type === "LineString") {
    return [{ label: "Route", coordinates: geometry.coordinates }];
  }

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((coordinates, index) => ({
      label: geometry.coordinates.length > 1 ? `Ring ${index + 1}` : "Boundary",
      coordinates: getOpenRingCoordinates(coordinates),
    }));
  }

  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.map((coordinates, index) => ({
      label: `Route ${index + 1}`,
      coordinates,
    }));
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flatMap((polygon, polygonIndex) =>
      polygon.map((coordinates, ringIndex) => ({
        label: `Polygon ${polygonIndex + 1} · Ring ${ringIndex + 1}`,
        coordinates: getOpenRingCoordinates(coordinates),
      }))
    );
  }

  return [];
}

function getOpenRingCoordinates(coordinates) {
  if (coordinates.length < 2) return coordinates;

  const [firstLongitude, firstLatitude] = coordinates[0];
  const [lastLongitude, lastLatitude] = coordinates[coordinates.length - 1];
  const isClosed = firstLongitude === lastLongitude && firstLatitude === lastLatitude;

  return isClosed ? coordinates.slice(0, -1) : coordinates;
}

export default function CreateProjectPage() {
  const [submitState, setSubmitState] = useState({ loading: false, error: "" });

  const [formData, setFormData] = useState(
    {
  projectId: "DM-2026-METRO",
  projectName: "Delhi Metro Phase IV Extension",
  projectType: "Metro Rail",
  description: "Metro rail network extension to improve urban connectivity, reduce road congestion, and provide efficient public transportation.",
  department: "DMRC",

  state: "Delhi",
  district: "South West Delhi",
  tehsil: "Najafgarh",
  villages: "Dichaon Kalan, Ghuman Hera",

  locationType: "linear",
  latitude: "",
  longitude: "",
  routeLength: "",
  calculatedArea: "",
  geometry: null,
  geometryType: "",

  requiredLandArea: "45",
  unit: "Hectare",
  acquisitionRequirement: "Land acquisition for metro tracks, stations, depots, access roads, and supporting infrastructure.",
  purpose: "Improve public transportation connectivity and reduce travel time for commuters in Delhi.",
  plannedStartDate: "",
  targetCompletionDate: "",
  estimatedProjectCost: "",
  fundingSource: "",
}
);

  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [otherType, setOtherType] = useState("");
  const coordinateGroups = getGeometryCoordinateGroups(formData.geometry);
  const totalCoordinateCount = coordinateGroups.reduce(
    (total, group) => total + group.coordinates.length,
    0
  );

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectId.trim()) {
      newErrors.projectId = "Project ID is required";
    }
    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }
    if (!formData.projectType) {
      newErrors.projectType = "Please select project type";
    }
    if (!formData.state) {
      newErrors.state = "State is required";
    }
    if (!formData.district) {
      newErrors.district = "District is required";
    }
    if (!formData.geometry || !formData.latitude || !formData.longitude) {
      newErrors.location = "Draw and save a project geometry on the map";
    }
    if (!formData.requiredLandArea) {
      newErrors.requiredLandArea = "Required land area is required";
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = "Purpose of land requirement is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files || []);

    const newDocuments = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      type: "Other",
      remark: "",
    }));

    setDocuments((prev) => [...prev, ...newDocuments]);
  };

  const updateDocument = (id, field, value) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              [field]: value,
            }
          : doc
      )
    );
  };

  const deleteDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSubmitState({ loading: true, error: "" });

    const projectPayload = {
      ...formData,
      estimatedProjectCost: formData.estimatedProjectCost === ""
        ? null
        : Number(formData.estimatedProjectCost),
      geometry: formData.geometry?.type === "Feature" ? formData.geometry.geometry : formData.geometry,
      documents,
      status: "Pending LAO Verification",
    };

    try {
      const backendProject = await api.createProject(projectPayload);
      createWorkflowProject(projectPayload, backendProject);
    } catch (error) {
      createWorkflowProject(projectPayload);
      setSubmitState({ loading: false, error: `Backend unavailable. Saved to local demo storage instead. ${error.message}` });
      return;
    }

    setSubmitState({ loading: false, error: "" });
    alert("Project created successfully and saved to the backend.");
  };

  const saveDraft = () => {
    const draft = {
      ...formData,
      documents,
      status: "Draft",
    };

    createWorkflowProject(draft);

    alert("Project draft saved successfully.");
  };

  return (
    <>
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header title="Create Project" />
      <div className="  bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Create Project
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create a new land acquisition project and provide its initial project and location information.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-medium text-slate-700">Project Officer</span>
              <span>•</span>
              <span>New Project</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <nav aria-label="Form sections" className="bg-white px-4 sm:px-8">
        <div className="mx-auto max-w-7xl overflow-x-auto border-b border-slate-200 px-2 py-3">
          <div className="flex min-w-max items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <a
                    href={`#step-${step.id}`}
                    className="flex items-center gap-2 text-left"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="hidden sm:block">
                      <p className="text-xs font-medium text-blue-700">SECTION {step.id}</p>
                      <p className="text-xs font-medium text-slate-700">{step.title}</p>
                    </div>
                  </a>

                  {index < steps.length - 1 && (
                    <div className="mx-3 h-px min-w-4 flex-1 bg-slate-200" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {submitState.error && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {submitState.error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1 */}
            <section id="step-1" className="scroll-mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={<Building2 className="h-5 w-5" />}
                title="Project Information"
                description="Enter the basic information of the project."
              />

              <div className="grid gap-6 p-6 md:grid-cols-2">
                <div>
                  <label className="form-label">
                    Project ID <Required />
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BH-2026-AUTO"
                    value={formData.projectId}
                    onChange={(e) => updateField("projectId", e.target.value)}
                    className={`form-input ${
                      errors.projectId ? "border-red-500" : ""
                    }`}
                  />
                  <ErrorMessage message={errors.projectId} />
                </div>

                <div>
                  <label className="form-label">
                    Project Name <Required />
                  </label>

                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => updateField("projectName", e.target.value)}
                    placeholder="e.g. Delhi–Meerut Highway Expansion"
                    className={`form-input ${
                      errors.projectName ? "border-red-500" : ""
                    }`}
                  />

                  <ErrorMessage message={errors.projectName} />
                </div>

                <div>
                  <label className="form-label">
                    Project Type <Required />
                  </label>

                  <select
                    value={formData.projectType}
                    onChange={(e) => updateField("projectType", e.target.value)}
                    className={`form-input ${
                      errors.projectType ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select project type</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  {formData.projectType === "Other" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Enter the project type"
                        value={otherType}
                        onChange={(e) => setOtherType(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  )}

                  <ErrorMessage message={errors.projectType} />
                </div>

                <div>
                  <label className="form-label">Department / Agency</label>

                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => updateField("department", e.target.value)}
                    placeholder="e.g. PWD / NHAI / State Department"
                    className="form-input"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Project Description</label>

                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Briefly describe the project, its scope and objective..."
                    className="form-input resize-none"
                  />

                  <p className="form-help">
                    Provide a short description that helps the LAO understand the project context.
                  </p>
                </div>
              </div>
            </section>

          {/* STEP 2 */}
            <section id="step-2" className="scroll-mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={<MapPin className="h-5 w-5" />}
                title="Administrative Location"
                description="Specify the administrative area covered by the project."
              />

              <div className="grid gap-6 p-6 md:grid-cols-2">
                <div>
                  <label className="form-label">
                    State <Required />
                  </label>

                  <select
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="form-input"
                  >
                    <option value="Delhi">Delhi</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Maharashtra">Maharashtra</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    District <Required />
                  </label>

                  <select
                    value={formData.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    className="form-input"
                  >
                    <option value="Delhi">Delhi</option>
                    <option value="Ghaziabad">Ghaziabad</option>
                    <option value="Gurugram">Gurugram</option>
                    <option value="Meerut">Meerut</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Tehsil / Taluk</label>

                  <input
                    type="text"
                    value={formData.tehsil}
                    onChange={(e) => updateField("tehsil", e.target.value)}
                    placeholder="Enter tehsil / taluk"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Village(s)</label>

                  <input
                    type="text"
                    value={formData.villages}
                    onChange={(e) => updateField("villages", e.target.value)}
                    placeholder="e.g. Village A, Village B"
                    className="form-input"
                  />

                  <p className="form-help">
                    Multiple villages can be entered if the project spans multiple villages.
                  </p>
                </div>
              </div>
            </section>

          {/* STEP 3 */}
            <section id="step-3" className="scroll-mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={<MapPin className="h-5 w-5" />}
                title="Project Location / GIS"
                description="Define the project area or route using the interactive map."
              />

              <div className="space-y-6 p-6">
                <div>
                  <label className="form-label">
                    Project Location Type <Required />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label
                      className={`cursor-pointer rounded-lg border p-4 ${
                        formData.locationType === "area"
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="locationType"
                        value="area"
                        checked={formData.locationType === "area"}
                        onChange={(e) => updateField("locationType", e.target.value)}
                        className="sr-only"
                      />

                      <div className="flex items-start gap-3">
                        <LandPlot className="mt-0.5 h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-900">Area Project</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Draw a polygon to define the project area.
                          </p>
                        </div>
                      </div>
                    </label>

                    <label
                      className={`cursor-pointer rounded-lg border p-4 ${
                        formData.locationType === "linear"
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="locationType"
                        value="linear"
                        checked={formData.locationType === "linear"}
                        onChange={(e) => updateField("locationType", e.target.value)}
                        className="sr-only"
                      />

                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-900">
                            Linear / Corridor Project
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Draw a route or polyline for roads, railways, pipelines, etc.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Project Map Location <Required />
                  </label>

                  <div className="relative h-105 overflow-hidden rounded-xl border border-slate-300 bg-slate-100">
                    <CreateProjectMap
                      isLinear={formData.locationType === "linear"}
                      onGeometryChange={(geometryData) =>
                        setFormData((previous) => ({ ...previous, ...geometryData }))
                      }
                    />
                  </div>

                  <ErrorMessage message={errors.location} />
                </div>

                {/* Coordinates */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className="form-label">
                      {formData.locationType === "area"
                        ? "Calculated Area (Ha)"
                        : "Route Length (km)"}
                    </label>
                    <input
                      type="text"
                      value={
                        formData.locationType === "area"
                          ? formData.calculatedArea
                          : formData.routeLength
                      }
                      readOnly
                      placeholder="Calculated from map"
                      className="form-input bg-slate-50"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  Geometry: <strong>{formData.geometryType || "Not drawn"}</strong>
                </div>

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Drawn Coordinates</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Coordinates are listed in latitude and longitude order.
                      </p>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {totalCoordinateCount} {totalCoordinateCount === 1 ? "point" : "points"}
                    </span>
                  </div>

                  {totalCoordinateCount === 0 ? (
                    <p className="px-4 py-5 text-sm text-slate-500">
                      Draw a route or boundary on the map to see its coordinates here.
                    </p>
                  ) : (
                    <div className="max-h-72 overflow-auto">
                      {coordinateGroups.map((group, groupIndex) => (
                        <div key={`${group.label}-${groupIndex}`}>
                          {coordinateGroups.length > 1 && (
                            <h4 className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
                              {group.label}
                            </h4>
                          )}
                          <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-white text-slate-500 shadow-sm">
                              <tr>
                                <th className="px-4 py-2 font-medium">Point</th>
                                <th className="px-4 py-2 font-medium">Latitude</th>
                                <th className="px-4 py-2 font-medium">Longitude</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {group.coordinates.map(([longitude, latitude], pointIndex) => (
                                <tr key={`${groupIndex}-${pointIndex}`} className="text-slate-700">
                                  <td className="px-4 py-2 font-medium">{pointIndex + 1}</td>
                                  <td className="px-4 py-2 tabular-nums">{latitude.toFixed(6)}</td>
                                  <td className="px-4 py-2 tabular-nums">{longitude.toFixed(6)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                  <strong>GIS note:</strong> The geometry entered here represents the project boundary or route. It does not create or modify official cadastral parcel boundaries.
                </div>
              </div>
            </section>

          {/* STEP 4 */}
            <section id="step-4" className="scroll-mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={<LandPlot className="h-5 w-5" />}
                title="Land Requirement"
                description="Provide the estimated land requirement for the project."
              />

              <div className="grid gap-6 p-6 md:grid-cols-2">
                <div>
                  <label className="form-label">
                    Required Land Area <Required />
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.requiredLandArea}
                    onChange={(e) => updateField("requiredLandArea", e.target.value)}
                    placeholder="Enter required land area"
                    className={`form-input ${
                      errors.requiredLandArea ? "border-red-500" : ""
                    }`}
                  />

                  <ErrorMessage message={errors.requiredLandArea} />
                </div>

                <div>
                  <label className="form-label">
                    Unit <Required />
                  </label>

                  <select
                    value={formData.unit}
                    onChange={(e) => updateField("unit", e.target.value)}
                    className="form-input"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Estimated Acquisition Requirement</label>

                  <input
                    type="text"
                    value={formData.acquisitionRequirement}
                    onChange={(e) => updateField("acquisitionRequirement", e.target.value)}
                    placeholder="e.g. Approx. 125 hectares"
                    className="form-input"
                  />

                  <p className="form-help">
                    This is an initial project estimate. Actual parcels will be verified by the LAO.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">
                    Purpose of Land Requirement <Required />
                  </label>

                  <textarea
                    rows={5}
                    value={formData.purpose}
                    onChange={(e) => updateField("purpose", e.target.value)}
                    placeholder="Explain why the land is required for the project..."
                    className={`form-input resize-none ${
                      errors.purpose ? "border-red-500" : ""
                    }`}
                  />

                  <ErrorMessage message={errors.purpose} />
                </div>

                <div className="md:col-span-2 border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-semibold text-slate-900">Project Planning & Funding</h3>
                  <p className="mt-1 text-xs text-slate-500">Optional schedule and funding details for project review.</p>
                </div>

                <div>
                  <label className="form-label">Planned Start Date</label>
                  <input
                    type="date"
                    value={formData.plannedStartDate}
                    onChange={(event) => updateField("plannedStartDate", event.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Target Completion Date</label>
                  <input
                    type="date"
                    min={formData.plannedStartDate || undefined}
                    value={formData.targetCompletionDate}
                    onChange={(event) => updateField("targetCompletionDate", event.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Estimated Project Cost (INR)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimatedProjectCost}
                    onChange={(event) => updateField("estimatedProjectCost", event.target.value)}
                    placeholder="Enter estimated project cost"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Funding Source</label>
                  <input
                    type="text"
                    value={formData.fundingSource}
                    onChange={(event) => updateField("fundingSource", event.target.value)}
                    placeholder="e.g. State budget, central scheme, PPP"
                    className="form-input"
                  />
                </div>

                <div className="md:col-span-2 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                  <strong>Important:</strong> Land requirement entered by the Project Officer is preliminary project information. Parcel verification, ownership, compensation, legal disputes and acquisition case details are maintained by the LAO.
                </div>
              </div>
            </section>

          {/* STEP 5 */}
            <section id="step-5" className="scroll-mt-6 space-y-6">
              {/* Documents Upload */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  icon={<FileText className="h-5 w-5" />}
                  title="Project Documents"
                  description="Upload supporting project documents."
                />

                <div className="p-6">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:bg-slate-100 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400" />
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      Upload project documents
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      PDF, DOC, DOCX, XLS, XLSX up to 10 MB per file
                    </p>
                    <span className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                      Choose Files
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {documents.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {documents.map((document) => (
                        <div
                          key={document.id}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="rounded-lg bg-slate-100 p-2">
                                <FileText className="h-5 w-5 text-slate-600" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-800">
                                  {document.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {(document.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteDocument(document.id)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="form-label">Document Type</label>
                              <select
                                value={document.type}
                                onChange={(e) =>
                                  updateDocument(document.id, "type", e.target.value)
                                }
                                className="form-input"
                              >
                                {documentTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="form-label">Remark</label>
                              <input
                                type="text"
                                value={document.remark}
                                onChange={(e) =>
                                  updateDocument(document.id, "remark", e.target.value)
                                }
                                placeholder="Add optional remarks..."
                                className="form-input"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Review Summary */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  title="Review Information"
                  description="Verify project details before submission."
                />

                <div className="divide-y divide-slate-100 p-6 text-sm">
                  <div className="py-3 grid grid-cols-3">
                    <span className="font-medium text-slate-500">Project Name</span>
                    <span className="col-span-2 font-medium text-slate-900">
                      {formData.projectName || "—"}
                    </span>
                  </div>

                  <div className="py-3 grid grid-cols-3">
                    <span className="font-medium text-slate-500">Project Type</span>
                    <span className="col-span-2 font-medium text-slate-900">
                      {formData.projectType || "—"}
                    </span>
                  </div>

                  <div className="py-3 grid grid-cols-3">
                    <span className="font-medium text-slate-500">Location</span>
                    <span className="col-span-2 font-medium text-slate-900">
                      {formData.district}, {formData.state} | Lat: {formData.latitude}, Lng:{" "}
                      {formData.longitude}
                    </span>
                  </div>

                  <div className="py-3 grid grid-cols-3">
                    <span className="font-medium text-slate-500">Land Requirement</span>
                    <span className="col-span-2 font-medium text-slate-900">
                      {formData.requiredLandArea} {formData.unit}
                    </span>
                  </div>

                  {formData.plannedStartDate && (
                    <div className="py-3 grid grid-cols-3">
                      <span className="font-medium text-slate-500">Planned Start</span>
                      <span className="col-span-2 font-medium text-slate-900">{formData.plannedStartDate}</span>
                    </div>
                  )}

                  {formData.targetCompletionDate && (
                    <div className="py-3 grid grid-cols-3">
                      <span className="font-medium text-slate-500">Target Completion</span>
                      <span className="col-span-2 font-medium text-slate-900">{formData.targetCompletionDate}</span>
                    </div>
                  )}

                  {formData.estimatedProjectCost !== "" && (
                    <div className="py-3 grid grid-cols-3">
                      <span className="font-medium text-slate-500">Estimated Cost</span>
                      <span className="col-span-2 font-medium text-slate-900">INR {Number(formData.estimatedProjectCost).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {formData.fundingSource && (
                    <div className="py-3 grid grid-cols-3">
                      <span className="font-medium text-slate-500">Funding Source</span>
                      <span className="col-span-2 font-medium text-slate-900">{formData.fundingSource}</span>
                    </div>
                  )}

                  <div className="py-3 grid grid-cols-3">
                    <span className="font-medium text-slate-500">Documents</span>
                    <span className="col-span-2 font-medium text-slate-900">
                      {documents.length} document(s) uploaded
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>

                <button
  type="submit"
  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-sm hover:bg-blue-700"
>
  Submit Project
</button>
              </div>
            </section>

        </form>
      </main>
    </div>
    </>
  );
}
