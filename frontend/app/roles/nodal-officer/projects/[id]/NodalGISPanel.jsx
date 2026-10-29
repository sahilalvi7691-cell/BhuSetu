"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import { Layers3, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((module) => module.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((module) => module.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((module) => module.Marker), { ssr: false });
const Polygon = dynamic(() => import("react-leaflet").then((module) => module.Polygon), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((module) => module.Polyline), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((module) => module.Popup), { ssr: false });

const LINEAR_TYPES = ["Highway", "Railway", "Metro", "Road"];

const getCoordinates = (project) => {
  const latitude = Number(project.coordinates?.latitude);
  const longitude = Number(project.coordinates?.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : null;
};

const getGeometry = (project) => {
  const point = getCoordinates(project);
  if (!point) return null;
  if (LINEAR_TYPES.includes(project.type)) {
    return {
      point,
      route: [[point[0] - 0.12, point[1] - 0.18], [point[0] - 0.04, point[1] - 0.02], [point[0] + 0.06, point[1] + 0.16], [point[0] + 0.14, point[1] + 0.28]],
      area: null,
    };
  }
  const spread = 0.055;
  return {
    point,
    route: null,
    area: [[point[0] + spread, point[1] - spread * 1.25], [point[0] + spread * 0.8, point[1] + spread * 1.3], [point[0] - spread * 0.85, point[1] + spread], [point[0] - spread, point[1] - spread * 1.1]],
  };
};

function FitProject({ geometry }) {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    const points = geometry.route || geometry.area || [geometry.point];
    map.fitBounds(points, { padding: [24, 24], maxZoom: 12 });
  }, [geometry, map]);

  return null;
}

export default function NodalGISPanel({ project }) {
  const geometry = useMemo(() => getGeometry(project), [project]);

  if (!geometry) {
    return <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center"><div><MapPin className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-2 text-sm font-semibold text-slate-700">GIS coordinates unavailable</p><p className="mt-1 text-xs text-slate-500">A valid latitude and longitude are required to show this project on the map.</p></div></div>;
  }

  return <div className="relative h-72 overflow-hidden rounded-xl border border-slate-200 sm:h-80">
    <MapContainer center={geometry.point} zoom={8} scrollWheelZoom className="h-full w-full" attributionControl>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <FitProject geometry={geometry} />
      {geometry.area ? <Polygon positions={geometry.area} pathOptions={{ color: "#0284c7", fillColor: "#38bdf8", fillOpacity: 0.16, weight: 2, dashArray: "8 6" }}><Popup><strong>Project coverage area</strong><br />{project.requiredLandArea} {project.landUnit} required</Popup></Polygon> : <Polyline positions={geometry.route} pathOptions={{ color: "#0284c7", weight: 5, opacity: 0.78 }}><Popup><strong>Project alignment</strong><br />{project.type} corridor</Popup></Polyline>}
      <Marker position={geometry.point}><Popup><strong>{project.name}</strong><br />{project.projectId}<br />{project.district}, {project.state}</Popup></Marker>
    </MapContainer>
    <div className="absolute bottom-3 left-3 z-[500] rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-sm"><p className="mb-2 flex items-center gap-2 font-bold text-slate-800"><Layers3 className="h-4 w-4" />GIS layers</p><p className="flex items-center gap-2 text-slate-600"><span className="h-3 w-3 rounded-sm border-2 border-sky-600 bg-sky-200/50" />{geometry.route ? "Project alignment" : "Project coverage area"}</p><p className="mt-1 flex items-center gap-2 text-slate-600"><span className="h-3 w-3 rounded-full bg-slate-700" />Project reference point</p></div>
  </div>;
}
