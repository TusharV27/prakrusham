"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issues in React/Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function OSMMap({ 
  center = [21.192, 72.886], 
  zoom = 15, 
  markerLabel = "Prakrushi - IFM Market" 
}) {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={defaultIcon}>
          <Popup>
            <div className="font-semibold text-[#14532d]">
              {markerLabel}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
