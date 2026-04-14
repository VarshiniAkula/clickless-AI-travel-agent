"use client";

import { useState, useCallback } from "react";
import type { TripBrief } from "@/lib/types";
import { HeroHome } from "@/components/trip/hero-home";
import { ConversationalPlanning } from "@/components/trip/conversational-planning";
import { SearchProgress } from "@/components/trip/search-progress";
import { TripBriefView } from "@/components/trip/trip-brief-view";
import { SavedTripsView } from "@/components/trip/saved-trips-view";

type AppState = "home" | "planning" | "searching" | "results" | "saved";

export default function Home() {
  const [state, setState] = useState<AppState>("home");
  const [query, setQuery] = useState("");
  const [brief, setBrief] = useState<TripBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 1: User submits initial query → go to chat/planning page
  const handleSubmit = (q: string) => {
    setQuery(q);
    setError(null);
    setState("planning");
  };

  // Step 2: User explicitly triggers search from the planning page
  const handleSearch = useCallback(async (finalQuery: string) => {
    setQuery(finalQuery);
    setState("searching");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: finalQuery }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setState("planning");
        return;
      }
      setBrief(data);
      setState("results");
    } catch {
      setError("Failed to connect. Please try again.");
      setState("planning");
    }
  }, []);

  const handleNewTrip = () => {
    setState("home");
    setBrief(null);
    setQuery("");
    setError(null);
  };

  const handleShowSaved = () => {
    setState("saved");
  };

  const handleViewTrip = (trip: TripBrief) => {
    setBrief(trip);
    setState("results");
  };

  if (state === "home") {
    return <HeroHome onSubmit={handleSubmit} onShowSaved={handleShowSaved} error={error} />;
  }

  if (state === "planning") {
    return (
      <ConversationalPlanning
        query={query}
        onSearch={handleSearch}
        onNewTrip={handleNewTrip}
        onShowSaved={handleShowSaved}
        error={error}
      />
    );
  }

  if (state === "searching") {
    return <SearchProgress query={query} />;
  }

  if (state === "results" && brief) {
    return <TripBriefView brief={brief} onNewTrip={handleNewTrip} onShowSaved={handleShowSaved} />;
  }

  if (state === "saved") {
    return <SavedTripsView onNewTrip={handleNewTrip} onViewTrip={handleViewTrip} />;
  }

  return null;
}
