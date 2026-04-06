"use client";

import { useEffect, useState } from "react";
import { parseIntent } from "@/lib/nlu/parser";

interface ConversationalPlanningProps {
  query: string;
  onSearchStart: () => void;
}

export function ConversationalPlanning({ query, onSearchStart }: ConversationalPlanningProps) {
  const intent = parseIntent(query);
  const [showResponse, setShowResponse] = useState(false);
  const [showChips, setShowChips] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowResponse(true), 800);
    const t2 = setTimeout(() => setShowChips(true), 1500);
    const t3 = setTimeout(() => onSearchStart(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onSearchStart]);

  const destination = intent.destination !== "Unknown" ? intent.destination : "your destination";

  return (
    <div className="flex h-screen bg-[#f7f9fb]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#f2f4f6] py-6 z-50">
        <div className="px-8 mb-10">
          <h1 className="text-lg font-black text-[#002542]" style={{ fontFamily: "Manrope, sans-serif" }}>ClickLess AI</h1>
          <p className="text-xs text-[#43474d] font-medium">Digital Concierge</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a className="flex items-center gap-3 px-4 py-3 text-[#002542] font-bold bg-white rounded-r-full" href="#">
            <span className="material-symbols-outlined">add_circle</span>
            <span>New Trip</span>
          </a>
          {[
            { icon: "bookmark", label: "Saved Trips" },
            { icon: "person", label: "Profile" },
            { icon: "tune", label: "Preferences" },
          ].map((item) => (
            <a key={item.label} className="flex items-center gap-3 px-4 py-3 text-[#43474d] hover:bg-white/50 rounded-r-full transition-all" href="#">
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="px-6 mb-6">
          <button className="w-full py-3 px-4 premium-gradient text-white rounded-lg text-sm font-semibold shadow-sm">
            Upgrade to Premium
          </button>
        </div>
        <div className="px-4 pt-6 border-t border-[#c3c6ce]/15 space-y-2">
          <a className="flex items-center gap-3 px-4 py-2 text-[#43474d] text-sm hover:text-[#002542]" href="#">
            <span className="material-symbols-outlined text-sm">help</span><span>Help</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-2 text-[#43474d] text-sm hover:text-[#002542]" href="#">
            <span className="material-symbols-outlined text-sm">logout</span><span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="flex justify-between items-center px-8 py-4 bg-[#f7f9fb]/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-xl tracking-tight text-[#002542]" style={{ fontFamily: "Manrope, sans-serif" }}>
              Planning: {destination}
            </h2>
            <div className="bg-[#86f2e4]/30 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#006a61]">searching sources...</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-[#43474d] hover:text-[#002542] transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#e6e8ea] premium-gradient flex items-center justify-center text-white">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-8 px-8 pb-32">
          {/* Chat Area */}
          <section className="flex-1 flex flex-col gap-6 max-w-3xl">
            <div className="space-y-8 mt-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] premium-gradient text-white px-6 py-4 rounded-2xl rounded-tr-none shadow-sm">
                  <p>{query}</p>
                </div>
              </div>

              {/* AI Response */}
              {showResponse && (
                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-8 h-8 rounded-full premium-gradient flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                  <div className="max-w-[85%] space-y-4">
                    <div className="bg-white p-6 rounded-2xl rounded-tl-none shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
                      <p className="text-[#191c1e] mb-4">
                        {destination} sounds amazing! I&apos;ve started analyzing flights, hotels, and local activities based on your preferences.
                        {intent.budget ? ` Working within your $${intent.budget} budget.` : ""}
                        {intent.activities.length > 0 ? ` Focusing on ${intent.activities.join(" and ")}.` : ""}
                      </p>
                      <p className="font-semibold text-[#006a61]">
                        I&apos;m building your personalized trip brief now. This will take just a moment...
                      </p>
                    </div>
                    {showChips && (
                      <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
                        <span className="px-4 py-2 bg-[#86f2e4] text-[#006a61] rounded-full text-xs font-semibold">Add flight preference</span>
                        <span className="px-4 py-2 bg-[#e6e8ea] text-[#43474d] rounded-full text-xs font-semibold">Show budget options</span>
                        <span className="px-4 py-2 bg-[#e6e8ea] text-[#43474d] rounded-full text-xs font-semibold">Change dates</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Intent Dashboard */}
          <section className="w-full lg:w-80 flex flex-col gap-6">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-[#c3c6ce]/10">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-[#006a61]">psychology</span>
                  <h3 className="font-bold text-[#002542] tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Extracted Intent</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#43474d] block mb-1">Destination</label>
                    <span className="text-[#191c1e] font-semibold text-lg">{intent.destination !== "Unknown" ? intent.destination : "Analyzing..."}</span>
                  </div>
                  {intent.dates && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#43474d] block mb-1">Dates</label>
                      <span className="text-[#191c1e] font-semibold">{intent.dates.start} to {intent.dates.end}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#43474d] block mb-1">Travelers</label>
                      <span className="text-[#191c1e] font-semibold">{intent.travelers} {intent.travelers === 1 ? "Adult" : "Adults"}</span>
                    </div>
                    {intent.budget && (
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#43474d] block mb-1">Budget</label>
                        <span className="text-[#006a61] font-semibold">&lt;${intent.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  {intent.activities.length > 0 && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#43474d] block mb-2">Preferences</label>
                      <div className="flex flex-wrap gap-2">
                        {intent.activities.map((a) => (
                          <span key={a} className="px-3 py-1 bg-[#31394e]/10 text-[#1c2337] rounded-full text-xs font-medium capitalize">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Context Card */}
              <div className="relative h-48 rounded-2xl overflow-hidden group shadow-lg">
                <img
                  alt={`${destination} inspiration`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src={getDestinationImage(intent.destination)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#002542]/80 to-transparent flex items-end p-6">
                  <div>
                    <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
                      {intent.destination !== "Unknown" ? intent.destination : "Your Destination"}
                    </p>
                    <p className="text-white/70 text-xs">Curating the best experience</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Floating Input */}
        <div className="fixed bottom-10 left-8 right-8 md:left-72 md:right-auto md:w-[calc(100%-20rem)] lg:max-w-3xl z-30">
          <div className="glass-panel p-2 rounded-xl shadow-lg flex items-center gap-2 border border-white/20">
            <input className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none px-4 py-3 text-[#191c1e] placeholder:text-[#43474d]/60" placeholder="Tell me more about your preferences..." type="text" readOnly />
            <div className="flex items-center gap-2 pr-2">
              <button className="w-12 h-12 flex items-center justify-center text-[#43474d] hover:text-[#002542] transition-colors">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <button className="w-12 h-12 premium-gradient rounded-full flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function getDestinationImage(dest: string): string {
  const images: Record<string, string> = {
    Tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=60",
    London: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=60",
    Paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=60",
    "Cancún": "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=60",
    "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=60",
  };
  return images[dest] || "https://images.unsplash.com/photo-1488646472114-61fc8bca5cbb?w=800&q=60";
}
