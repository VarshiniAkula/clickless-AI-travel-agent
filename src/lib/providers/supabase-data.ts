/**
 * Supabase Dynamic Data Provider
 *
 * Fetches flights, hotels, and activities from Supabase cached tables.
 * Dynamically filters based on user intent: destination, budget, duration,
 * interests, and cabin class. Falls back to demo-data when Supabase is
 * unavailable or returns no results.
 */

import { getSupabase } from "@/lib/supabase/client";
import type { FlightOption, HotelOption, ActivityOption, TravelIntent } from "@/lib/types";
import { getFlights as getDemoFlights, getHotels as getDemoHotels, getActivities as getDemoActivities } from "./demo-data";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize city name for case-insensitive matching */
function normalizeCity(city: string): string {
  return city.trim().replace(/['']/g, "").toLowerCase();
}

/**
 * Determine what cabin classes to query based on budget per-person per-leg.
 * With a $40k budget, business/first class makes sense.
 * With a $5k budget, only economy.
 */
function cabinClassesForBudget(budgetPerLeg: number): string[] {
  if (budgetPerLeg >= 4000) return ["economy", "premium_economy", "business", "first"];
  if (budgetPerLeg >= 1500) return ["economy", "premium_economy", "business"];
  if (budgetPerLeg >= 800) return ["economy", "premium_economy"];
  return ["economy"];
}

/**
 * Determine hotel star class tiers based on nightly budget.
 */
function hotelTiersForBudget(nightlyBudget: number): string[] {
  if (nightlyBudget >= 600) return ["budget", "mid-range", "luxury", "ultra-luxury"];
  if (nightlyBudget >= 250) return ["budget", "mid-range", "luxury"];
  if (nightlyBudget >= 100) return ["budget", "mid-range"];
  return ["budget"];
}

// ── Flights ──────────────────────────────────────────────────────────────────

export async function getSupabaseFlights(intent: TravelIntent): Promise<FlightOption[]> {
  const supabase = getSupabase();
  if (!supabase) return getDemoFlights(intent.destination);

  try {
    const dest = normalizeCity(intent.destination);

    // Budget allocation: ~30% of total budget for flights (round-trip = 2 legs)
    const totalBudget = intent.budget || 5000;
    const flightBudgetPerLeg = Math.round((totalBudget * 0.30) / 2);
    const allowedCabins = cabinClassesForBudget(flightBudgetPerLeg);

    const { data, error } = await supabase
      .from("cached_flights")
      .select("*")
      .ilike("destination", `%${dest}%`)
      .in("cabin_class", allowedCabins)
      .lte("price", flightBudgetPerLeg)
      .order("price", { ascending: true })
      .limit(10);

    if (error || !data || data.length === 0) {
      console.warn("Supabase flights: falling back to demo data", error?.message);
      return getDemoFlights(intent.destination);
    }

    return data.map((row) => ({
      id: row.id,
      airline: row.airline,
      origin: row.origin || intent.origin || "Phoenix",
      destination: row.destination_code || row.destination,
      departureTime: row.departure_time || "",
      arrivalTime: row.arrival_time || "",
      duration: row.duration || "",
      stops: row.stops || 0,
      price: Number(row.price),
      currency: row.currency || "USD",
      bookingUrl: row.booking_url,
      source: `Supabase/${row.source || "cache"}`,
    }));
  } catch (err) {
    console.warn("Supabase flights error, using demo data:", err);
    return getDemoFlights(intent.destination);
  }
}

// ── Hotels ───────────────────────────────────────────────────────────────────

