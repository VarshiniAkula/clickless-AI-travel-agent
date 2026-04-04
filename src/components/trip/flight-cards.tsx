"use client";

import type { FlightOption } from "@/lib/types";
import { Plane } from "lucide-react";

export function FlightCards({ flights }: { flights: FlightOption[] }) {
  if (flights.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
        <Plane className="h-5 w-5 text-teal" />
        Top Flight Options
      </h3>
      <div className="grid gap-3">
        {flights.map((f, i) => (
          <div
            key={f.id}
            className={`p-4 rounded-xl transition-all ${
              i === 0
                ? "premium-gradient text-white shadow-lg"
                : "bg-card hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold ${i === 0 ? "text-white" : "text-foreground"}`}>
                  {f.airline}
                </p>
                <p className={`text-sm ${i === 0 ? "text-white/80" : "text-muted-foreground"}`}>
                  {f.origin} → {f.destination}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${i === 0 ? "text-white" : "text-foreground"}`}>
                  ${f.price}
                </p>
                {i === 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                    Best Value
                  </span>
                )}
              </div>
            </div>
            <div className={`mt-2 flex items-center gap-4 text-sm ${i === 0 ? "text-white/70" : "text-muted-foreground"}`}>
              <span>{f.departureTime} → {f.arrivalTime}</span>
              <span>{f.duration}</span>
              <span>{f.stops === 0 ? "Nonstop" : `${f.stops} stop${f.stops > 1 ? "s" : ""}`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
