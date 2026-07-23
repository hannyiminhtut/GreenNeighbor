"use client";

import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

export type MapPoint = {
  lat: number;
  lon: number;
};

type OpenStreetMapCanvasProps = {
  selectedPoint: MapPoint;
  onPointChange: (point: MapPoint) => void;
};

const markerIcon = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;background:#16a34a;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

function MapClickHandler({
  onPointChange,
}: Pick<OpenStreetMapCanvasProps, "onPointChange">) {
  useMapEvents({
    click(event) {
      onPointChange({ lat: event.latlng.lat, lon: event.latlng.lng });
    },
  });
  return null;
}

function MapPositionController({ point }: { point: MapPoint }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([point.lat, point.lon], Math.max(map.getZoom(), 15));
  }, [map, point]);

  return null;
}

export default function OpenStreetMapCanvas({
  selectedPoint,
  onPointChange,
}: OpenStreetMapCanvasProps) {
  return (
    <MapContainer
      center={[selectedPoint.lat, selectedPoint.lon]}
      zoom={12}
      scrollWheelZoom
      className="h-80 w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <Marker
        position={[selectedPoint.lat, selectedPoint.lon]}
        icon={markerIcon}
      />
      <MapClickHandler onPointChange={onPointChange} />
      <MapPositionController point={selectedPoint} />
    </MapContainer>
  );
}
