"use client";

import { useState, useRef, useEffect } from "react";
import { parseIntent } from "@/lib/nlu/parser";

interface ConversationalPlanningProps {
  query: string;
  onSearch: (finalQuery: string) => void;
  onNewTrip: () => void;
  onShowSaved: () => void;
  error: string | null;
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  chips?: string[];
}

export function ConversationalPlanning({ query, onSearch, onNewTrip, onShowSaved, error }: ConversationalPlanningProps) {
  const [currentQuery, setCurrentQuery] = useState(query);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showResponse, setShowResponse] = useState(false);
  const [activeNav, setActiveNav] = useState("new-trip");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const intent = parseIntent(currentQuery);
  const destination = intent.destination !== "Unknown" ? intent.destination : "your destination";

  // Initial AI response with delay for natural feel
  useEffect(() => {
    setMessages([{ role: "user", content: query }]);
    const t = setTimeout(() => {
      setShowResponse(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `${destination} sounds amazing! I've analyzed your request and extracted the key details shown on the right.\n\n${intent.budget ? `Working within your $${intent.budget} budget. ` : ""}${intent.activities.length > 0 ? `Focusing on ${intent.activities.join(" and ")}. ` : ""}You can refine your preferences below, or tap **"Search Now"** when you're ready for me to build your trip brief.`,
          chips: ["Add flight preference", "Set budget", "Change dates", "Add activities"],
        },
      ]);
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Append user message
    const updatedQuery = `${currentQuery}, ${trimmed}`;
    setCurrentQuery(updatedQuery);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInputValue("");

    // Parse updated intent and generate AI response
    const updatedIntent = parseIntent(updatedQuery);
    const newDest = updatedIntent.destination !== "Unknown" ? updatedIntent.destination : destination;

    setTimeout(() => {
      let response = `Got it! I've updated your preferences. `;
      if (updatedIntent.budget) response += `Budget set to $${updatedIntent.budget}. `;
      if (updatedIntent.activities.length > 0) response += `Interests: ${updatedIntent.activities.join(", ")}. `;
      response += `\n\nYour trip to **${newDest}** is looking great. Hit **"Search Now"** when you're ready, or keep refining!`;

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: response, chips: ["More budget options", "Add hotel preference", "Search Now"] },
      ]);
    }, 500);
  };

  const handleChipClick = (chip: string) => {
    if (chip === "Search Now") {
      onSearch(currentQuery);
      return;
    }
    setInputValue(chip.toLowerCase());
  };

  const handleSearchClick = () => {
    onSearch(currentQuery);
  };

  return (
    <div className="flex h-screen bg-[#f7f9fb]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#f2f4f6] py-6 z-50">
        <div className="px-8 mb-10">
          <h1 className="text-lg font-black text-[#002542]" style={{ fontFamily: "Manrope, sans-serif" }}>ClickLess AI</h1>
          <p className="text-xs text-[#43474d] font-medium">Digital Concierge</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={onNewTrip}
            className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-r-full transition-colors ${activeNav === "new-trip" ? "text-[#002542] font-bold bg-white" : "text-[#43474d] hover:bg-white/50"}`}
            aria-current={activeNav === "new-trip" ? "page" : undefined}>
            <span className="material-symbols-outlined">add_circle</span><span>New Trip</span>
          </button>
          <button onClick={onShowSaved}
            className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-r-full transition-colors ${activeNav === "saved" ? "text-[#002542] font-bold bg-white" : "text-[#43474d] hover:bg-white/50"}`}>
            <span className="material-symbols-outlined">bookmark</span><span>Saved Trips</span>
          </button>
          {[
            { id: "profile", icon: "person", label: "Profile" },
            { id: "prefs", icon: "tune", label: "Preferences" },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-r-full transition-colors ${activeNav === item.id ? "text-[#002542] font-bold bg-white" : "text-[#43474d] hover:bg-white/50"}`}
              aria-current={activeNav === item.id ? "page" : undefined}>
              <span className="material-symbols-outlined">{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-4 pt-4 border-t border-[#c3c6ce]/15 space-y-1">
          <button className="flex items-center gap-3 px-4 py-2 text-[#43474d] text-sm hover:text-[#002542] w-full text-left" aria-label="Help">
            <span className="material-symbols-outlined text-sm">help</span><span>Help</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-2 text-[#43474d] text-sm hover:text-[#002542] w-full text-left" aria-label="Logout">
            <span className="material-symbols-outlined text-sm">logout</span><span>Logout</span>
          </button>
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#006a61]">refining preferences</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="premium-gradient text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
              onClick={handleSearchClick}>
              <span className="material-symbols-outlined text-sm">search</span>
              Search Now
            </button>
            <button className="p-2 text-[#43474d] hover:text-[#002542] transition-colors" aria-label="Settings">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#e6e8ea] premium-gradient flex items-center justify-center text-white">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="mx-8 mt-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span> {error}
          </div>
        )}

        <div className="flex-1 flex flex-col lg:flex-row gap-8 px-8 pb-32">
          {/* Chat Area */}
          <section className="flex-1 flex flex-col gap-6 max-w-3xl">
            <div className="space-y-6 mt-4">
              {messages.map((msg, i) => (
                <div key={i}>
                  {msg.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] premium-gradient text-white px-6 py-4 rounded-2xl rounded-tr-none shadow-sm">
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="w-8 h-8 rounded-full premium-gradient flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      </div>
                      <div className="max-w-[85%] space-y-3">
                        <div className="bg-white p-6 rounded-2xl rounded-tl-none shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
                          {msg.content.split("\n\n").map((p, j) => (
                            <p key={j} className={`text-[#191c1e] ${j > 0 ? "mt-3" : ""}`}
                              dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#006a61]">$1</strong>') }} />
                          ))}
                        </div>
                        {msg.chips && (
                          <div className="flex flex-wrap gap-2">
                            {msg.chips.map((chip) => (
                              <button key={chip} onClick={() => handleChipClick(chip)}
                                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${chip === "Search Now" ? "premium-gradient text-white shadow-md hover:scale-105 active:scale-95" : "bg-[#e6e8ea] text-[#43474d] hover:bg-[#86f2e4] hover:text-[#006a61]"}`}>
                                {chip === "Search Now" && <span className="material-symbols-outlined text-xs mr-1 align-middle">search</span>}
                                {chip}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
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
                  {intent.duration && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#43474d] block mb-1">Duration</label>
                      <span className="text-[#191c1e] font-semibold">{intent.duration} nights</span>
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

              {/* Destination Image */}
              <div className="relative h-48 rounded-2xl overflow-hidden group shadow-lg">
                <img alt={`${destination} inspiration`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src={getDestinationImage(intent.destination)} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#002542]/80 to-transparent flex items-end p-6">
                  <div>
                    <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
                      {intent.destination !== "Unknown" ? intent.destination : "Your Destination"}
                    </p>
                    <p className="text-white/70 text-xs">Curating the best experience</p>
                  </div>
                </div>
              </div>

              {/* Search CTA */}
              <button onClick={handleSearchClick}
                className="w-full premium-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">travel_explore</span>
                Build My Trip Brief
              </button>
            </div>
          </section>
        </div>

        {/* Floating Input */}
        <div className="fixed bottom-10 left-8 right-8 md:left-72 md:right-auto md:w-[calc(100%-20rem)] lg:max-w-3xl z-30">
          <div className="glass-panel p-2 rounded-xl shadow-lg flex items-center gap-2 border border-white/20">
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none px-4 py-3 text-[#191c1e] placeholder:text-[#43474d]/60"
              placeholder="Add preferences: budget, activities, hotel style..."
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
            />
            <div className="flex items-center gap-2 pr-2">
              <button onClick={handleSendMessage}
                className="w-12 h-12 premium-gradient rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
                aria-label="Send message">
                <span className="material-symbols-outlined">send</span>
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
