"use client";

import { LocateFixed, MapPin, Search } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import type { MapPoint } from "@/components/OpenStreetMapCanvas";

const OpenStreetMapCanvas = dynamic(
  () => import("@/components/OpenStreetMapCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
        Loading map...
      </div>
    ),
  }
);

type LocationResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type OpenStreetMapLocationSearchProps = {
  onChange: (location: string, point: MapPoint | null) => void;
};

export default function OpenStreetMapLocationSearch({
  onChange,
}: OpenStreetMapLocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [resolvingPoint, setResolvingPoint] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint>({
    lat: 16.8409,
    lon: 96.1735,
  });

  const searchLocations = async () => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 3) {
      toast.error("Enter at least 3 characters to search for a location.");
      return;
    }

    setLoading(true);
    setResults([]);
    try {
      const parameters = new URLSearchParams({
        q: normalizedQuery,
        format: "jsonv2",
        addressdetails: "1",
        limit: "5",
      });
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${parameters.toString()}`,
        { headers: { Accept: "application/json" } }
      );

      if (!response.ok) {
        throw new Error("The location service is temporarily unavailable.");
      }

      const locations = (await response.json()) as LocationResult[];
      setResults(locations);
      if (locations.length === 0) {
        toast.error("No matching locations were found.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Location search failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void searchLocations();
    }
  };

  const selectLocation = (location: LocationResult) => {
    const point = {
      lat: Number(location.lat),
      lon: Number(location.lon),
    };
    setQuery(location.display_name);
    setResults([]);
    setSelectedPoint(point);
    onChange(location.display_name, point);
  };

  const goToMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location access is not supported by this browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setSelectedPoint(point);
        setQuery("");
        setResults([]);
        onChange("", null);
        setLocating(false);
        toast.success(
          "Map moved to your location. Select Use selected point to confirm it."
        );
      },
      (error) => {
        setLocating(false);
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Allow location access in your browser and try again."
            : "Your current location could not be determined. Please try again.";
        toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  };

  const confirmSelectedPoint = async () => {
    setResolvingPoint(true);
    try {
      const parameters = new URLSearchParams({
        lat: selectedPoint.lat.toString(),
        lon: selectedPoint.lon.toString(),
        format: "jsonv2",
      });
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${parameters.toString()}`,
        { headers: { Accept: "application/json" } }
      );
      if (!response.ok) {
        throw new Error("The selected point could not be resolved.");
      }
      const location = (await response.json()) as { display_name?: string };
      const label =
        location.display_name ||
        `${selectedPoint.lat.toFixed(6)}, ${selectedPoint.lon.toFixed(6)}`;
      setQuery(label);
      onChange(label, selectedPoint);
      toast.success("Waste location selected.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Location selection failed."
      );
    } finally {
      setResolvingPoint(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange("", null);
          }}
          onKeyDown={handleKeyDown}
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          placeholder="Search city, street or address"
          aria-label="Waste location"
        />
        </div>
        <Button
          type="button"
          onClick={() => void searchLocations()}
          disabled={loading}
          className="h-12 rounded-xl bg-emerald-600 px-5 font-semibold text-white hover:bg-emerald-700"
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {results.length > 0 && (
        <ul className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {results.map((location) => (
            <li key={location.place_id}>
              <button
                type="button"
                onClick={() => selectLocation(location)}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-900"
              >
                {location.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative z-0 isolate mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
        <OpenStreetMapCanvas
          selectedPoint={selectedPoint}
          onPointChange={(point) => {
            setSelectedPoint(point);
            onChange("", null);
          }}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          Selected point: {selectedPoint.lat.toFixed(5)},{" "}
          {selectedPoint.lon.toFixed(5)}
        </span>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={goToMyLocation}
            disabled={locating}
            variant="outline"
            className="h-9 rounded-lg border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
          >
            <LocateFixed className="mr-1 h-4 w-4" />
            {locating ? "Locating..." : "Go to my location"}
          </Button>
          <Button
            type="button"
            onClick={() => void confirmSelectedPoint()}
            disabled={resolvingPoint || locating}
            variant="outline"
            className="h-9 rounded-lg border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            {resolvingPoint ? "Selecting..." : "Use selected point"}
          </Button>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-slate-400">
        Search data ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          OpenStreetMap contributors
        </a>
      </p>
    </div>
  );
}
