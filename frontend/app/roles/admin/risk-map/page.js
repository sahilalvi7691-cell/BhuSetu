"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import nextDynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
const Circle = nextDynamic(() => import("react-leaflet").then((module) => module.Circle), { ssr: false });
const MapContainer = nextDynamic(() => import("react-leaflet").then((module) => module.MapContainer), { ssr: false });
const Marker = nextDynamic(() => import("react-leaflet").then((module) => module.Marker), { ssr: false });
const Polygon = nextDynamic(() => import("react-leaflet").then((module) => module.Polygon), { ssr: false });
const Polyline = nextDynamic(() => import("react-leaflet").then((module) => module.Polyline), { ssr: false });
const Popup = nextDynamic(() => import("react-leaflet").then((module) => module.Popup), { ssr: false });
const TileLayer = nextDynamic(() => import("react-leaflet").then((module) => module.TileLayer), { ssr: false });
import "leaflet/dist/leaflet.css";
import {
  ArrowRight,
  Filter,
  Fullscreen,
  Landmark,
  Layers3,
  LocateFixed,
  MapPinned,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Header } from "@/app/component/layout/index";
import { api, mergeProjectCollections } from "@/lib/api";
import {
  PROJECTS,
  districtOptions,
  projectTypeOptions,
  riskOptions,
  statusOptions,
} from "../../project-officer/my-project/projects-data";

export { PROJECTS, districtOptions, projectTypeOptions, riskOptions, statusOptions };

export const riskColors = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
  "N/A": "#94a3b8",
};

export const riskTone = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Critical: "border-red-200 bg-red-50 text-red-700",
  "N/A": "border-slate-200 bg-slate-100 text-slate-600",
};

export const layerOptions = [
  { id: "markers", label: "Project markers", active: true },
  { id: "routes", label: "Routes / buffers", active: true },
  { id: "parcels", label: "Cadastral parcels", active: true },
  { id: "riskZones", label: "Risk zones", active: true },
];

const interventionOptions = ["All", "Yes", "No"];

