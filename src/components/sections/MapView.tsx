"use client";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TPlace } from "@/components/sections/LocationAutocomplete";

const MapView = ({
  origin,
  destination,
}: {
  origin: TPlace | null;
  destination: TPlace | null;
}) => {
  if (!origin && !destination) return null;

  const originLatLng = origin
    ? [parseFloat(origin.lat), parseFloat(origin.lon)] as [number, number]
    : null;
  const destinationLatLng = destination
    ? [parseFloat(destination.lat), parseFloat(destination.lon)] as [number, number]
    : null;

  const center = originLatLng || destinationLatLng || [37.0902, -95.7129]; // default USA center

  return (
    <div className="my-5 w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-sm z-1">
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />

        {originLatLng && (
          <Marker position={originLatLng} icon={L.icon({ iconUrl: "/location.webp", iconSize: [25, 25], iconAnchor: [12, 25] })} />
        )}
        {destinationLatLng && (
          <Marker position={destinationLatLng} icon={L.icon({ iconUrl: "/location.webp", iconSize: [25, 25], iconAnchor: [12, 25] })} />
        )}

        {originLatLng && destinationLatLng && (
          <Polyline positions={[originLatLng, destinationLatLng]} color="blue" />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
