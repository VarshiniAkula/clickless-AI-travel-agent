"use client";

import { useState } from "react";
import type { TripBrief } from "@/lib/types";
import { HeroHome } from "@/components/trip/hero-home";
import { ConversationalPlanning } from "@/components/trip/conversational-planning";
import { SearchProgress } from "@/components/trip/search-progress";
import { TripBriefView } from "@/components/trip/trip-brief-view";

type AppState = "home" | "planning" | "searching" | "results";

export default function Home() {
  const [state, setState] = useState<AppState>("home");
  const [query, setQuery] = useState("");
  const [brief, setBrief] = useState<TripBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (q: string) => {
    setQuery(q);
    setState("planning");

    // Short delay to show conversational planning, then search
    setTimeout(async () => {
      setState("searching");
      try {
        const res = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Something went wrong");
          setState("home");
          return;
        }
        setBrief(data);
        setState("results");
      } catch {
        setError("Failed to connect. Please try again.");
        setState("home");
      }
    }, 3000);
  };

  const handleNewTrip = () => {
    setState("home");
    setBrief(null);
    setQuery("");
    setError(null);
  };

  if (state === "home") {
    return <HeroHome onSubmit={handleSubmit} error={error} />;
  }

  if (state === "planning") {
    return <ConversationalPlanning query={query} onSearchStart={() => setState("searching")} />;
  }

  if (state === "searching") {
    return <SearchProgress />;
  }

  if (state === "results" && brief) {
    return <TripBriefView brief={brief} onNewTrip={handleNewTrip} />;
  }

  return null;
}
