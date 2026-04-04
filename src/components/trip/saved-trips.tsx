"use client";

import { useSyncExternalStore, useCallback } from "react";
import type { TripBrief } from "@/lib/types";
import { History, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SavedTrip = TripBrief & { savedAt: string };

function getSavedTrips(): SavedTrip[] {
  try {
    return JSON.parse(localStorage.getItem("clickless_saved_trips") || "[]");
  } catch {
    return [];
  }
}

function subscribeSavedTrips(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

const emptyTrips: SavedTrip[] = [];

interface SavedTripsProps {
  onSelect: (brief: TripBrief) => void;
}

export function SavedTrips({ onSelect }: SavedTripsProps) {
  const trips = useSyncExternalStore(subscribeSavedTrips, getSavedTrips, () => emptyTrips);

  const removeTrip = useCallback((id: string) => {
    const current = getSavedTrips();
    const updated = current.filter((t) => t.id !== id);
    localStorage.setItem("clickless_saved_trips", JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent("storage"));
  }, []);

  if (trips.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-muted-foreground">
        <History className="h-4 w-4" />
        Saved Trips
      </h3>
      <div className="grid gap-2">
        {trips.slice(0, 5).map((trip) => (
          <button
            key={trip.id}
            onClick={() => onSelect(trip)}
            className="flex items-center justify-between p-3 rounded-xl bg-card hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-teal" />
              <div>
                <p className="font-medium text-sm">{trip.intent.destination}</p>
                <p className="text-xs text-muted-foreground">
                  {trip.intent.duration || 5} nights · ${trip.budget.total.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(trip.savedAt).toLocaleDateString()}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTrip(trip.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
