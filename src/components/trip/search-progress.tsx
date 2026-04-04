"use client";

import { useEffect, useState } from "react";
import { Plane, Building2, Cloud, Globe, Calendar, Loader2 } from "lucide-react";

const STAGES = [
  { icon: Plane, label: "Finding flights", sublabel: "Searching best routes & prices" },
  { icon: Building2, label: "Matching hotels", sublabel: "Rating, location & amenities" },
  { icon: Cloud, label: "Checking weather", sublabel: "Forecast for your dates" },
  { icon: Globe, label: "Cultural insights", sublabel: "Local tips & etiquette" },
  { icon: Calendar, label: "Building itinerary", sublabel: "Day-by-day planning" },
];

export function SearchProgress() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <Loader2 className="h-8 w-8 animate-spin text-teal mx-auto mb-3" />
        <h3 className="text-lg font-semibold font-heading">Planning your trip...</h3>
        <p className="text-sm text-muted-foreground">Our AI concierge is working on it</p>
      </div>
      <div className="space-y-3">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isDone = i < activeStage;
          const isActive = i === activeStage;
          return (
            <div
              key={stage.label}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                isDone ? "bg-teal/10" : isActive ? "bg-card shadow-sm" : "opacity-40"
              }`}
            >
              <div className={`p-2 rounded-full ${isDone ? "bg-teal text-white" : isActive ? "bg-primary text-white animate-pulse" : "bg-muted"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{stage.label}</p>
                <p className="text-xs text-muted-foreground">{stage.sublabel}</p>
              </div>
              {isDone && <span className="ml-auto text-teal text-xs font-semibold">Done</span>}
              {isActive && <Loader2 className="ml-auto h-4 w-4 animate-spin text-primary" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
