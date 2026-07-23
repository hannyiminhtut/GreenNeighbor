"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

export type CollectionMapTask = {
  id: number;
  location: string;
  wasteType: string;
  amount: string;
  status: "pending" | "in_progress" | "completed" | "verified";
  latitude: number | null;
  longitude: number | null;
};

type CollectionTaskMapProps = {
  tasks: CollectionMapTask[];
};

const statusColors: Record<CollectionMapTask["status"], string> = {
  pending: "#f59e0b",
  in_progress: "#2563eb",
  completed: "#7c3aed",
  verified: "#16a34a",
};

function FitReportedLocations({ tasks }: CollectionTaskMapProps) {
  const map = useMap();

  useEffect(() => {
    const points = tasks
      .filter(
        (task) => task.latitude !== null && task.longitude !== null
      )
      .map((task) => [task.latitude as number, task.longitude as number] as [number, number]);

    if (points.length === 1) {
      map.setView(points[0], 15);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [35, 35], maxZoom: 16 });
    }
  }, [map, tasks]);

  return null;
}

export default function CollectionTaskMap({ tasks }: CollectionTaskMapProps) {
  const mappedTasks = tasks.filter(
    (task) => task.latitude !== null && task.longitude !== null
  );

  if (mappedTasks.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-6 text-center text-sm text-gray-500">
        No mapped report locations are available yet. New reports will appear
        here after a map point is selected.
      </div>
    );
  }

  return (
    <div className="relative z-0 isolate overflow-hidden rounded-xl border border-gray-200">
      <MapContainer
        center={[16.8409, 96.1735]}
        zoom={12}
        scrollWheelZoom
        className="h-80 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {mappedTasks.map((task) => (
          <CircleMarker
            key={task.id}
            center={[task.latitude as number, task.longitude as number]}
            radius={9}
            pathOptions={{
              color: statusColors[task.status],
              fillColor: statusColors[task.status],
              fillOpacity: 0.8,
              weight: 3,
            }}
          >
            <Popup>
              <div className="min-w-48 text-sm">
                <p className="font-semibold text-gray-900">{task.location}</p>
                <p className="mt-1 text-gray-600">
                  {task.wasteType} · {task.amount}
                </p>
                <p className="mt-1 capitalize text-gray-600">
                  Status: {task.status.replace("_", " ")}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        <FitReportedLocations tasks={mappedTasks} />
      </MapContainer>
    </div>
  );
}
