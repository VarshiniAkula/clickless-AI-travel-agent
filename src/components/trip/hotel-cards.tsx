"use client";

import type { HotelOption } from "@/lib/types";
import { Building2, Star, MapPin } from "lucide-react";

export function HotelCards({ hotels, nights }: { hotels: HotelOption[]; nights: number }) {
  if (hotels.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
        <Building2 className="h-5 w-5 text-teal" />
        Hotel Recommendations
      </h3>
      <div className="grid gap-3">
        {hotels.slice(0, 3).map((h, i) => (
          <div
            key={h.id}
            className={`p-4 rounded-xl transition-all ${
              i === 0 ? "bg-card ring-2 ring-teal/20 shadow-md" : "bg-card hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{h.name}</p>
                {h.neighborhood && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {h.neighborhood}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">${h.pricePerNight}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                <p className="text-sm text-muted-foreground">${h.pricePerNight * nights} total</p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{h.rating}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {h.amenities.slice(0, 4).map((a) => (
                  <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-teal/10 text-teal font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </div>
            {i === 0 && (
              <div className="mt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Top Pick</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
