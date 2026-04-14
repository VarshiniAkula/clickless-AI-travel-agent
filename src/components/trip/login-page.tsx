"use client";

import { useState } from "react";
import { useAuth } from "@/lib/supabase/auth";

interface LoginPageProps {
  onSkip: () => void;
}

export function LoginPage({ onSkip }: LoginPageProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
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
    <div className="min-h-screen bg-[#f7f9fb] flex">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            alt="Travel inspiration"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#002542]/90 to-[#006a61]/80" />
        </div>
        <div className="p-12 relative z-10">
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Manrope, sans-serif" }}>ClickLess AI</h1>
          <p className="text-white/60 text-sm mt-1">Digital Concierge</p>
        </div>
        <div className="p-12 relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
            One utterance to a<br />complete trip brief.
          </h2>
          <p className="text-white/70 text-lg max-w-md">
            Speak or type your dream journey. Our AI gathers sources, compares options, and delivers a ranked trip brief — all in seconds.
          </p>
        </div>
      </div>

      {/* Right — auth form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 text-center">
            <h1 className="text-2xl font-black text-[#002542]" style={{ fontFamily: "Manrope, sans-serif" }}>ClickLess AI</h1>
            <p className="text-[#43474d] text-sm">Digital Concierge</p>
          </div>

          <h2 className="text-3xl font-extrabold text-[#002542] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-[#43474d] mb-8">
            {mode === "login" ? "Sign in to access your saved trips and preferences." : "Start planning smarter trips with AI."}
          </p>

          {/* Google OAuth */}
          <button onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white rounded-xl text-sm font-semibold text-[#002542] shadow-sm border border-[#e6e8ea] hover:bg-[#f2f4f6] transition-colors mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#e6e8ea]" />
            <span className="text-xs font-medium text-[#73777e] uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-[#e6e8ea]" />
          </div>

          {/* Email/Password Form */}
          <div className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#43474d] mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border border-[#e6e8ea] bg-white focus:ring-2 focus:ring-[#006a61]/20 focus:border-[#006a61] outline-none transition-all text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#43474d] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#e6e8ea] bg-white focus:ring-2 focus:ring-[#006a61]/20 focus:border-[#006a61] outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#43474d] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => { if (e.key === "Enter") handleEmailSubmit(); }}
                className="w-full px-4 py-3 rounded-xl border border-[#e6e8ea] bg-white focus:ring-2 focus:ring-[#006a61]/20 focus:border-[#006a61] outline-none transition-all text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span> {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span> {success}
              </div>
            )}

            <button
              onClick={handleEmailSubmit}
              disabled={loading}
              className="w-full premium-gradient text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>

          {/* Toggle mode */}
          <p className="text-center text-sm text-[#43474d] mt-6">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccess(null); }}
              className="text-[#006a61] font-bold hover:underline">
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>

          {/* Skip */}
          <div className="text-center mt-8">
            <button onClick={onSkip} className="text-xs text-[#73777e] hover:text-[#002542] transition-colors underline underline-offset-2">
              Continue without signing in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
