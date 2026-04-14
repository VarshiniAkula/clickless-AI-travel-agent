"use client";

import { useState } from "react";
import { useAuth } from "@/lib/supabase/auth";

interface LoginPageProps {
  onSkip: () => void;
}

export function LoginPage({ onSkip }: LoginPageProps) {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    setError(null);

    if (mode === "login") {
      const result = await signInWithEmail(email, password);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      }
    } else {
      const result = await signUpWithEmail(email, password, name);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        setSuccess("Check your email to confirm your account, then sign in.");
        setMode("login");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#f7f9fb] flex items-center justify-center px-4 py-8 sm:px-6 md:px-8">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-[#002542]/5 border border-[#e6e8ea]/60 px-6 py-8 sm:px-10 sm:py-10">
          {/* Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl premium-gradient mb-4 shadow-lg">
              <span className="material-symbols-outlined text-white text-2xl sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>travel_explore</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#002542]" style={{ fontFamily: "Manrope, sans-serif" }}>ClickLess AI</h1>
            <p className="text-[#73777e] text-xs sm:text-sm mt-1">Digital Concierge</p>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#002542] mb-1 text-center" style={{ fontFamily: "Manrope, sans-serif" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-[#43474d] text-xs sm:text-sm mb-6 sm:mb-8 text-center">
            {mode === "login" ? "Sign in to access your saved trips." : "Start planning smarter trips with AI."}
          </p>

          {/* Form */}
          <div className="space-y-3 sm:space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#43474d] mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-[#e6e8ea] bg-[#f7f9fb] focus:bg-white focus:ring-2 focus:ring-[#006a61]/20 focus:border-[#006a61] outline-none transition-all text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#43474d] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-[#e6e8ea] bg-[#f7f9fb] focus:bg-white focus:ring-2 focus:ring-[#006a61]/20 focus:border-[#006a61] outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#43474d] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => { if (e.key === "Enter") handleEmailSubmit(); }}
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-[#e6e8ea] bg-[#f7f9fb] focus:bg-white focus:ring-2 focus:ring-[#006a61]/20 focus:border-[#006a61] outline-none transition-all text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm flex-shrink-0">error</span> {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm flex-shrink-0">check_circle</span> {success}
              </div>
            )}

            <button
              onClick={handleEmailSubmit}
              disabled={loading}
              className="w-full premium-gradient text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>

          {/* Toggle mode */}
          <p className="text-center text-xs sm:text-sm text-[#43474d] mt-5 sm:mt-6">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccess(null); }}
              className="text-[#006a61] font-bold hover:underline">
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

        {/* Skip — outside card */}
        <div className="text-center mt-6">
          <button onClick={onSkip} className="text-xs text-[#73777e] hover:text-[#002542] transition-colors underline underline-offset-2">
            Continue without signing in
          </button>
        </div>
      </div>
    </div>
  );
}
