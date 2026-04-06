"use client";

import { useState } from "react";
import type { TripBrief } from "@/lib/types";

interface TripBriefViewProps {
  brief: TripBrief;
  onNewTrip: () => void;
}

export function TripBriefView({ brief, onNewTrip }: TripBriefViewProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "compare">("overview");
  const nights = brief.intent.duration || 5;
  const topFlight = brief.flights[0];
  const topHotel = brief.hotels[0];

  const toggleReadback = () => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(brief.summary);
    u.rate = 0.9;
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  const handleSave = () => {
    try {
      const trips = JSON.parse(localStorage.getItem("clickless_saved_trips") || "[]");
      trips.unshift({ ...brief, savedAt: new Date().toISOString() });
      localStorage.setItem("clickless_saved_trips", JSON.stringify(trips.slice(0, 20)));
      setSaved(true);
    } catch { /* */ }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f9fb]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#f2f4f6] py-6 z-50">
        <div className="px-8 mb-10">
          <h1 className="text-lg font-black text-[#002542]" style={{ fontFamily: "Manrope, sans-serif" }}>ClickLess AI</h1>
          <p className="text-xs text-[#43474d] font-medium">Digital Concierge</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={onNewTrip} className="flex items-center gap-3 px-4 py-3 text-[#002542] font-bold bg-white rounded-r-full w-full text-left">
            <span className="material-symbols-outlined">add_circle</span><span>New Trip</span>
          </button>
          <a className="flex items-center gap-3 px-4 py-3 text-[#43474d] hover:bg-white/50 rounded-r-full" href="#">
            <span className="material-symbols-outlined">bookmark</span><span>Saved Trips</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[#43474d] hover:bg-white/50 rounded-r-full" href="#">
            <span className="material-symbols-outlined">person</span><span>Profile</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[#43474d] hover:bg-white/50 rounded-r-full" href="#">
            <span className="material-symbols-outlined">tune</span><span>Preferences</span>
          </a>
        </nav>
        <div className="px-6 mb-6">
          <button className="w-full py-3 px-4 premium-gradient text-white rounded-lg text-sm font-semibold">Upgrade to Premium</button>
        </div>
      </aside>

      {/* Main */}
      <main className="md:ml-64 flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="flex justify-between items-center px-8 py-4 bg-[#f7f9fb]/50 backdrop-blur-md sticky top-0 z-40">
          <nav className="hidden md:flex space-x-6">
            {(["overview", "itinerary", "compare"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`font-semibold capitalize transition-colors ${activeTab === tab ? "text-[#002542]" : "text-[#43474d] hover:text-[#002542]"}`}>
                {tab === "overview" ? "Trip Brief" : tab === "itinerary" ? "Itinerary" : "Compare"}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#002542] cursor-pointer">account_circle</span>
            <span className="material-symbols-outlined text-[#002542] cursor-pointer">settings</span>
          </div>
        </header>

        <div className="px-8 pb-24">
          {/* Title Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#86f2e4] text-[#006a61] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Active Plan</span>
                <span className="text-xs text-[#43474d]">Last updated: Just now</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#002542] leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
                {brief.intent.destination}: A {nights}-day Cultural Adventure
              </h1>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#43474d] mb-1">Estimated Budget</p>
              <p className="text-3xl font-extrabold text-[#002542]">${brief.budget.total.toLocaleString()}<span className="text-sm font-normal text-[#43474d]">/pp</span></p>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-3 space-y-6">
                {/* Best Flight Card */}
                {topFlight && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-[#002542]">flight</span>
                      <h3 className="font-bold text-[#002542]" style={{ fontFamily: "Manrope, sans-serif" }}>Best Flight</h3>
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-[#43474d] bg-[#f2f4f6] px-2 py-1 rounded-full">Demo Data</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-[#191c1e]">{topFlight.airline}</p>
                        <p className="text-sm text-[#43474d]">{topFlight.stops === 0 ? "Direct" : `${topFlight.stops} stop`} · {topFlight.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-[#002542]">${topFlight.price}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#43474d]">Round Trip</p>
                      </div>
                    </div>
                    <div className="mt-4 bg-[#86f2e4]/20 p-3 rounded-xl text-sm text-[#006a61] italic">
                      &quot;Best balance of time and price. {topFlight.stops === 0 ? "Nonstop flight." : `${topFlight.stops} stop for savings.`}&quot;
                    </div>
                  </div>
                )}

                {/* Weather */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#002542]">cloud</span>
                    <h3 className="font-bold text-[#002542]" style={{ fontFamily: "Manrope, sans-serif" }}>Weather Snapshot</h3>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {brief.weather.slice(0, 5).map((w) => {
                      const day = new Date(w.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
                      return (
                        <div key={w.date} className="flex-shrink-0 w-16 text-center">
                          <p className="text-[10px] font-bold text-[#43474d] mb-2">{day}</p>
                          <span className="material-symbols-outlined text-2xl text-[#002542]">
                            {w.condition.toLowerCase().includes("rain") ? "rainy" : w.condition.toLowerCase().includes("cloud") ? "cloud" : "sunny"}
                          </span>
                          <p className="text-sm font-bold mt-1">{w.tempHighF}°</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Concierge Intelligence */}
                <div className="premium-gradient p-6 rounded-2xl text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#86f2e4]">auto_awesome</span>
                    <h3 className="font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>Concierge Intelligence</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Destination Norms</p>
                    {brief.culturalTips.slice(0, 3).map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[#86f2e4] text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <p className="text-sm text-white/90">{tip.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Itinerary Preview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#002542] text-lg" style={{ fontFamily: "Manrope, sans-serif" }}>Suggested Itinerary</h3>
                    <button onClick={() => setActiveTab("itinerary")} className="text-sm font-semibold text-[#006a61] hover:underline">View Full Schedule</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {brief.activities.slice(0, 4).map((act) => (
                      <div key={act.id} className="bg-white rounded-2xl overflow-hidden shadow-sm group">
                        <div className="h-32 relative overflow-hidden">
                          <img src={getActivityImage(act.category)} alt={act.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-sm mb-1">{act.name}</h4>
                          <p className="text-xs text-[#43474d]">{act.duration || "Half day"} · {act.location}</p>
                          {act.estimatedCost !== undefined && act.estimatedCost > 0 && (
                            <p className="text-xs text-[#006a61] font-semibold mt-1">${act.estimatedCost}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Hotel Card */}
                {topHotel && (
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="h-48 relative overflow-hidden">
                      <img src={getHotelImage(brief.intent.destination)} alt={topHotel.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 right-3 bg-[#86f2e4] text-[#006a61] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Demo</span>
                      <div className="absolute bottom-3 left-3 bg-[#86f2e4] text-[#006a61] px-3 py-1 rounded-full text-xs font-bold">{topHotel.rating}★ Match</div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-1">{topHotel.name}</h3>
                      <p className="text-xs text-[#43474d] mb-3">
                        ${topHotel.pricePerNight}/night · {topHotel.neighborhood || brief.intent.destination}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {topHotel.amenities.slice(0, 3).map((a) => (
                          <span key={a} className="px-2 py-1 bg-[#f2f4f6] rounded-full text-[10px] font-semibold text-[#43474d] flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">{getAmenityIcon(a)}</span> {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Budget Breakdown */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-[#002542] mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Budget Insight</h3>
                  {[
                    { label: "Flights (round trip)", amount: brief.budget.flights },
                    { label: "Hotels", amount: brief.budget.hotels },
                    { label: "Activities", amount: brief.budget.activities },
                    { label: "Food & Dining", amount: brief.budget.food },
                    { label: "Transport", amount: brief.budget.transport },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-[#f2f4f6] last:border-0">
                      <span className="text-sm text-[#43474d]">{item.label}</span>
                      <span className="text-sm font-semibold">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 mt-2">
                    <span className="font-bold text-[#002542]">Estimated Total</span>
                    <span className="font-extrabold text-[#002542] text-lg">${brief.budget.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Packing Quick View */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-[#002542] mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>Packing Essentials</h3>
                  <div className="space-y-2">
                    {brief.packingList.filter((p) => p.priority === "essential").slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[#006a61] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <span>{item.item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="premium-gradient p-5 rounded-2xl">
                  <h3 className="text-white font-bold mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: "bookmark", label: "Save", action: handleSave, done: saved },
                      { icon: "volume_up", label: "Read Aloud", action: toggleReadback, done: isSpeaking },
                      { icon: "share", label: "Share", action: () => navigator.clipboard.writeText(brief.summary) },
                      { icon: "download", label: "Export", action: () => {} },
                    ].map((btn) => (
                      <button key={btn.label} onClick={btn.action}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors">
                        <span className="material-symbols-outlined text-sm" style={btn.done ? { fontVariationSettings: "'FILL' 1" } : undefined}>{btn.icon}</span>
                        {btn.done && btn.label === "Save" ? "Saved!" : btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Itinerary Tab */}
          {activeTab === "itinerary" && (
            <div className="max-w-4xl">
              {/* Hero Banner */}
              <div className="relative h-56 rounded-2xl overflow-hidden mb-8 shadow-lg">
                <img src={getDestinationHero(brief.intent.destination)} alt={brief.intent.destination} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#002542]/80 to-transparent flex items-end p-8">
                  <div>
                    <span className="bg-[#86f2e4] text-[#006a61] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {nights + 1} Days · {brief.itinerary.reduce((a, d) => a + d.activities.length, 0)} Activities
                    </span>
                    <h2 className="text-3xl font-extrabold text-white mt-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                      {brief.intent.destination} Discovery
                    </h2>
                  </div>
                </div>
              </div>

              {/* Day Cards */}
              {brief.itinerary.map((day) => (
                <div key={day.day} className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 premium-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {String(day.day).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-[#002542]" style={{ fontFamily: "Manrope, sans-serif" }}>{day.title}</h3>
                      {day.date && <p className="text-xs text-[#43474d]">{new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>}
                    </div>
                  </div>
                  <div className="ml-5 pl-9 border-l-2 border-[#e6e8ea] space-y-4">
                    {day.activities.map((act, i) => (
                      <div key={i} className="bg-white p-5 rounded-2xl shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#43474d] mb-1">{act.time}</p>
                            <h4 className="font-bold text-[#191c1e]">{act.activity}</h4>
                            {act.location && (
                              <p className="text-xs text-[#43474d] flex items-center gap-1 mt-1">
                                <span className="material-symbols-outlined text-xs">location_on</span> {act.location}
                              </p>
                            )}
                          </div>
                          {act.cost !== undefined && act.cost > 0 && (
                            <span className="text-sm font-bold text-[#006a61]">${act.cost}</span>
                          )}
                        </div>
                        {act.notes && <p className="text-xs text-[#43474d] mt-2">{act.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compare Tab */}
          {activeTab === "compare" && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <span className="bg-[#86f2e4] text-[#006a61] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Comparing {brief.hotels.length} Hotels for {brief.intent.destination}
                </span>
                <h2 className="text-3xl font-extrabold text-[#002542] mt-3" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Comparing {brief.hotels.length} Hotels for {brief.intent.destination}
                </h2>
                <p className="text-[#43474d] mt-2">Our concierge has filtered the best matches based on your preferences.</p>
              </div>
              <div className="space-y-6">
                {brief.hotels.map((hotel, i) => (
                  <div key={hotel.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                      <img src={getHotelImage(brief.intent.destination)} alt={hotel.name} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-3 left-3 premium-gradient text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">#1 Match</span>
                      )}
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-xl text-[#002542]">{hotel.name}</h3>
                          <p className="text-xs text-[#43474d] flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            {hotel.neighborhood || brief.intent.destination}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-extrabold text-[#002542]">{hotel.rating * 20}%</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#43474d]">Match Score</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.amenities.map((a) => (
                          <span key={a} className="px-2 py-1 bg-[#f2f4f6] rounded-full text-[10px] font-semibold text-[#43474d]">{a}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-extrabold text-[#002542]">${hotel.pricePerNight}<span className="text-sm font-normal text-[#43474d]"> /night</span></p>
                        <button className="premium-gradient text-white px-5 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-transform">
                          {i === 0 ? "Select this option" : "Compare details"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 md:left-64 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-[#e6e8ea] py-3 px-8">
          <div className="flex justify-center gap-8">
            {[
              { icon: "bookmark", label: "Save" },
              { icon: "compare_arrows", label: "Compare" },
              { icon: "picture_as_pdf", label: "Export" },
              { icon: "share", label: "Share" },
            ].map((item) => (
              <button key={item.label} className="flex flex-col items-center text-[#43474d] hover:text-[#002542] transition-colors text-[10px] font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined mb-1">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function getActivityImage(category: string): string {
  const images: Record<string, string> = {
    temples: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=60",
    "food tours": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=60",
    sightseeing: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400&q=60",
    shopping: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=60",
    museums: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&q=60",
    culture: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=60",
    beaches: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=60",
  };
  return images[category] || "https://images.unsplash.com/photo-1488646472114-61fc8bca5cbb?w=400&q=60";
}

function getHotelImage(dest: string): string {
  const images: Record<string, string> = {
    Tokyo: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600&q=60",
    London: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=60",
    Paris: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=60",
    "New York": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=60",
  };
  return images[dest] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=60";
}

function getDestinationHero(dest: string): string {
  const images: Record<string, string> = {
    Tokyo: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&q=60",
    London: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=60",
    Paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=60",
    "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=60",
  };
  return images[dest] || "https://images.unsplash.com/photo-1488646472114-61fc8bca5cbb?w=1200&q=60";
}

function getAmenityIcon(amenity: string): string {
  const icons: Record<string, string> = {
    WiFi: "wifi", Pool: "pool", Spa: "spa", Restaurant: "restaurant",
    Gym: "fitness_center", Breakfast: "free_breakfast", Bar: "local_bar",
    Kitchen: "kitchen", Lounge: "weekend", Laundry: "local_laundry_service",
  };
  return icons[amenity] || "check";
}
