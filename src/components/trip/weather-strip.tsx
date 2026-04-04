"use client";

import type { WeatherForecast } from "@/lib/types";
import { Cloud, Sun, CloudRain, CloudSun } from "lucide-react";

function WeatherIcon({ condition }: { condition: string }) {
  const c = condition.toLowerCase();
  if (c.includes("rain")) return <CloudRain className="h-5 w-5 text-blue-400" />;
  if (c.includes("cloud") || c.includes("overcast")) return <Cloud className="h-5 w-5 text-gray-400" />;
  if (c.includes("partly")) return <CloudSun className="h-5 w-5 text-amber-400" />;
  return <Sun className="h-5 w-5 text-amber-500" />;
}

export function WeatherStrip({ weather }: { weather: WeatherForecast[] }) {
  if (weather.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
        <Sun className="h-5 w-5 text-amber-500" />
        Weather Forecast
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weather.slice(0, 7).map((w) => {
          const dayName = new Date(w.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
          return (
            <div key={w.date} className="flex-shrink-0 w-20 p-3 rounded-xl bg-card text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{dayName}</p>
              <div className="my-2 flex justify-center">
                <WeatherIcon condition={w.condition} />
              </div>
              <p className="text-sm font-semibold">{w.tempHighF}°</p>
              <p className="text-xs text-muted-foreground">{w.tempLowF}°</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
