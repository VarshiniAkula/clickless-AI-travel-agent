import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/client";

// GET /api/trips — list saved trips for current user
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    // Fallback: return from localStorage prompt
    return NextResponse.json({ trips: [], source: "local" });
  }

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ trips: [], source: "local" });
  }

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ trips: [], source: "local" });
  }

  const { data: savedPlans, error } = await supabase
    .from("saved_plans")
    .select("id, saved_at, notes, trip_results(id, query, intent, result, created_at)")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false })
    .limit(20);

  if (error) {
    console.warn("Failed to fetch saved trips:", error);
    return NextResponse.json({ trips: [], source: "supabase", error: error.message });
  }

  return NextResponse.json({ trips: savedPlans || [], source: "supabase" });
}

// POST /api/trips — save a trip
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ saved: false, source: "local" });
  }

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ saved: false, source: "local" });
  }

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ saved: false, source: "local" });
  }

  const body = await req.json();
  const { tripBrief } = body;

  if (!tripBrief || !tripBrief.id) {
    return NextResponse.json({ error: "Trip brief required" }, { status: 400 });
  }

  // Upsert the trip result
  await supabase.from("trip_results").upsert({
    id: tripBrief.id,
    query: tripBrief.intent?.rawQuery || "",
    intent: tripBrief.intent,
    result: tripBrief,
    created_at: tripBrief.createdAt,
  });

  // Insert saved plan link
  const { error } = await supabase.from("saved_plans").insert({
    user_id: user.id,
    trip_result_id: tripBrief.id,
    notes: null,
    saved_at: new Date().toISOString(),
  });

  if (error) {
    // Might already be saved
    if (error.code === "23505") {
      return NextResponse.json({ saved: true, alreadySaved: true });
    }
    return NextResponse.json({ saved: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: true });
}

// DELETE /api/trips — remove a saved trip
export async function DELETE(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ deleted: false });
  }

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ deleted: false }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ deleted: false }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const planId = searchParams.get("id");
  if (!planId) return NextResponse.json({ error: "Plan ID required" }, { status: 400 });

  const { error } = await supabase
    .from("saved_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ deleted: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
