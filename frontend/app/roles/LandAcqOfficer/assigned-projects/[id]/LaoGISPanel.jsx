"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Layers3, LocateFixed, MapPin, Minus, Plus } from "lucide-react";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((module) => module.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((module) => module.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((module) => module.Marker), { ssr: false });
const Polygon = dynamic(() => import("react-leaflet").then((module) => module.Polygon), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((module) => module.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((module) => module.Popup), { ssr: false });

const Polyline = dynamic(() => import("react-leaflet").then((module) => module.Polyline), { ssr: false });

const validPosition = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    ? [lat, lng]
    : null;
};

const getCoordinates = (value) => {
  if (Array.isArray(value) && value.length >= 2) return validPosition(value[0], value[1]);
  return validPosition(
    value?.latitude ?? value?.lat,
    value?.longitude ?? value?.lng ?? value?.lon
  );
};

const fromGeoJSONPosition = (value) => Array.isArray(value) && value.length >= 2
  ? validPosition(value[1], value[0])
  : null;

const getProjectShape = (project) => {
  let geometry = project.geometry;
  if (geometry?.type === "Feature") geometry = geometry.geometry;

  const lines = [];
  const polygons = [];
  let geometryPoints = [];

  if (geometry?.type === "Point") {
    geometryPoints = [fromGeoJSONPosition(geometry.coordinates)].filter(Boolean);
  } else if (geometry?.type === "LineString") {
    lines.push(geometry.coordinates.map(fromGeoJSONPosition).filter(Boolean));
  } else if (geometry?.type === "MultiLineString") {
    lines.push(...geometry.coordinates.map((line) => line.map(fromGeoJSONPosition).filter(Boolean)));
  } else if (geometry?.type === "Polygon") {
    polygons.push(geometry.coordinates.map((ring) => ring.map(fromGeoJSONPosition).filter(Boolean)));
  } else if (geometry?.type === "MultiPolygon") {
    polygons.push(...geometry.coordinates.map((polygon) => polygon.map((ring) => ring.map(fromGeoJSONPosition).filter(Boolean))));
  }

  const shapePoints = [
    ...geometryPoints,
    ...lines.flat(),
    ...polygons.flat(2),
  ];
  const explicitPoint = getCoordinates(project.coordinates) || getCoordinates({
    latitude: project.latitude,
    longitude: project.longitude,
  });
  const point = explicitPoint || (shapePoints.length
    ? [
        shapePoints.reduce((total, [latitude]) => total + latitude, 0) / shapePoints.length,
        shapePoints.reduce((total, [, longitude]) => total + longitude, 0) / shapePoints.length,
      ]
    : null);

  return {
    point,
    lines: lines.filter((line) => line.length > 1),
    polygons: polygons.filter((polygon) => polygon[0]?.length > 2),
    points: shapePoints,
  };
};

const getParcelPosition = (parcel) => getCoordinates(parcel.coordinates || parcel.locationCoordinates || parcel.centroid);

const getParcelBoundary = (parcel) => {
  let geometry = parcel.geometry;
  if (geometry?.type === "Feature") geometry = geometry.geometry;
  if (geometry?.type === "Polygon") {
    const rings = geometry.coordinates.map((ring) => ring.map(fromGeoJSONPosition).filter(Boolean));
    return rings[0]?.length > 2 ? rings : null;
  }

  const rawBoundary = parcel.boundary || parcel.coordinates?.boundary;
  if (!Array.isArray(rawBoundary) || rawBoundary.length < 3) return null;
  const positions = rawBoundary.map(getCoordinates);
  return positions.every(Boolean) ? positions : null;
};

function MapActions({ onReady }) {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    onReady(map);
    requestAnimationFrame(() => map.invalidateSize());
  }, [map, onReady]);

  return null;
}

