"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setQuery(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const examples = [
    "Plan a 5-night Tokyo trip from Phoenix in April under $2000, I like temples and food tours.",
    "Weekend getaway to Cancún from Denver, budget $800, beach and nightlife.",
    "Family trip to London for 7 nights, museums and sightseeing.",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative glass-card rounded-2xl p-1">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Where do you want to go? Tell me everything..."
          className="min-h-[56px] max-h-[120px] resize-none border-0 bg-transparent pr-24 text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          disabled={isLoading}
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleVoice}
            className={`rounded-full h-9 w-9 ${isListening ? "bg-red-100 text-red-600 animate-pulse" : "text-muted-foreground hover:text-foreground"}`}
            disabled={isLoading}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className="rounded-full h-9 w-9 premium-gradient"
            size="icon"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {!isLoading && !query && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setQuery(ex)}
              className="text-xs px-3 py-1.5 rounded-full bg-surface-low text-muted-foreground hover:bg-surface-high hover:text-foreground transition-colors"
            >
              {ex.length > 60 ? ex.slice(0, 57) + "..." : ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
