/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/lib/auth";

export default async function Home() {
  const session = await getServerSession(authConfig);
  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen">

        {/* Hero Section */}
        <section className="relative pt-[140px] pb-[100px] lg:pt-[180px] lg:pb-[140px] overflow-hidden bg-background">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">

              {/* Left Content Column */}
              <div className="w-full lg:w-[48%] max-w-2xl text-left">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 border border-border bg-card text-[11px] font-bold tracking-[0.1em] text-foreground mb-8 uppercase relative">
                  <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-primary"></div>
                  FOR INTERIOR DESIGNERS
                </div>

                {/* Main Heading */}
                <h1 className="text-[54px] sm:text-[64px] lg:text-[76px] xl:text-[84px] font-serif font-bold text-foreground mb-6 leading-[1.05] tracking-tight">
                  Stop giving <br className="hidden lg:block" />
                  away your <br className="hidden lg:block" />
                  work <span className="relative inline-block italic pr-2">
                    for free
                    <svg className="absolute -bottom-3 left-0 w-full h-5 text-secondary z-0 opacity-90" viewBox="0 0 200 20" preserveAspectRatio="none">
                      <path d="M5 15Q50 5 195 12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>
                </h1>

                {/* Subtext */}
                <p className="text-[20px] md:text-[22px] text-foreground/80 mb-12 max-w-[540px] leading-[1.6]">
                  Track every change order. Protect your scope. Get paid for every revision. Built for designers who value their time.
                </p>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
                  {session ? (
                    <Link href="/dashboard" className="w-full sm:w-auto px-10 py-4 lg:py-4.5 bg-primary text-background text-[14px] font-bold tracking-wide uppercase hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all text-center rounded-[4px] border-2 border-border neo-shadow">
                      GO TO DASHBOARD
                    </Link>
                  ) : (
                    <>
                      <Link href="/signup" className="w-full sm:w-auto px-10 py-4 lg:py-4.5 bg-primary text-background text-[14px] font-bold tracking-wide uppercase hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all text-center rounded-[4px] border-2 border-border neo-shadow">
                        START FREE TRIAL
                      </Link>
                      <Link href="/demo" className="w-full sm:w-auto px-10 py-4 lg:py-4.5 bg-transparent text-foreground border-[1.5px] border-border text-[14px] font-bold tracking-wide uppercase hover:bg-muted transition-all text-center rounded-[4px]">
                        WATCH DEMO
                      </Link>
                    </>
                  )}
                </div>

                {/* Metrics Bar */}
                <div className="flex flex-wrap lg:flex-nowrap items-start gap-10 md:gap-14 pt-8 border-t border-border/60">
                  <div>
                    <div className="text-[32px] md:text-[40px] font-bold text-primary mb-1 leading-none">$8.4K</div>
                    <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-[0.1em] max-w-[150px] leading-relaxed">AVERAGE RECOVERED PER DESIGNER/MONTH</div>
                  </div>
                  <div>
                    <div className="text-[32px] md:text-[40px] font-bold text-primary mb-1 leading-none">73%</div>
                    <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-[0.1em] max-w-[150px] leading-relaxed">OF DESIGNERS TRACK SCOPE CREEP BETTER</div>
                  </div>
                  <div>
                    <div className="text-[32px] md:text-[40px] font-bold text-primary mb-1 leading-none">30s</div>
                    <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-[0.1em] max-w-[150px] leading-relaxed">TO LOG A CHANGE ORDER</div>
                  </div>
                </div>
              </div>

              {/* Dashboard Mockup Visual */}
              <div className="w-full lg:w-[48%] xl:w-[45%] mt-12 lg:mt-0 relative">
                {/* Decorative Background Offsets */}
                <div className="absolute -top-3 -right-3 bottom-3 left-3 border-[1.5px] border-foreground/10 z-0"></div>
                <div className="absolute top-3 right-3 -bottom-3 -left-3 bg-primary/10 z-0"></div>

                {/* Main Container */}
                <div className="bg-card border-2 border-foreground rounded-[4px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden relative z-10 w-full min-h-[500px]">

                  {/* Header */}
                  <div className="px-6 py-5 bg-card border-b-[1.5px] border-border/80 flex justify-between items-start">
                    <div>
                      <h3 className="text-[16px] font-bold text-foreground tracking-wide uppercase">CHANGE ORDERS</h3>
                      <div className="text-[14px] text-foreground/60 mt-0.5">March 2026 — Active Projects</div>
                    </div>
                    <div className="flex items-center gap-1.5 border-[1.5px] border-primary/30 bg-primary/10 px-2.5 py-1 rounded-[4px]">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wide">LIVE</span>
                    </div>
                  </div>

                  {/* List Items */}
                  <div className="flex flex-col bg-card">
                    {/* Item 1 */}
                    <div className="p-5 border-b-[1px] border-border/60 hover:bg-muted/30 transition-colors flex justify-between items-start">
                      <div>
                        <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 flex gap-2">
                          <span className="text-foreground/40">#001</span> WESTWOOD RESIDENCE
                        </div>
                        <div className="text-[15px] font-medium text-foreground mb-3">Add 2 custom light fixtures</div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border-[1.5px] border-[#E65D47]/40 text-[#E65D47] bg-[#E65D47]/5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          OUT OF SCOPE
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="text-[22px] font-bold text-foreground font-serif tracking-tight mb-1 leading-none">$2,400</div>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest">BILLABLE</div>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-5 border-b-[1px] border-border/60 hover:bg-muted/30 transition-colors flex justify-between items-start">
                      <div>
                        <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 flex gap-2">
                          <span className="text-foreground/40">#002</span> MARINA PENTHOUSE
                        </div>
                        <div className="text-[15px] font-medium text-foreground mb-3">Source vintage dining chairs</div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border-[1.5px] border-primary/40 text-primary bg-primary/5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          APPROVED
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="text-[22px] font-bold text-foreground font-serif tracking-tight mb-1 leading-none">$1,200</div>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest">BILLABLE</div>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="p-5 border-b-[1px] border-border/60 hover:bg-muted/30 transition-colors flex justify-between items-start">
                      <div>
                        <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 flex gap-2">
                          <span className="text-foreground/40">#003</span> HILLSIDE ESTATE
                        </div>
                        <div className="text-[15px] font-medium text-foreground mb-3">Coordinate with contractor on tile</div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border-[1.5px] border-[#E65D47]/40 text-[#E65D47] bg-[#E65D47]/5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          OUT OF SCOPE
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="text-[22px] font-bold text-foreground font-serif tracking-tight leading-none">$0</div>
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div className="p-5 hover:bg-muted/30 transition-colors flex justify-between items-start border-b-[4px] border-foreground">
                      <div>
                        <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 flex gap-2">
                          <span className="text-foreground/40">#004</span> DOWNTOWN LOFT
                        </div>
                        <div className="text-[15px] font-medium text-foreground mb-3">Revise floor plan (3rd iteration)</div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border-[1.5px] border-[#E65D47]/40 text-[#E65D47] bg-[#E65D47]/5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          OUT OF SCOPE
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="text-[22px] font-bold text-foreground font-serif tracking-tight mb-1 leading-none">$850</div>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest">BILLABLE</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="bg-primary px-6 py-6 flex justify-between items-center text-background">
                    <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-white/90">TOTAL RECOVERED THIS MONTH</div>
                    <div className="text-[36px] font-serif font-bold tracking-tight text-white leading-none">$3,250</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Process Section */}
        <section id="process" className="py-24 bg-background border-t-2 border-border overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
            <div className="mb-16">
              {/* Small Label */}
              <div className="text-[12px] font-bold text-primary tracking-widest uppercase mb-4 flex items-center gap-4">
                <div className="w-12 h-[2px] bg-primary"></div>
                THE PROCESS
              </div>
              {/* Main Heading */}
              <h2 className="text-[48px] md:text-[60px] font-serif font-bold italic text-foreground leading-tight">
                How it works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 relative">
              {/* Optional connecting line across steps */}
              <div className="hidden md:block absolute top-[120px] left-[15%] right-[15%] h-px bg-border/20 z-0"></div>

              {[
                {
                  step: "01",
                  title: "DEFINE YOUR SCOPE",
                  desc: "Upload your contract and let our AI identify what is in and out of scope."
                },
                {
                  step: "02",
                  title: "CLIENT REQUESTS CHANGE",
                  desc: "Receive an email or text? Log it in ChangeLog with one click."
                },
                {
                  step: "03",
                  title: "AUTO-FLAG OUT OF SCOPE",
                  desc: "Our AI instantly determines if the request is billable or included."
                },
                {
                  step: "04",
                  title: "SEND INVOICE",
                  desc: "Generate a professional change order invoice in seconds."
                }
              ].map((item, i) => (
                <div key={i} className="relative p-8 md:p-10 bg-card border-[1.5px] border-border neo-shadow transition-transform hover:-translate-y-1 group">
                  {/* Large Numeral (Outline) */}
                  <div
                    className="absolute right-4 md:-right-8 top-1/2 -translate-y-1/2 text-[120px] md:text-[180px] font-bold z-0 pointer-events-none opacity-20 dark:opacity-10 text-transparent"
                    style={{ WebkitTextStroke: '1px var(--border)' }}
                  >
                    {item.step}
                  </div>

                  <div className="relative z-10">
                    {/* Icon Box */}
                    <div className="w-[40px] h-[40px] border-[1.5px] border-primary flex items-center justify-center mb-8 bg-background">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>

                    <h3 className="text-[16px] font-bold text-foreground uppercase tracking-wide mb-3">{item.title}</h3>
                    <p className="text-[16px] text-foreground/70 leading-relaxed max-w-[280px]">{item.desc}</p>
                  </div>

                  {/* L-Shaped Corner Accent */}
                  <div className="absolute bottom-[-1.5px] right-[-1.5px] w-6 h-6 border-b-[3px] border-r-[3px] border-secondary z-20"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-background border-t-2 border-border overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
            <div className="mb-20 text-center md:text-left">
              <h2 className="text-[48px] md:text-[64px] font-serif font-bold italic text-foreground max-w-3xl leading-tight">
                Everything you need to stop scope creep
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Main Feature - Left */}
              <div className="bg-primary p-10 md:p-14 text-background border-2 border-border neo-shadow flex flex-col justify-between relative">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 mb-8 bg-background text-foreground px-3 py-1.5 border-2 border-border">
                    <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" /></svg>
                    <span className="font-bold tracking-widest text-[11px] uppercase">POWERED BY AI</span>
                  </div>

                  <h3 className="text-[40px] md:text-[48px] font-serif font-bold italic mb-10 leading-none text-background dark:text-foreground">
                    Smart scope detection
                  </h3>

                  <div className="space-y-4 mb-16">
                    {['Contract Analysis', 'Auto Classification', 'Smart Pricing'].map((f, i) => (
                      <div key={i} className="flex items-center gap-4 bg-background/10 dark:bg-foreground/10 border border-background/20 dark:border-foreground/20 p-4 neo-shadow-sm">
                        <div className="w-6 h-6 bg-background text-primary flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="font-bold text-[14px] uppercase tracking-wide text-background dark:text-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 w-full mt-auto">
                  <div className="bg-background dark:bg-card border-2 border-border p-6 neo-shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-border pb-4">
                      <span className="text-foreground font-bold tracking-wide uppercase text-[12px]">Neural Scope Detection</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30 text-[10px] font-bold uppercase tracking-widest">Active</span>
                    </div>
                    <div className="w-full bg-muted h-3 border border-border mb-3 relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 bg-primary border-r border-border w-[85%]"></div>
                    </div>
                    <div className="text-[11px] font-bold tracking-widest text-foreground/50 uppercase">CONFIDENCE SCORE: 85%</div>
                  </div>
                </div>

                {/* L-Shaped Accent */}
                <div className="absolute top-[-2px] right-[-2px] w-12 h-12 border-t-[4px] border-r-[4px] border-secondary z-20 hidden md:block"></div>
              </div>

              {/* Supporting Features - Right */}
              <div className="flex flex-col justify-between gap-10">
                {[
                  {
                    title: "TIME TRACKING",
                    desc: "Automatically log hours spent on out-of-scope requests."
                  },
                  {
                    title: "CONTRACT TEMPLATES",
                    desc: "Pre-built templates with clear, legally binding scope definitions."
                  },
                  {
                    title: "CLIENT PORTAL",
                    desc: "Let clients review and approve change orders instantly."
                  }
                ].map((f, i) => (
                  <div key={i} className="bg-card p-8 md:p-10 border-2 border-border neo-shadow flex items-start gap-6 group hover:-translate-y-1 transition-transform relative">
                    <div className="w-[48px] h-[48px] shrink-0 border-2 border-primary flex items-center justify-center bg-primary/5">
                      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-[16px] font-bold text-foreground mb-3 uppercase tracking-wide">{f.title}</h4>
                      <p className="text-[16px] text-foreground/70 leading-relaxed">{f.desc}</p>
                    </div>
                    <div className="absolute top-4 right-4 text-border font-serif text-5xl italic opacity-30 group-hover:opacity-100 transition-opacity pointer-events-none z-0">
                      0{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Pricing Section */}
        <section id="pricing" className="py-24 md:py-32 bg-background border-t-2 border-border overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
            <div className="text-center md:text-left mb-16">
              <h2 className="text-[48px] md:text-[60px] font-serif font-bold italic text-foreground mb-4">Pricing</h2>
              <p className="text-[18px] text-foreground/70 flex items-center gap-4 justify-center md:justify-start">
                <span className="w-12 h-[2px] bg-primary"></span>
                SIMPLE, TRANSPARENT PLANS
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-10 mt-12 w-full max-w-[900px] mx-auto">
              {/* Free Tier */}
              <div className="bg-card p-8 border-[1.5px] border-border flex flex-col justify-between hover:bg-muted/10 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider">Free</h3>
                  </div>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-[64px] md:text-[72px] font-bold text-foreground leading-none">$0</span>
                    <span className="text-[14px] font-bold text-foreground/50 uppercase">/MONTH</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    {['2 active projects', 'Basic scope tracking', 'Standard email support'].map((f, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-[14px] text-foreground/80 font-medium">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/signup" className="flex justify-center items-center w-full py-4 border-[1.5px] border-border text-[14px] font-bold text-foreground bg-background hover:bg-muted transition-colors uppercase tracking-widest neo-shadow-sm">
                  START FOR FREE
                </Link>
              </div>

              {/* Solo Pro Tier (Featured) */}
              <div className="bg-card p-8 border-4 border-primary dark:border-primary flex flex-col justify-between relative neo-shadow transform md:-translate-y-4 z-10">
                <div className="absolute top-0 right-4 -translate-y-1/2 bg-primary text-background px-3 py-1 text-[11px] font-bold tracking-widest uppercase border-[1.5px] border-border">
                  MOST POPULAR
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider mb-6">Solo Pro</h3>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-[64px] md:text-[72px] font-bold text-foreground leading-none">$49</span>
                    <span className="text-[14px] font-bold text-foreground/50 uppercase">/MONTH</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    {['Unlimited projects', 'Neural AI scope detection', 'Custom client portal', 'Priority 24/7 support'].map((f, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-[14px] text-foreground font-bold">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/signup" className="flex justify-center items-center w-full py-4 bg-primary text-background border-2 border-border text-[14px] font-bold hover:bg-primary-hover transition-colors uppercase tracking-widest neo-shadow-sm">
                  START SOLO PRO
                </Link>
              </div>
            </div>

            <div className="text-center mt-16 text-[11px] font-bold text-foreground/50 tracking-widest uppercase">
              ALL PLANS INCLUDE 14-DAY FREE TRIAL • NO CREDIT CARD REQUIRED • CANCEL ANYTIME
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="reviews" className="py-24 md:py-32 bg-background border-t-2 border-border overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
            <div className="mb-20">
              <h2 className="text-[48px] md:text-[60px] font-serif font-bold italic text-foreground text-center md:text-left">
                Loved by designers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  name: "SARAH MITCHELL",
                  title: "PRINCIPAL DESIGNER",
                  tagTitle: "$12K RECOVERED",
                  tagColor: "bg-primary",
                  tagText: "text-background",
                  quote: "ChangeLog helped me recover over $12,000 in the first month alone. I was shocked at how much work I was doing for free."
                },
                {
                  name: "MARCUS CHEN",
                  title: "INDEPENDENT ARCHITECT",
                  tagTitle: "SAVED 40 HOURS",
                  tagColor: "bg-secondary",
                  tagText: "text-background",
                  quote: "The AI scope detection is incredible. It catches things I would have missed and saves me from awkward money conversations."
                },
                {
                  name: "ELENA RODRIGUEZ",
                  title: "STUDIO OWNER",
                  tagTitle: "CLIENTS RESPECT IT",
                  tagColor: "bg-amber-400 dark:bg-[#D9A65C]",
                  tagText: "text-black",
                  quote: "My clients actually respect my boundaries more now. ChangeLog gives me the absolute confidence to charge what I am worth."
                }
              ].map((t, i) => (
                <div key={i} className="relative bg-card p-10 border-2 border-border neo-shadow">
                  {/* Rectangular Tag over Top Border */}
                  <div className={`absolute top-0 right-6 -translate-y-1/2 ${t.tagColor} ${t.tagText} px-3 py-1.5 border-[1.5px] border-border text-[11px] font-bold tracking-widest uppercase z-10 block`}>
                    {t.tagTitle}
                  </div>

                  {/* Quote Icon Background */}
                  <div className="absolute top-4 left-6 text-[80px] font-serif italic leading-none opacity-10 text-foreground pointer-events-none">
                    &quot;
                  </div>

                  {/* Quote Text */}
                  <p className="text-[18px] text-foreground font-medium mb-12 relative z-10 leading-relaxed mt-4">
                    {t.quote}
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 border-t-[1.5px] border-border/50 pt-6 relative z-10">
                    <div className="w-10 h-10 border-[1.5px] border-border bg-muted grayscale flex items-center justify-center text-[14px] font-bold">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-foreground uppercase tracking-widest">{t.name}</div>
                      <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest mt-0.5">{t.title}</div>
                    </div>
                  </div>

                  {/* Faint Numeral */}
                  <div className="absolute bottom-4 right-6 text-[64px] font-bold font-serif opacity-5 z-0 pointer-events-none tracking-tighter">
                    0{i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 md:py-32 bg-primary dark:bg-[#00F5E1] border-t-2 border-border relative overflow-hidden">
          <div className="max-w-[1000px] mx-auto px-6 sm:px-8 text-center relative z-10">
            <h2 className="text-[48px] md:text-[72px] font-serif font-bold italic text-background mb-10 leading-tight">
              Ready to protect your scope?
            </h2>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12">
              <Link href="/signup" className="flex justify-center items-center w-full sm:w-auto px-10 py-5 bg-background text-foreground text-[14px] font-bold uppercase tracking-widest border-2 border-border hover:bg-muted transition-colors neo-shadow transform hover:-translate-y-1">
                START FREE TRIAL
              </Link>
              <Link href="/signup" className="flex justify-center items-center w-full sm:w-auto px-10 py-5 bg-transparent text-background border-2 border-background text-[14px] font-bold uppercase tracking-widest hover:bg-background/10 transition-colors">
                SCHEDULE DEMO
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[11px] font-bold uppercase tracking-widest text-background/90 mix-blend-color-burn dark:mix-blend-normal dark:text-foreground/80">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                FREE 14-DAY TRIAL
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                NO CREDIT CARD
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                CANCEL ANYTIME
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 border-l-2 border-b-2 border-border/20 -translate-y-1/2 translate-x-1/2 rotate-45 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 border-t-2 border-r-2 border-border/20 translate-y-1/2 -translate-x-1/2 rotate-12 pointer-events-none"></div>
        </section>
      </div>
      <Footer />
    </>
  );
}