export default function LaoGISPanel({ project, parcels = [] }) {
  const projectShape = useMemo(() => getProjectShape(project), [project]);
  const [map, setMap] = useState(null);
  const [showParcels, setShowParcels] = useState(true);
  const parcelFeatures = useMemo(() => parcels.map((parcel) => ({
    parcel,
    position: getParcelPosition(parcel),
    boundary: getParcelBoundary(parcel),
  })).filter(({ position, boundary }) => position || boundary), [parcels]);
  const points = useMemo(() => [
    ...projectShape.points,
    ...(projectShape.point && !projectShape.points.length ? [projectShape.point] : []),
    ...(showParcels ? parcelFeatures.flatMap(({ position, boundary }) => boundary?.[0] || (position ? [position] : [])) : []),
  ], [parcelFeatures, projectShape, showParcels]);
  const fitMap = useCallback(() => {
    if (!map || points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 14);
    else map.fitBounds(points, { padding: [32, 32], maxZoom: 14 });
  }, [map, points]);

  useEffect(() => {
    fitMap();
  }, [fitMap]);

  const mapCenter = projectShape.point || points[0];
  if (!mapCenter) return <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center"><div><MapPin className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-2 text-sm font-semibold text-slate-700">GIS coordinates unavailable</p><p className="mt-1 text-xs text-slate-500">This project has no usable coordinates or GeoJSON geometry in its backend record.</p></div></div>;

  return <div className="relative h-72 overflow-hidden rounded-xl border border-slate-200 sm:h-80">
    <MapContainer center={mapCenter} zoom={12} scrollWheelZoom className="h-full w-full" attributionControl>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <MapActions onReady={setMap} />
      {projectShape.lines.map((line, index) => <Polyline key={`project-route-${index}`} positions={line} pathOptions={{ color: "#0284c7", weight: 5, opacity: 0.85 }}><Popup><strong>{project.name}</strong><br />Project route</Popup></Polyline>)}
      {projectShape.polygons.map((polygon, index) => <Polygon key={`project-boundary-${index}`} positions={polygon} pathOptions={{ color: "#0284c7", fillColor: "#38bdf8", fillOpacity: 0.16, weight: 2 }}><Popup><strong>{project.name}</strong><br />Project boundary</Popup></Polygon>)}
      {showParcels && parcelFeatures.map(({ parcel, position, boundary }, index) => {
        const color = parcel.status === "Verified" ? "#059669" : "#d97706";
        const popup = <Popup><strong>{parcel.khasra || `Parcel ${index + 1}`}</strong><br />{parcel.area} ha · {parcel.landUse}<br />{parcel.owner || "Owner reference pending"}<br />Status: {parcel.status}</Popup>;
        return boundary
          ? <Polygon key={parcel.id || index} positions={boundary} pathOptions={{ color, fillColor: color, fillOpacity: 0.28, weight: 2 }}>{popup}</Polygon>
          : position ? <CircleMarker key={parcel.id || index} center={position} radius={7} pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}>{popup}</CircleMarker> : null;
      })}
      {projectShape.point && <Marker position={projectShape.point}><Popup><strong>{project.name}</strong><br />{project.projectId}<br />Project reference point<br />{projectShape.point[0].toFixed(6)}, {projectShape.point[1].toFixed(6)}</Popup></Marker>}
    </MapContainer>
    <div className="absolute right-3 top-3 z-500 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
      <button type="button" title="Zoom in" aria-label="Zoom in" onClick={() => map?.zoomIn()} className="flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-slate-100"><Plus className="h-4 w-4" /></button>
      <button type="button" title="Zoom out" aria-label="Zoom out" onClick={() => map?.zoomOut()} className="flex h-9 w-9 items-center justify-center border-t border-slate-200 text-slate-700 hover:bg-slate-100"><Minus className="h-4 w-4" /></button>
      <button type="button" title="Fit project and parcel data" aria-label="Fit project and parcel data" onClick={fitMap} className="flex h-9 w-9 items-center justify-center border-t border-slate-200 text-slate-700 hover:bg-slate-100"><LocateFixed className="h-4 w-4" /></button>
    </div>
    <div className="absolute bottom-3 left-3 z-500 max-w-[calc(100%-5.5rem)] rounded-lg border border-slate-200 bg-white/95 p-3 text-xs shadow-md backdrop-blur-sm">
      <p className="mb-2 flex items-center gap-2 font-bold text-slate-800"><Layers3 className="h-4 w-4" />Map layers</p>
      {projectShape.lines.length > 0 && <p className="flex items-center gap-2 text-slate-600"><span className="h-1 w-3 shrink-0 rounded bg-sky-600" />Project route</p>}
      {projectShape.polygons.length > 0 && <p className="flex items-center gap-2 text-slate-600"><span className="h-3 w-3 shrink-0 border-2 border-sky-600 bg-sky-200/50" />Project boundary</p>}
      {projectShape.point && <p className="flex items-center gap-2 text-slate-600"><span className="h-3 w-3 shrink-0 rounded-full border-2 border-sky-600 bg-sky-200" />Project reference · {projectShape.point[0].toFixed(5)}, {projectShape.point[1].toFixed(5)}</p>}
      <label className="mt-2 flex cursor-pointer items-center gap-2 text-slate-700"><input type="checkbox" checked={showParcels} onChange={(event) => setShowParcels(event.target.checked)} className="accent-emerald-600" />Parcel locations ({parcelFeatures.length})</label>
      {parcelFeatures.length === 0 && <p className="mt-2 max-w-48 text-[11px] leading-4 text-amber-700">No parcel coordinates recorded. Add parcel GIS coordinates to display them here.</p>}
    </div>
  </div>;
}
