"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    if (pathname.startsWith('/dashboard')) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b-[1px] border-border/50">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
                <div className="flex justify-between items-center h-[88px]">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center pr-6">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary text-background rounded flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {/* Gauge/Metrics Icon matching design roughly */}
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M4 5h16" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-sans font-bold text-[22px] leading-none text-foreground tracking-tight">ChangeLog</span>
                                <span className="font-sans text-[10px] leading-none text-foreground/60 tracking-[0.15em] uppercase mt-1">SCOPE PROTECTION</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Links - Center */}
                    <div className="hidden md:flex space-x-12">
                        <Link href="#features" className="text-[13px] font-medium tracking-[0.05em] text-foreground/70 hover:text-foreground transition-colors uppercase">FEATURES</Link>
                        <Link href="#process" className="text-[13px] font-medium tracking-[0.05em] text-foreground/70 hover:text-foreground transition-colors uppercase">PROCESS</Link>
                        <Link href="#pricing" className="text-[13px] font-medium tracking-[0.05em] text-foreground/70 hover:text-foreground transition-colors uppercase">PRICING</Link>
                        <Link href="#reviews" className="text-[13px] font-medium tracking-[0.05em] text-foreground/70 hover:text-foreground transition-colors uppercase">REVIEWS</Link>
                    </div>

                    {/* Actions - Right */}
                    <div className="flex items-center space-x-5 pl-6">
                        <ThemeToggle />
                        {session ? (
                            <Link href="/dashboard" className="text-[13px] font-semibold tracking-wide text-background bg-primary px-7 py-2.5 rounded hover:bg-primary-hover transition-colors uppercase neo-shadow-sm border-2 border-border">
                                DASHBOARD
                            </Link>
                        ) : (
                            <>
                                <Link href="/signin" className="hidden md:inline-flex text-[13px] font-semibold tracking-wide text-foreground border-[1.5px] border-border px-6 py-2.5 rounded hover:bg-muted transition-colors uppercase">
                                    SIGN IN
                                </Link>
                                <Link href="/signup" className="text-[13px] font-semibold tracking-wide text-background bg-primary px-7 py-2.5 rounded hover:bg-primary-hover transition-colors uppercase">
                                    START FREE
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
