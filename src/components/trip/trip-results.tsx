"use client";

import { useState } from "react";
import type { TripBrief } from "@/lib/types";
import { FlightCards } from "./flight-cards";
import { HotelCards } from "./hotel-cards";
import { WeatherStrip } from "./weather-strip";
import { CulturalTips } from "./cultural-tips";
import { ItineraryView } from "./itinerary-view";
import { PackingList } from "./packing-list";
import { BudgetCard } from "./budget-summary";
import { Volume2, VolumeX, Save, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TripResults({ brief }: { brief: TripBrief }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [saved, setSaved] = useState(false);
  const nights = brief.intent.duration || 5;

  const toggleReadback = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(brief.summary);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSave = async () => {
    try {
      const saved = JSON.parse(localStorage.getItem("clickless_saved_trips") || "[]");
      saved.unshift({ ...brief, savedAt: new Date().toISOString() });
      localStorage.setItem("clickless_saved_trips", JSON.stringify(saved.slice(0, 20)));
      setSaved(true);
    } catch {
      // localStorage unavailable
    }
  };

  const handleShare = async () => {
    const text = `Check out my ${nights}-night trip to ${brief.intent.destination}!\n\n${brief.summary}`;
    if (navigator.share) {
      await navigator.share({ title: `Trip to ${brief.intent.destination}`, text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary header */}
      <div className="p-6 rounded-2xl premium-gradient text-white">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Your Trip Brief</p>
            <h2 className="text-2xl font-bold font-heading mt-1">
              {brief.intent.destination}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {nights} nights{brief.intent.origin ? ` from ${brief.intent.origin}` : ""}
              {brief.intent.dates ? ` · ${brief.intent.dates.start} to ${brief.intent.dates.end}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={toggleReadback} className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSave} className="text-white/80 hover:text-white hover:bg-white/10 rounded-full" disabled={saved}>
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare} className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-white/90 text-sm leading-relaxed">{brief.summary}</p>
      </div>

      {/* Two-column layout for desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main column */}
        <div className="lg:col-span-3 space-y-6">
          <FlightCards flights={brief.flights} />
          <HotelCards hotels={brief.hotels} nights={nights} />
          <ItineraryView itinerary={brief.itinerary} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <WeatherStrip weather={brief.weather} />
          <BudgetCard budget={brief.budget} userBudget={brief.intent.budget} />
          <CulturalTips tips={brief.culturalTips} />
          <PackingList items={brief.packingList} />
        </div>
      </div>
    </div>
  );
}
