 "use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities, @next/next/no-img-element */
import { useState } from "react";
import { toast, Toaster } from "sonner";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("You're on the list! We'll notify you soon.");
        setEmail("");
      } else {
        const error = await res.json();
        toast.error(error.message || "Something went wrong.");
      }
    } catch (err) {
      toast.error("Failed to join waitlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 border-l-2 border-b-2 border-border/10 -translate-y-1/2 translate-x-1/2 rotate-45 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 border-t-2 border-r-2 border-border/10 translate-y-1/2 -translate-x-1/2 rotate-12 pointer-events-none"></div>
      
      {/* Abstract Grid Lines */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 border-2 border-border bg-card text-[11px] font-bold tracking-[0.2em] text-foreground mb-12 uppercase relative neo-shadow-sm">
          COMING SOON TO YOUR STUDIO
        </div>

        {/* Hero Heading */}
        <h1 className="text-[54px] sm:text-[72px] lg:text-[84px] font-serif font-bold italic text-foreground mb-8 leading-[1.05] tracking-tight">
          The end of <br className="hidden sm:block" />
          <span className="relative inline-block text-secondary pr-3 group">
            scope creep
            <svg className="absolute -bottom-3 left-0 w-full h-5 text-secondary/30 z-0" viewBox="0 0 200 20" preserveAspectRatio="none">
              <path d="M5 15Q50 5 195 12" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </span> <br className="hidden sm:block" />
          is near.
        </h1>

        <p className="text-[20px] md:text-[24px] text-foreground/70 mb-16 max-w-[600px] mx-auto leading-[1.6]">
          Protect your time. Get paid for every revision. Built for interior designers who value their craft.
        </p>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-md mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-6 py-4 bg-card border-2 border-border text-[16px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-foreground/30 font-medium"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-primary text-background text-[14px] font-bold tracking-widest uppercase hover:bg-primary-hover transition-all neo-shadow active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            {loading ? "JOINING..." : "NOTIFY ME"}
          </button>
        </form>

        {/* Footer Info */}
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 text-[11px] font-bold uppercase tracking-widest text-foreground/50">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            NEURAL AI LOGGING
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            CUSTOM PORTALS
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            SCOPE PROTECTION
          </div>
        </div>
      </div>

      {/* Extreme Bottom Bar */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center opacity-40">
        <div className="text-[10px] font-bold tracking-[0.5em] text-foreground uppercase">
          CHALLENGELOG © 2026
        </div>
      </div>
    </div>
  );
}
