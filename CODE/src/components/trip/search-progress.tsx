"use client";

import { useEffect, useState } from "react";
import { parseIntent } from "@/lib/nlu/parser";

const STAGES = [
  { icon: "flight", label: "Flights", sublabel: "Searching 5 global sources...", status: "FOUND BEST PRICES", pct: 100 },
  { icon: "hotel", label: "Accommodations", sublabel: "Analyzing 45 listings...", status: "85% MATCH SCORE", pct: 85 },
  { icon: "cloud", label: "Weather Insights", sublabel: "Retrieving forecast...", status: "COMPLETE", pct: 100 },
  { icon: "explore", label: "Local Guides", sublabel: "Sourcing local highlights...", status: "CURATING EXPERIENCE", pct: 40 },
];

const STEPS = [
  "Validating best options against your traveler profile...",
  "Ensuring freshness of real-time inventory...",
  "Synthesizing your itinerary architecture...",
];

interface SearchProgressProps {
  query?: string;
}

const DESTINATION_IMAGES: Record<string, string> = {
  Tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=60",
  London: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=60",
  Paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=60",
  "Cancún": "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=60",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=60",
};

const DESTINATION_INSIGHTS: Record<string, string> = {
  Tokyo: "April in Tokyo offers cherry blossoms and pleasant weather. We're prioritizing cultural experiences and food tours to match your preferences.",
  London: "Spring in London brings mild weather and fewer crowds. We're finding the best museum passes and historic walking tours for you.",
  Paris: "Paris in spring is magical - pleasant temperatures and outdoor cafe season. We're curating art, food, and Seine-side experiences.",
  "Cancún": "Perfect beach weather awaits. We're finding the best snorkeling spots, cenote tours, and authentic local food experiences.",
  "New York": "NYC in spring is vibrant - Central Park in bloom, outdoor dining, and Broadway season. We're finding the best deals for you.",
};

export function SearchProgress({ query }: SearchProgressProps) {
  const [activeStage, setActiveStage] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const intent = query ? parseIntent(query) : null;
  const destination = intent?.destination && intent.destination !== "Unknown" ? intent.destination : "your destination";
  const image = DESTINATION_IMAGES[destination] || "https://images.unsplash.com/photo-1488646472114-61fc8bca5cbb?w=800&q=60";
  const insight = DESTINATION_INSIGHTS[destination] || "We're analyzing your preferences to build the perfect trip brief.";

  useEffect(() => {
    const i1 = setInterval(() => setActiveStage((p) => Math.min(p + 1, STAGES.length - 1)), 700);
    const i2 = setInterval(() => setActiveStep((p) => Math.min(p + 1, STEPS.length - 1)), 1000);
    return () => { clearInterval(i1); clearInterval(i2); };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <header className="flex justify-between items-center px-8 md:px-12 py-6 bg-[#f7f9fb]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#002542]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <span className="text-lg font-extrabold text-[#002542]" style={{ fontFamily: "Manrope, sans-serif" }}>ClickLess AI</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <span className="font-bold text-[#002542]">New Trip</span>
          <span className="text-[#43474d] font-medium">Saved Trips</span>
        </nav>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#002542]" aria-label="Account">account_circle</span>
          <span className="material-symbols-outlined text-[#002542]" aria-label="Settings">settings</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 premium-gradient rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-white text-4xl">hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#002542] mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
            Building your unified trip brief...
          </h1>
          <p className="text-[#43474d] text-lg max-w-xl mx-auto">
            Synthesizing thousands of data points into a single, effortless itinerary tailored for your preferences.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {STAGES.map((stage, i) => {
            const isDone = i <= activeStage;
            return (
              <div key={stage.label} className={`bg-white p-5 rounded-2xl shadow-sm transition-all ${isDone ? "ring-1 ring-[#006a61]/20" : "opacity-60"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDone ? "bg-[#86f2e4] text-[#006a61]" : "bg-[#e6e8ea] text-[#43474d]"}`}>
                    <span className="material-symbols-outlined">{stage.icon}</span>
                  </div>
                  {isDone && <span className="material-symbols-outlined text-[#006a61]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                  {!isDone && i === activeStage + 1 && <span className="material-symbols-outlined text-[#43474d] animate-spin">progress_activity</span>}
                </div>
                <h3 className="font-bold text-sm mb-1">{stage.label}</h3>
                <p className="text-xs text-[#43474d] mb-3">{stage.sublabel}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${isDone ? "text-[#006a61]" : "text-[#43474d]"}`}>{stage.status}</span>
                  <span className="text-xs font-bold text-[#43474d]">{stage.pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4 mb-12 max-w-xl mx-auto">
          {STEPS.map((step, i) => (
            <div key={step} className={`flex items-center gap-3 transition-opacity ${i <= activeStep ? "opacity-100" : "opacity-30"}`}>
              <span className={`material-symbols-outlined text-sm ${i < activeStep ? "text-[#006a61]" : i === activeStep ? "text-[#002542] animate-pulse" : "text-[#c3c6ce]"}`}
                style={i < activeStep ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {i < activeStep ? "check_circle" : i === activeStep ? "pending" : "radio_button_unchecked"}
              </span>
              <span className={`text-sm ${i === activeStep ? "font-semibold text-[#002542]" : "text-[#43474d]"}`}>{step}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative h-64 rounded-2xl overflow-hidden shadow-lg">
            <img alt={`${destination} preview`} className="w-full h-full object-cover" src={image} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#002542]/80 to-transparent flex items-end p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#86f2e4]">Current Selection</p>
                <p className="text-white font-extrabold text-2xl" style={{ fontFamily: "Manrope, sans-serif" }}>{destination}</p>
              </div>
            </div>
          </div>
          <div className="md:w-80 bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#86f2e4] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#006a61] text-sm">auto_awesome</span>
              </div>
              <h3 className="font-bold text-[#002542]" style={{ fontFamily: "Manrope, sans-serif" }}>Expert Insight</h3>
            </div>
            <p className="text-sm text-[#43474d] leading-relaxed">{insight}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
