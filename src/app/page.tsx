"use client";

import { useState } from "react";
import type { TripBrief } from "@/lib/types";
import { ChatInput } from "@/components/trip/chat-input";
import { TripResults } from "@/components/trip/trip-results";
import { SearchProgress } from "@/components/trip/search-progress";
import { SavedTrips } from "@/components/trip/saved-trips";
import { Compass } from "lucide-react";

export default function Home() {
  const [brief, setBrief] = useState<TripBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setBrief(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setBrief(data);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg premium-gradient">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">ClickLess AI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1 rounded-full bg-teal/10 text-teal">
              Demo Mode
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero area when no results */}
        {!brief && !isLoading && (
          <div className="text-center py-16">
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
              Your AI Travel Concierge
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Tell me where you want to go. I&apos;ll find flights, hotels, build your itinerary,
              and pack your bags — all in seconds.
            </p>
          </div>
        )}

        {/* Input */}
        {!isLoading && (
          <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mt-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && <SearchProgress />}

        {/* Results */}
        {brief && !isLoading && (
          <div className="mt-8">
            <TripResults brief={brief} />
          </div>
        )}

        {/* Saved trips */}
        {!brief && !isLoading && (
          <SavedTrips onSelect={(t) => setBrief(t)} />
        )}
      </div>
    </main>
  );
}
