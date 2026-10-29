"use client";

import { useMemo, useState } from "react";
import { MapContainer, Marker, Polygon, Popup, TileLayer, useMap } from "react-leaflet";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Layers3, MapPinned, Ruler, ShieldCheck } from "lucide-react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { Header } from "../../../component/layout";
import { PROJECTS } from "../assigned-projects/projects-data";

const getProjectShape = (project) => {
  const latitude = Number(project.coordinates?.latitude ?? 20.5937);
  const longitude = Number(project.coordinates?.longitude ?? 78.9629);
  const spread = project.type === "Industrial" ? 0.08 : 0.055;

  return [
    [latitude + spread, longitude - spread * 1.25],
    [latitude + spread * 0.8, longitude + spread * 1.3],
    [latitude - spread * 0.85, longitude + spread],
    [latitude - spread, longitude - spread * 1.1],
  ];
};

const getParcelShapes = (project) => {
  const latitude = Number(project.coordinates?.latitude ?? 20.5937);
  const longitude = Number(project.coordinates?.longitude ?? 78.9629);
  const step = project.type === "Industrial" ? 0.018 : 0.012;

  return Array.from({ length: 6 }, (_, index) => {
    const row = Math.floor(index / 3);
    const column = index % 3;
    const centerLat = latitude + (row - 0.5) * step * 2.4;
    const centerLng = longitude + (column - 1) * step * 2.2;
    const height = step * 0.9;
    const width = step * 1.05;

    return [
      [centerLat + height, centerLng - width],
      [centerLat + height, centerLng + width],
      [centerLat - height, centerLng + width],
      [centerLat - height, centerLng - width],
    ];
  });
};

function RecenterMap({ project }) {
  const map = useMap();
  const latitude = Number(project.coordinates?.latitude ?? 20.5937);
  const longitude = Number(project.coordinates?.longitude ?? 78.9629);
  map.setView([latitude, longitude], 12);
  return null;
}

export default function ProjectMap() {
  const searchParams = useSearchParams();
  const requestedProject = searchParams.get("project");
  const initialProject = PROJECTS.find((project) => String(project.id) === requestedProject) || PROJECTS[0];
  const [selectedId, setSelectedId] = useState(initialProject?.id);
  const project = PROJECTS.find((item) => item.id === selectedId) || PROJECTS[0];
  const boundary = useMemo(() => getProjectShape(project), [project]);
  const parcels = useMemo(() => getParcelShapes(project), [project]);
  const latitude = Number(project.coordinates?.latitude ?? 20.5937);
  const longitude = Number(project.coordinates?.longitude ?? 78.9629);

  return (
    <>
      <Header title="Project Map" />
      <main className="page-shell">
        <div className="page-container">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link href={`/roles/LandAcqOfficer/assigned-projects/${project.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back to project
            </Link>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              Project
              <select value={selectedId} onChange={(event) => setSelectedId(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-sky-200">
                {PROJECTS.map((item) => <option key={item.id} value={item.id}>{item.projectId} - {item.name}</option>)}
              </select>
            </label>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Required land view</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
                  <p className="mt-1 text-sm text-slate-500">{project.projectId} · {project.village}, {project.district}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="rounded-xl bg-sky-50 px-3 py-2"><p className="text-[10px] font-bold uppercase text-sky-700">Required</p><p className="mt-1 font-bold text-sky-950">{project.requiredLandArea} {project.landUnit}</p></div>
                  <div className="rounded-xl bg-amber-50 px-3 py-2"><p className="text-[10px] font-bold uppercase text-amber-700">Status</p><p className="mt-1 text-sm font-bold text-amber-950">{project.status}</p></div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2"><p className="text-[10px] font-bold uppercase text-emerald-700">Parcels</p><p className="mt-1 font-bold text-emerald-950">6 candidate</p></div>
                </div>
              </div>
            </div>

            <div className="relative h-[520px] w-full">
              <MapContainer center={[latitude, longitude]} zoom={12} scrollWheelZoom className="h-full w-full" attributionControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <RecenterMap project={project} />
                <Polygon positions={boundary} pathOptions={{ color: "#0284c7", fillColor: "#38bdf8", fillOpacity: 0.12, weight: 3, dashArray: "8 6" }}>
                  <Popup><strong>Project requirement area</strong><br />{project.requiredLandArea} {project.landUnit} required</Popup>
                </Polygon>
                {parcels.map((parcel, index) => (
                  <Polygon key={index} positions={parcel} pathOptions={{ color: "#d97706", fillColor: "#fbbf24", fillOpacity: 0.38, weight: 1.5 }}>
                    <Popup><strong>Candidate parcel {index + 1}</strong><br />Requires verification before acquisition.</Popup>
                  </Polygon>
                ))}
                <Marker position={[latitude, longitude]}><Popup><strong>{project.name}</strong><br />Project reference point</Popup></Marker>
              </MapContainer>
              <div className="absolute bottom-4 left-4 z-[500] rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-sm">
                <p className="mb-2 flex items-center gap-2 font-bold text-slate-800"><Layers3 className="h-4 w-4" /> Map legend</p>
                <p className="flex items-center gap-2 text-slate-600"><span className="h-3 w-3 rounded-sm border-2 border-sky-600 bg-sky-200/50" /> Required project area</p>
                <p className="mt-1 flex items-center gap-2 text-slate-600"><span className="h-3 w-3 rounded-sm border border-amber-600 bg-amber-300/70" /> Candidate parcels</p>
              </div>
            </div>
          </section>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><MapPinned className="h-5 w-5 text-sky-600" /><p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Reference point</p><p className="mt-1 font-semibold text-slate-800">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><Ruler className="h-5 w-5 text-amber-600" /><p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Land requirement</p><p className="mt-1 font-semibold text-slate-800">{project.requiredLandArea} {project.landUnit}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><ShieldCheck className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Next step</p><p className="mt-1 font-semibold text-slate-800">Verify candidate parcels</p></div>
          </div>
          <p className="mt-4 text-xs text-slate-500">Displayed parcel boundaries are planning overlays for this demo. Official cadastral boundaries must be verified against authorized land records.</p>
        </div>
      </main>
    </>
  );
}