export const hasValidProjectCoordinates = (project) => {
  const latitude = Number(project?.coordinates?.latitude);
  const longitude = Number(project?.coordinates?.longitude);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

export const safeNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const getRiskTrend = (project) => {
  if (project.riskProbability >= 75) return "Increasing";
  if (project.riskProbability <= 35) return "Decreasing";
  return "Stable";
};

export const getInterventionStatus = (project) => {
  if (["Under Acquisition", "Pending LAO Verification", "On Hold"].includes(project.status)) {
    return "Yes";
  }

  return "No";
};

export const getAcquisitionProgress = (project) => {
  switch (project.status) {
    case "Completed":
      return 100;
    case "Under Acquisition":
      return 68;
    case "Pending LAO Verification":
      return 51;
    case "On Hold":
      return 35;
    case "Draft":
      return 18;
    default:
      return Math.max(15, Math.min(92, project.riskProbability ?? 20));
  }
};

export const isLinearProject = (type) => ["Highway", "Railway", "Metro", "Road"].includes(type);

export const getProjectGeometry = (project) => {
  const latitude = safeNumber(project?.coordinates?.latitude);
  const longitude = safeNumber(project?.coordinates?.longitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  if (isLinearProject(project.type)) {
    const route = [
      [latitude - 0.12, longitude - 0.18],
      [latitude - 0.05, longitude - 0.02],
      [latitude + 0.05, longitude + 0.18],
      [latitude + 0.12, longitude + 0.28],
    ];
    const bufferCenter = [
      (route[0][0] + route[route.length - 1][0]) / 2,
      (route[0][1] + route[route.length - 1][1]) / 2,
    ];

    return {
      point: [latitude, longitude],
      polygon: null,
      route,
      bufferCenter,
      bufferRadius: Math.max(6000, (project.riskProbability ?? 30) * 180),
    };
  }

  const delta = 0.12;
  return {
    point: [latitude, longitude],
    polygon: [
      [latitude + delta, longitude - delta],
      [latitude + delta, longitude + delta],
      [latitude - delta, longitude + delta],
      [latitude - delta, longitude - delta],
    ],
    route: null,
    bufferCenter: [latitude, longitude],
    bufferRadius: Math.max(5000, (project.riskProbability ?? 30) * 160),
  };
};

export const createMarkerIcon = (project, selected = false) =>
  typeof window === "undefined" ? undefined : require("leaflet").divIcon({
    className: "map-project-marker",
    html: `<span style="display:flex; align-items:center; justify-content:center; width:${selected ? 22 : 18}px; height:${selected ? 22 : 18}px; border-radius:50%; background:${riskColors[project.riskCategory] || riskColors["N/A"]}; border:3px solid white; box-shadow:0 4px 12px rgba(15,23,42,0.18);"></span>`,
    iconSize: [selected ? 22 : 18, selected ? 22 : 18],
    iconAnchor: [selected ? 11 : 9, selected ? 11 : 9],
  });

export const createClusterIcon = (count, selected = false) =>
  typeof window === "undefined" ? undefined : require("leaflet").divIcon({
    className: "map-cluster-marker",
    html: `<span style="display:flex; align-items:center; justify-content:center; width:${selected ? 34 : 28}px; height:${selected ? 34 : 28}px; border-radius:50%; background:#fff; color:#0f172a; border:2px solid #cbd5e1; font-size:11px; font-weight:700; box-shadow:0 6px 18px rgba(15,23,42,0.12);">${count}</span>`,
    iconSize: [selected ? 34 : 28, selected ? 34 : 28],
    iconAnchor: [selected ? 17 : 14, selected ? 17 : 14],
  });

export const getClusteredProjects = (projects) => {
  const validProjects = projects.filter((project) => getProjectGeometry(project));

  if (validProjects.length <= 8) {
    return validProjects.map((project) => ({
      center: getProjectGeometry(project).point,
      projects: [project],
    }));
  }

  const clusters = [];

  validProjects.forEach((project) => {
    const geometry = getProjectGeometry(project);
    const point = geometry.point;
    let cluster = clusters.find((item) => {
      const distance = Math.hypot(item.center[0] - point[0], item.center[1] - point[1]);
      return distance < 0.65;
    });

    if (!cluster) {
      cluster = { center: point, projects: [] };
      clusters.push(cluster);
    }

    cluster.projects.push(project);
  });

  return clusters;
};

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export default function Page() {
  const mapRef = useRef(null);
  const mapShellRef = useRef(null);
  const [districtFilter, setDistrictFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [interventionFilter, setInterventionFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectSource, setProjectSource] = useState(PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECTS[0]?.id ?? null);
  const [visibleLayers, setVisibleLayers] = useState({
    markers: true,
    routes: true,
    parcels: true,
    riskZones: true,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    api.listProjects().then((projects) => setProjectSource((current) => mergeProjectCollections(current, projects))).catch(() => {});
  }, []);

  const scopedProjects = useMemo(
    () => projectSource.filter((project) => hasValidProjectCoordinates(project)),
    [projectSource]
  );

  const filteredProjects = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    return scopedProjects.filter((project) => {
      const matchesDistrict = districtFilter === "All" || project.district === districtFilter;
      const matchesType = typeFilter === "All" || project.type === typeFilter;
      const matchesRisk = riskFilter === "All" || project.riskCategory === riskFilter;
      const matchesStatus = statusFilter === "All" || project.status === statusFilter;
      const projectIntervention = getInterventionStatus(project);
      const matchesIntervention = interventionFilter === "All" || projectIntervention === interventionFilter;
      const matchesSearch =
        !normalized ||
        [project.name, project.projectId, project.district, project.type, project.village]
          .join(" ")
          .toLowerCase()
          .includes(normalized);

      return matchesDistrict && matchesType && matchesRisk && matchesStatus && matchesIntervention && matchesSearch;
    });
  }, [districtFilter, interventionFilter, riskFilter, scopedProjects, searchQuery, statusFilter, typeFilter]);

  useEffect(() => {
    if (!filteredProjects.length) {
      setSelectedProjectId(null);
      return;
    }

    if (!filteredProjects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(filteredProjects[0].id);
    }
  }, [filteredProjects, selectedProjectId]);

  const selectedProject =
    filteredProjects.find((project) => project.id === selectedProjectId) ?? filteredProjects[0] ?? null;

  const hasCadastralData = useMemo(
    () =>
      scopedProjects.some(
        (project) =>
          Array.isArray(project.cadastralParcels) && project.cadastralParcels.length > 0
      ),
    [scopedProjects]
  );

  const projectCount = filteredProjects.length;
  const highRiskCount = filteredProjects.filter((project) => ["High", "Critical"].includes(project.riskCategory)).length;

  const resetMapView = () => {
    if (!mapRef.current || !filteredProjects.length) return;

    const points = filteredProjects.flatMap((project) => {
      const geometry = getProjectGeometry(project);
      if (!geometry) return [];

      if (geometry.route) return [...geometry.route, geometry.point];
      if (geometry.polygon) return [...geometry.polygon, geometry.point];
      return [geometry.point];
    });

    if (points.length) {
      mapRef.current.fitBounds(points, { padding: [30, 30], maxZoom: 6 });
    }
  };

  const toggleLayer = (layerId) => {
    setVisibleLayers((current) => ({
      ...current,
      [layerId]: !current[layerId],
    }));
  };

  const resetFilters = () => {
    setDistrictFilter("All");
    setTypeFilter("All");
    setRiskFilter("All");
    setStatusFilter("All");
    setInterventionFilter("All");
    setSearchQuery("");
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const handleMapZoom = (direction) => {
    if (!mapRef.current) return;
    if (direction === "in") mapRef.current.zoomIn();
    else mapRef.current.zoomOut();
  };

  const handleFullscreen = async () => {
    const container = mapShellRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen toggle failed:", error);
    }
  };

  const clusterGroups = useMemo(() => getClusteredProjects(filteredProjects), [filteredProjects]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header title="GIS Risk Map" />

      <main className="mx-auto max-w-[1800px] px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Decision support map</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">BhuSetu GIS risk map</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                {scopedProjects.length
                  ? `Live project coverage: ${Math.round((projectCount / scopedProjects.length) * 100)}%`
                  : "Live project coverage: 0%"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                <Landmark className="h-3.5 w-3.5" />
                {hasCadastralData ? "Authorized parcel GIS available" : "Cadastral GIS data unavailable"}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <FilterSelect label="District" value={districtFilter} onChange={setDistrictFilter} options={["All", ...districtOptions]} />
            </div>
            <div className="lg:col-span-1">
              <FilterSelect label="Project Type" value={typeFilter} onChange={setTypeFilter} options={["All", ...projectTypeOptions.filter((item) => item !== "All")]} />
            </div>
            <div className="lg:col-span-1">
              <FilterSelect label="Risk Category" value={riskFilter} onChange={setRiskFilter} options={["All", ...riskOptions.filter((item) => item !== "All")]} />
            </div>
            <div className="lg:col-span-1">
              <FilterSelect label="Project Status" value={statusFilter} onChange={setStatusFilter} options={["All", ...statusOptions.filter((item) => item !== "All")]} />
            </div>
            <div className="lg:col-span-1">
              <FilterSelect label="Intervention" value={interventionFilter} onChange={setInterventionFilter} options={interventionOptions} />
            </div>
            <div className="lg:col-span-6">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-slate-500">Search</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search project, district, type or village"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <Filter className="h-4 w-4" />
                Reset filters
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <MapPinned className="h-4 w-4" />
                Active projects
              </div>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handleMapZoom("out")} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100" aria-label="Zoom out">
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => handleMapZoom("in")} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100" aria-label="Zoom in">
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={resetMapView} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100" aria-label="Reset map">
                  <LocateFixed className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={handleFullscreen} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100" aria-label="Toggle fullscreen">
                  <Fullscreen className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div ref={mapShellRef} className="relative z-0 h-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <MapContainer
                center={[23.0, 78.0]}
                zoom={5}
                scrollWheelZoom
                className="relative z-0 h-full w-full"
                attributionControl={false}
                style={{ overscrollBehavior: "contain", zIndex: 1 }}
                whenReady={(event) => {
                  mapRef.current = event.target;
                  resetMapView();
                }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {filteredProjects.map((project) => {
                  const geometry = getProjectGeometry(project);
                  if (!geometry) return null;

                  const projectRisk = riskColors[project.riskCategory] || riskColors["N/A"];

                  return (
                    <div key={project.id}>
                      {visibleLayers.riskZones && (
                        <Circle
                          center={geometry.point}
                          radius={Math.max(15000, (project.riskProbability ?? 30) * 750)}
                          pathOptions={{
                            color: projectRisk,
                            fillColor: projectRisk,
                            fillOpacity: 0.1,
                            weight: 1,
                          }}
                        />
                      )}

                      {visibleLayers.routes && isLinearProject(project.type) && geometry.route && (
                        <>
                          <Polyline
                            positions={geometry.route}
                            pathOptions={{
                              color: projectRisk,
                              weight: 4,
                              opacity: 0.8,
                            }}
                            eventHandlers={{
                              click: () => setSelectedProjectId(project.id),
                            }}
                          />
                          <Circle
                            center={geometry.bufferCenter}
                            radius={geometry.bufferRadius}
                            pathOptions={{
                              color: projectRisk,
                              fillColor: projectRisk,
                              fillOpacity: 0.06,
                              weight: 1,
                            }}
                          />
                        </>
                      )}

                      {visibleLayers.routes && !isLinearProject(project.type) && geometry.polygon && (
                        <Polygon
                          positions={geometry.polygon}
                          pathOptions={{
                            color: projectRisk,
                            fillColor: projectRisk,
                            fillOpacity: 0.16,
                            weight: 2,
                          }}
                          eventHandlers={{
                            click: () => setSelectedProjectId(project.id),
                          }}
                        />
                      )}

                      {visibleLayers.parcels && Array.isArray(project.cadastralParcels) && project.cadastralParcels.length > 0 && (
                        <>
                          {project.cadastralParcels
                            .filter((parcel) => Array.isArray(parcel?.candidate) && parcel.candidate.length > 0)
                            .map((parcel, index) => (
                              <Polygon
                                key={`${project.id}-candidate-${index}`}
                                positions={parcel.candidate}
                                pathOptions={{
                                  color: "#f59e0b",
                                  fillColor: "#f59e0b",
                                  fillOpacity: 0.12,
                                  weight: 1,
                                }}
                              />
                            ))}
                          {project.cadastralParcels
                            .filter((parcel) => Array.isArray(parcel?.verified) && parcel.verified.length > 0)
                            .map((parcel, index) => (
                              <Polygon
                                key={`${project.id}-verified-${index}`}
                                positions={parcel.verified}
                                pathOptions={{
                                  color: "#16a34a",
                                  fillColor: "#16a34a",
                                  fillOpacity: 0.12,
                                  weight: 1,
                                }}
                              />
                            ))}
                        </>
                      )}

                      {visibleLayers.markers && (
                        <Marker
                          position={geometry.point}
                          icon={createMarkerIcon(project, selectedProject?.id === project.id)}
                          eventHandlers={{
                            click: () => setSelectedProjectId(project.id),
                          }}
                        >
                          <Popup>
                            <div className="min-w-[180px] text-sm text-slate-700">
                              <div className="font-semibold text-slate-800">{project.name}</div>
                              <div className="mt-1 text-xs text-slate-500">{project.projectId}</div>
                              <div className="mt-2 text-xs">
                                <span className="font-medium text-slate-500">Risk:</span>{" "}
                                <span className="font-semibold" style={{ color: projectRisk }}>
                                  {project.riskCategory}
                                </span>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </div>
                  );
                })}

                {clusterGroups
                  .filter((cluster) => cluster.projects.length > 1)
                  .map((cluster) => {
                    const selected = cluster.projects.some((project) => project.id === selectedProjectId);
                    const combinedRisk = cluster.projects.reduce(
                      (highest, project) => Math.max(highest, project.riskProbability ?? 0),
                      0
                    );

                    return (
                      <Marker
                        key={`cluster-${cluster.projects.map((project) => project.id).join("-")}`}
                        position={cluster.center}
                        icon={createClusterIcon(cluster.projects.length, selected)}
                        eventHandlers={{
                          click: () => setSelectedProjectId(cluster.projects[0].id),
                        }}
                      >
                        <Popup>
                          <div className="min-w-[180px] text-sm text-slate-700">
                            <div className="font-semibold text-slate-800">{cluster.projects.length} projects</div>
                            <div className="mt-2 space-y-1">
                              {cluster.projects.slice(0, 3).map((project) => (
                                <div key={project.id} className="text-xs text-slate-600">
                                  {project.projectId} • {project.riskCategory}
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-xs font-medium text-slate-500">
                              Max AI risk: {combinedRisk}%
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
              </MapContainer>

              <div className="absolute right-3 top-3 z-[500] flex flex-col gap-2">
                <button type="button" onClick={() => handleMapZoom("in")} className="rounded-lg border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-sm transition hover:bg-slate-100" aria-label="Zoom in">
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleMapZoom("out")} className="rounded-lg border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-sm transition hover:bg-slate-100" aria-label="Zoom out">
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button type="button" onClick={resetMapView} className="rounded-lg border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-sm transition hover:bg-slate-100" aria-label="Reset map">
                  <LocateFixed className="h-4 w-4" />
                </button>
                <button type="button" onClick={handleFullscreen} className="rounded-lg border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-sm transition hover:bg-slate-100" aria-label="Toggle fullscreen">
                  <Fullscreen className="h-4 w-4" />
                </button>
                {isFullscreen && (
                  <button type="button" onClick={() => document.exitFullscreen()} className="rounded-lg border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-sm transition hover:bg-slate-100" aria-label="Exit fullscreen">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Map controls</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">Layers</h2>
              </div>
              <Layers3 className="h-5 w-5 text-slate-500" />
            </div>

            <div className="mt-4 space-y-2">
              {layerOptions.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => toggleLayer(layer.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                    visibleLayers[layer.id] ? "border-slate-200 bg-slate-50 text-slate-700" : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  <span>{layer.label}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${visibleLayers[layer.id] ? "bg-emerald-500" : "bg-slate-300"}`} />
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <span>Portfolio summary</span>
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span>Visible projects</span>
                  <span className="font-semibold text-slate-900">{projectCount}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>High / Critical</span>
                  <span className="font-semibold text-slate-900">{highRiskCount}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Intervention queue</span>
                  <span className="font-semibold text-slate-900">
                    {filteredProjects.filter((project) => getInterventionStatus(project) === "Yes").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Legend</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {Object.entries(riskColors).map(([label, color]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                      <span>{label}</span>
                    </div>
                    <span className="text-xs text-slate-500">{label === "N/A" ? "—" : "Active"}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {selectedProject && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-slate-900">{selectedProject.name}</h3>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${riskTone[selectedProject.riskCategory] || riskTone["N/A"]}`}>
                      {selectedProject.riskCategory}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{selectedProject.projectId} • {selectedProject.district}</p>
                </div>
              </div>

              <Link
                href={`/projects/${selectedProject.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                View Details
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Project Name</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedProject.name}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Project ID</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedProject.projectId}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Type</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedProject.type}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">District</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedProject.district}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Required Land Area</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedProject.requiredLandArea} {selectedProject.landUnit}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Acquisition Progress</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{getAcquisitionProgress(selectedProject)}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Process Status</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedProject.status}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">AI Risk %</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedProject.riskProbability}%</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Risk Category</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedProject.riskCategory}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Risk Trend</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{getRiskTrend(selectedProject)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Intervention Status</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{getInterventionStatus(selectedProject)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Last Updated</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedProject.updatedAt}</p>
              </div>
            </div>
          </section>
        )}

        {filteredProjects.length === 0 && (
          <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <p className="text-xl font-semibold text-slate-900">No projects match the selected filters.</p>
            <p className="mt-2 text-sm text-slate-500">Please adjust the district, type, risk or status filters to continue the GIS review.</p>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Cadastral GIS note</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Read-only parcel state</h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {hasCadastralData
              ? "Authorized cadastral parcels are available for the current project set and are shown as read-only overlays without allowing any edits to official parcel boundaries."
              : "Cadastral GIS data unavailable. Project geometry and risk overlays remain visible for monitoring, while official parcel boundaries remain unchanged and unavailable in this environment."}
          </p>
        </section>
      </main>
    </div>
  );
}
