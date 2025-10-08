"use client";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TPlace } from "@/components/sections/LocationAutocomplete";

const MapView = ({
  origin,
  destinations,
  dho,
}: {
  origin: TPlace | null;
  destinations: (TPlace | null)[];
  dho: TPlace | null;
}) => {
  const hasValidLocations = origin || destinations.length > 0 || dho;
  if (!hasValidLocations) return null;

  const originLatLng = origin
    ? ([parseFloat(origin.lat), parseFloat(origin.lon)] as [number, number])
    : null;

  const destinationLatLngs = destinations
    .filter((dest): dest is TPlace => dest !== null)
    .map(
      (dest) => [parseFloat(dest.lat), parseFloat(dest.lon)] as [number, number]
    );

  const dhoLatLng = dho
    ? ([parseFloat(dho.lat), parseFloat(dho.lon)] as [number, number])
    : null;

  const getCenter = (): [number, number] => {
    if (originLatLng) return originLatLng;

    if (destinationLatLngs.length > 0) return destinationLatLngs[0];

    if (dhoLatLng) return dhoLatLng;

    return [37.0902, -95.7129]; // USA center
  };

  const center = getCenter();

  const dhoIcon = L.icon({
    iconUrl: "/pin.webp",
    iconSize: [25, 25],
    iconAnchor: [12, 25],
  });

  const originIcon = L.icon({
    iconUrl: "/location.webp",
    iconSize: [25, 25],
    iconAnchor: [12, 25],
  });

  const destinationIcon = L.icon({
    iconUrl: "/location.webp",
    iconSize: [25, 25],
    iconAnchor: [12, 25],
  });

  return (
    <div className="my-5 w-full h-[350px] rounded-xl overflow-hidden border border-slate-200 shadow-sm z-1">
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

        {/* DHO Marker */}
        {dhoLatLng && <Marker position={dhoLatLng} icon={dhoIcon} />}

        {/* Origin Marker */}
        {originLatLng && <Marker position={originLatLng} icon={originIcon} />}

        {/* Destination Markers */}
        {destinationLatLngs.map((latLng, index) => (
          <Marker key={index} position={latLng} icon={destinationIcon} />
        ))}

        {/* خط من DHO إلى Origin */}
        {dhoLatLng && originLatLng && (
          <Polyline
            positions={[dhoLatLng, originLatLng]}
            color="green"
            dashArray="5, 10"
            weight={3}
          />
        )}

        {/* خط من Origin إلى كل الـ Destinations */}
        {originLatLng && destinationLatLngs.length > 0 && (
          <Polyline
            positions={[originLatLng, ...destinationLatLngs]}
            color="blue"
            weight={3}
          />
        )}

        {/* خطوط بين الـ Destinations نفسها لو في أكثر من واحد */}
        {destinationLatLngs.length > 1 && (
          <Polyline
            positions={destinationLatLngs}
            color="red"
            weight={2}
            dashArray="5, 5"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
