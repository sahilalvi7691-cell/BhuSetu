"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const FeatureGroup = dynamic(() => import("react-leaflet").then((module) => module.FeatureGroup), { ssr: false });
const MapContainer = dynamic(() => import("react-leaflet").then((module) => module.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((module) => module.TileLayer), { ssr: false });

const toFeature = (layer) => layer?.toGeoJSON?.() || null;

const getCoordinates = (feature) => {
  if (!feature?.geometry) return [];
  if (feature.geometry.type === "Polygon") return feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
  if (feature.geometry.type === "LineString") return feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  return [];
};

const getCenter = (coordinates) => {
  if (!coordinates.length) return null;
  const latitude = coordinates.reduce((sum, [lat]) => sum + lat, 0) / coordinates.length;
  const longitude = coordinates.reduce((sum, [, lng]) => sum + lng, 0) / coordinates.length;
  return { latitude: Number(latitude.toFixed(6)), longitude: Number(longitude.toFixed(6)) };
};

const getAreaHectares = (coordinates) => {
  if (coordinates.length < 3) return 0;
  const latitudeScale = 111320;
  const longitudeScale = 111320 * Math.cos((coordinates[0][0] * Math.PI) / 180);
  let area = 0;
  coordinates.forEach(([latitude, longitude], index) => {
    const next = coordinates[(index + 1) % coordinates.length];
    const x = longitude * longitudeScale;
    const y = latitude * latitudeScale;
    const nextX = next[1] * longitudeScale;
    const nextY = next[0] * latitudeScale;
    area += x * nextY - nextX * y;
  });
  return Math.abs(area / 2 / 10000);
};

const getDistanceKm = (coordinates) => coordinates.slice(1).reduce((total, [latitude, longitude], index) => {
  const [previousLatitude, previousLongitude] = coordinates[index];
  const toRadians = (value) => (value * Math.PI) / 180;
  const dLat = toRadians(latitude - previousLatitude);
  const dLng = toRadians(longitude - previousLongitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(previousLatitude)) * Math.cos(toRadians(latitude)) * Math.sin(dLng / 2) ** 2;
  return total + 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}, 0);

function RecenterMap({ center }) {
  const { useMap } = require("react-leaflet");
  const map = useMap();
  useEffect(() => {
    if (center) map.setView([center.latitude, center.longitude], map.getZoom());
  }, [center, map]);
  return null;
}

export default function CreateProjectMap({ isLinear, onGeometryChange }) {
  const [center, setCenter] = useState({ latitude: 28.6139, longitude: 77.209 });
  const [EditControl, setEditControl] = useState(null);

  useEffect(() => {
    window.L = window.L || L;

    let mounted = true;
    import("react-leaflet-draw").then((module) => {
      if (mounted) setEditControl(() => module.EditControl);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const updateGeometry = (layer) => {
    const feature = toFeature(layer);
    const coordinates = getCoordinates(feature);
    const position = getCenter(coordinates);
    if (!position) return;
    setCenter(position);
    onGeometryChange({
      geometry: feature.geometry,
      geometryType: feature.geometry.type,
      latitude: position.latitude,
      longitude: position.longitude,
      calculatedArea: feature.geometry.type === "Polygon" ? getAreaHectares(coordinates).toFixed(2) : "",
      routeLength: feature.geometry.type === "LineString" ? getDistanceKm(coordinates).toFixed(2) : "",
    });
  };

  const clearGeometry = () => onGeometryChange({ geometry: null, geometryType: "", latitude: "", longitude: "", calculatedArea: "", routeLength: "" });

  return (
    <div className="relative h-full w-full">
      <MapContainer center={[center.latitude, center.longitude]} zoom={11} scrollWheelZoom className="h-full w-full" attributionControl>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <RecenterMap center={center} />
        <FeatureGroup>
          {EditControl && (
            <EditControl
              position="topleft"
              onCreated={(event) => updateGeometry(event.layer)}
              onEdited={(event) => event.layers.eachLayer(updateGeometry)}
              onDeleted={clearGeometry}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polygon: !isLinear,
                polyline: isLinear,
              }}
              edit={{ remove: true }}
            />
          )}
        </FeatureGroup>
      </MapContainer>
      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/95 px-3 py-2 text-xs text-slate-700 shadow">
        {isLinear ? "Draw a route, then use the edit or delete controls." : "Draw a boundary, then use the edit or delete controls."}
      </div>
    </div>
  );
}
