"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { ArrowRight, ExternalLink, Layers3, LocateFixed, MapPinned, ZoomIn, ZoomOut } from "lucide-react";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });
const Polygon = dynamic(() => import("react-leaflet").then((mod) => mod.Polygon), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const fallbackRiskColors = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
  "N/A": "#94a3b8",
};

const fallbackRiskTone = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Critical: "border-red-200 bg-red-50 text-red-700",
  "N/A": "border-slate-200 bg-slate-100 text-slate-600",
};

const gis = () => {
  const mapRef = useRef(null);
  const [gismap, setGisMap] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [visibleLayers, setVisibleLayers] = useState({
    markers: true,
    routes: true,
    parcels: true,
    riskZones: true,
  });

  useEffect(() => {
    let active = true;

    import("../../risk-map/page")
      .then((mod) => {
        if (active) {
          setGisMap(mod);
          setSelectedProjectId(mod.PROJECTS?.[0]?.id ?? null);
        }
      })
      .catch(() => {
        if (active) setGisMap(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const PROJECTS = gismap?.PROJECTS ?? [];
  const riskColors = gismap?.riskColors ?? fallbackRiskColors;
  const riskTone = gismap?.riskTone ?? fallbackRiskTone;
  const createMarkerIcon = gismap?.createMarkerIcon ?? (() => null);
  const createClusterIcon = gismap?.createClusterIcon ?? (() => null);
  const getAcquisitionProgress = gismap?.getAcquisitionProgress ?? (() => 0);
  const getClusteredProjects =
    gismap?.getClusteredProjects ??
    ((items) => items.map((project) => ({ center: gismap?.getProjectGeometry?.(project)?.point ?? [0, 0], projects: [project] })));
  const getInterventionStatus = gismap?.getInterventionStatus ?? (() => "No");
  const getProjectGeometry = gismap?.getProjectGeometry ?? (() => null);
  const getRiskTrend = gismap?.getRiskTrend ?? (() => "Stable");
  const hasValidProjectCoordinates = gismap?.hasValidProjectCoordinates ?? (() => true);
  const isLinearProject = gismap?.isLinearProject ?? (() => false);

  const scopedProjects = useMemo(
    () => PROJECTS.filter((project) => hasValidProjectCoordinates(project)),
    [PROJECTS, hasValidProjectCoordinates]
  );

  const clusterGroups = useMemo(() => getClusteredProjects(scopedProjects), [getClusteredProjects, scopedProjects]);

  const selectedProject = useMemo(
    () => scopedProjects.find((project) => project.id === selectedProjectId) ?? scopedProjects[0] ?? null,
    [scopedProjects, selectedProjectId]
  );

  useEffect(() => {
    if (!scopedProjects.length) return;
    if (!selectedProjectId || !scopedProjects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(scopedProjects[0].id);
    }
  }, [scopedProjects, selectedProjectId]);

  const resetMapView = () => {
    if (!mapRef.current || !scopedProjects.length) return;

    const points = scopedProjects.flatMap((project) => {
      const geometry = getProjectGeometry(project);
      if (!geometry) return [];
      if (geometry.route) return [...geometry.route, geometry.point];
      if (geometry.polygon) return [...geometry.polygon, geometry.point];
      return [geometry.point];
    });

    if (points.length) {
      mapRef.current.fitBounds(points, { padding: [24, 24], maxZoom: 6 });
    }
  };

  const handleMapZoom = (direction) => {
    if (!mapRef.current) return;
    if (direction === "in") mapRef.current.zoomIn();
    else mapRef.current.zoomOut();
  };

  const toggleLayer = (layerId) => {
    setVisibleLayers((current) => ({ ...current, [layerId]: !current[layerId] }));
  };

  if (!gismap) {
    return (
      <section className="dashboard-card">
        <div className="panel-header">
          <div>
            <p className="section-kicker">Spatial view</p>
            <h2>Mini GIS Risk Map</h2>
          </div>
          <span className="section-badge">Loading</span>
        </div>
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
          Loading GIS map…
        </div>
      </section>
    );
  }

  if (!scopedProjects.length) {
    return (
      <section className="dashboard-card">
        <div className="panel-header">
          <div>
            <p className="section-kicker">Spatial view</p>
            <h2>Mini GIS Risk Map</h2>
          </div>
          <span className="section-badge">No data</span>
        </div>
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
          No valid project geometry available for the current role.
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-card">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Spatial view</p>
          <h2>Mini GIS Risk Map</h2>
        </div>
        <Link
          href="/roles/nodal-officer/risk-map"
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100"
        >
          Open Risk Map
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <MapPinned className="h-3.5 w-3.5" />
            Live GIS
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => handleMapZoom("out")} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100" aria-label="Zoom out">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => handleMapZoom("in")} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100" aria-label="Zoom in">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={resetMapView} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100" aria-label="Reset map view">
              <LocateFixed className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="relative h-[280px] w-full">
          <MapContainer
            center={[23.0, 78.0]}
            zoom={5}
            scrollWheelZoom
            className="h-full w-full"
            attributionControl={false}
            style={{ zIndex: 1 }}
            whenReady={(event) => {
              mapRef.current = event.target;
              resetMapView();
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {scopedProjects.map((project) => {
              const geometry = getProjectGeometry(project);
              if (!geometry) return null;

              const projectRiskColor = riskColors[project.riskCategory] || riskColors["N/A"];

              return (
                <div key={project.id}>
                  {visibleLayers.riskZones && (
                    <Circle
                      center={geometry.point}
                      radius={Math.max(12000, (project.riskProbability ?? 30) * 650)}
                      pathOptions={{
                        color: projectRiskColor,
                        fillColor: projectRiskColor,
                        fillOpacity: 0.1,
                        weight: 1,
                      }}
                    />
                  )}

                  {visibleLayers.routes && isLinearProject(project.type) && geometry.route && (
                    <>
                      <Polyline
                        positions={geometry.route}
                        pathOptions={{ color: projectRiskColor, weight: 3, opacity: 0.85 }}
                        eventHandlers={{ click: () => setSelectedProjectId(project.id) }}
                      />
                      <Circle
                        center={geometry.bufferCenter}
                        radius={geometry.bufferRadius}
                        pathOptions={{
                          color: projectRiskColor,
                          fillColor: projectRiskColor,
                          fillOpacity: 0.05,
                          weight: 1,
                        }}
                      />
                    </>
                  )}

                  {visibleLayers.routes && !isLinearProject(project.type) && geometry.polygon && (
                    <Polygon
                      positions={geometry.polygon}
                      pathOptions={{
                        color: projectRiskColor,
                        fillColor: projectRiskColor,
                        fillOpacity: 0.15,
                        weight: 2,
                      }}
                      eventHandlers={{ click: () => setSelectedProjectId(project.id) }}
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
                            pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.1, weight: 1 }}
                          />
                        ))}
                      {project.cadastralParcels
                        .filter((parcel) => Array.isArray(parcel?.verified) && parcel.verified.length > 0)
                        .map((parcel, index) => (
                          <Polygon
                            key={`${project.id}-verified-${index}`}
                            positions={parcel.verified}
                            pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.08, weight: 1 }}
                          />
                        ))}
                    </>
                  )}

                  {visibleLayers.markers && (
                    <Marker
                      position={geometry.point}
                      icon={createMarkerIcon(project, selectedProject?.id === project.id)}
                      eventHandlers={{ click: () => setSelectedProjectId(project.id) }}
                    >
                      <Popup>
                        <div className="min-w-[180px] text-xs text-slate-700">
                          <div className="font-semibold text-slate-800">{project.name}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">{project.projectId}</div>
                          <div className="mt-2">
                            <span className="font-medium text-slate-500">Risk:</span>{" "}
                            <span className="font-semibold" style={{ color: projectRiskColor }}>
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
                return (
                  <Marker
                    key={`cluster-${cluster.projects.map((project) => project.id).join("-")}`}
                    position={cluster.center}
                    icon={createClusterIcon(cluster.projects.length, selected)}
                    eventHandlers={{ click: () => setSelectedProjectId(cluster.projects[0].id) }}
                  >
                    <Popup>
                      <div className="min-w-[170px] text-xs text-slate-700">
                        <div className="font-semibold text-slate-800">{cluster.projects.length} projects</div>
                        <div className="mt-2 space-y-1">
                          {cluster.projects.slice(0, 3).map((project) => (
                            <div key={project.id} className="text-[10px] text-slate-600">
                              {project.projectId} • {project.riskCategory}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        </div>
      </div>


      <div className="mt-3 flex flex-wrap gap-2">
        {Object.entries(riskColors).map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
};

export default gis;
