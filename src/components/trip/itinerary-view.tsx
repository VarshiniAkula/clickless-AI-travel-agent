"use client";

import type { ItineraryDay } from "@/lib/types";
import { Calendar, MapPin, DollarSign } from "lucide-react";

export function ItineraryView({ itinerary }: { itinerary: ItineraryDay[] }) {
  if (itinerary.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
        <Calendar className="h-5 w-5 text-teal" />
        Day-by-Day Itinerary
      </h3>
      <div className="relative">
        {/* Timeline connector line */}
        <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary via-teal to-primary/20" />

        <div className="space-y-4">
          {itinerary.map((day) => (
            <div key={day.day} className="relative pl-10">
              {/* Timeline dot */}
              <div className="absolute left-2 top-4 w-[11px] h-[11px] rounded-full premium-gradient ring-2 ring-background" />

              <div className="p-4 rounded-xl bg-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{day.title}</h4>
                  {day.date && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {day.activities.map((act, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-muted-foreground font-mono text-xs w-16 flex-shrink-0 pt-0.5">{act.time}</span>
                      <div className="flex-1">
                        <p className="font-medium">{act.activity}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-muted-foreground text-xs">
                          {act.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {act.location}
                            </span>
                          )}
                          {act.cost !== undefined && act.cost > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" /> ${act.cost}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