export async function getSupabaseHotels(intent: TravelIntent): Promise<HotelOption[]> {
  const supabase = getSupabase();
  if (!supabase) return getDemoHotels(intent.destination);

  try {
    const dest = normalizeCity(intent.destination);
    const nights = Math.max((intent.duration || 5) - 1, 1);
    const totalBudget = intent.budget || 5000;

    // ~35% of budget for hotels, divided by nights = max nightly rate
    const maxNightly = Math.round((totalBudget * 0.35) / nights);
    const allowedTiers = hotelTiersForBudget(maxNightly);

    const { data, error } = await supabase
      .from("cached_hotels")
      .select("*")
      .ilike("destination", `%${dest}%`)
      .in("star_class", allowedTiers)
      .lte("price_per_night", maxNightly)
      .order("rating", { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      // If budget is very high but no results (shouldn't happen), try without price filter
      if (totalBudget > 10000) {
        const { data: fallback } = await supabase
          .from("cached_hotels")
          .select("*")
          .ilike("destination", `%${dest}%`)
          .order("rating", { ascending: false })
          .limit(10);

        if (fallback && fallback.length > 0) {
          return fallback.map(mapHotelRow);
        }
      }
      console.warn("Supabase hotels: falling back to demo data", error?.message);
      return getDemoHotels(intent.destination);
    }

    return data.map(mapHotelRow);
  } catch (err) {
    console.warn("Supabase hotels error, using demo data:", err);
    return getDemoHotels(intent.destination);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHotelRow(row: any): HotelOption {
  return {
    id: row.id,
    name: row.name,
    rating: Number(row.rating),
    pricePerNight: Number(row.price_per_night),
    currency: row.currency || "USD",
    neighborhood: row.neighborhood,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    imageUrl: row.image_url,
    bookingUrl: row.booking_url,
    source: `Supabase/${row.source || "cache"}`,
  };
}

// ── Activities ───────────────────────────────────────────────────────────────

export async function getSupabaseActivities(intent: TravelIntent): Promise<ActivityOption[]> {
  const supabase = getSupabase();
  if (!supabase) return getDemoActivities(intent.destination, intent.activities);

  try {
    const dest = normalizeCity(intent.destination);
    const totalBudget = intent.budget || 5000;

    // ~15% of budget for activities
    const activityBudget = Math.round(totalBudget * 0.15);
    // Per-activity max: spread across (days * 2) activities
    const totalDays = intent.duration || 5;
    const maxPerActivity = Math.round(activityBudget / (totalDays * 2));

    // First, get activities matching user interests (priority)
    let interestActivities: ActivityOption[] = [];
    if (intent.activities.length > 0) {
      const conditions = intent.activities.map((a) => `%${a.toLowerCase()}%`);

      // Query for each interest category
      const promises = conditions.map((cond) =>
        supabase
          .from("cached_activities")
          .select("*")
          .ilike("destination", `%${dest}%`)
          .ilike("category", cond)
          .order("rating", { ascending: false })
          .limit(6)
      );
      const results = await Promise.all(promises);
      const allMatched = results.flatMap((r) => r.data || []);
      // Deduplicate by id
      const seen = new Set<string>();
      for (const row of allMatched) {
        if (!seen.has(row.id)) {
          seen.add(row.id);
          interestActivities.push(mapActivityRow(row));
        }
      }
    }

    // Also get general activities for the destination (fill gaps)
    const { data: generalData } = await supabase
      .from("cached_activities")
      .select("*")
      .ilike("destination", `%${dest}%`)
      .lte("estimated_cost", Math.max(maxPerActivity, 150)) // don't filter too aggressively
      .order("rating", { ascending: false })
      .limit(20);

    const generalActivities = (generalData || []).map(mapActivityRow);

    // Merge: interest-matched first, then general (deduplicated)
    const seenIds = new Set(interestActivities.map((a) => a.id));
    const merged = [...interestActivities];
    for (const a of generalActivities) {
      if (!seenIds.has(a.id)) {
        seenIds.add(a.id);
        merged.push(a);
      }
    }

    if (merged.length === 0) {
      console.warn("Supabase activities: no results, falling back to demo data");
      return getDemoActivities(intent.destination, intent.activities);
    }

    return merged;
  } catch (err) {
    console.warn("Supabase activities error, using demo data:", err);
    return getDemoActivities(intent.destination, intent.activities);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapActivityRow(row: any): ActivityOption {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description || "",
    estimatedCost: Number(row.estimated_cost) || 0,
    duration: row.duration,
    location: row.location,
    rating: Number(row.rating) || 0,
  };
}

// ── Combined Fetch ───────────────────────────────────────────────────────────

/**
 * Fetch all data from Supabase in parallel, dynamically filtered by user intent.
 *
 * Budget drives cabin class, hotel tier, and activity cost filtering:
 * - $40k budget -> first class flights, ultra-luxury hotels, premium activities
 * - $5k budget  -> economy flights, budget/mid-range hotels, affordable activities
 */
export async function getSupabaseData(intent: TravelIntent): Promise<{
  flights: FlightOption[];
  hotels: HotelOption[];
  activities: ActivityOption[];
}> {
  const [flights, hotels, activities] = await Promise.all([
    getSupabaseFlights(intent),
    getSupabaseHotels(intent),
    getSupabaseActivities(intent),
  ]);

  return { flights, hotels, activities };
}
