"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    if (pathname.startsWith('/dashboard')) return null;

    return (
        <footer className="bg-background pt-24 pb-12 border-t-[3px] border-border relative z-20">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-6 group">
                            <div className="w-10 h-10 bg-primary border-2 border-border text-background flex items-center justify-center neo-shadow-sm group-hover:-translate-y-0.5 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <span className="font-serif font-bold text-[28px] italic tracking-tight text-foreground">ChangeLog</span>
                        </Link>
                        <p className="text-foreground/80 text-[16px] mb-8 max-w-sm font-medium">
                            Stop giving away your work for free. Protect your scope and get paid for every revision.
                        </p>
                        <div className="flex space-x-4">
                            {/* Social Icons Placeholder */}
                            {['Twitter', 'LinkedIn', 'Instagram', 'Email'].map((social) => (
                                <a key={social} href="#" className="w-10 h-10 bg-card border-2 border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-background hover:-translate-y-1 transition-all neo-shadow-sm" aria-label={social}>
                                    <span className="text-[12px] font-bold uppercase">{social[0]}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Nav Columns */}
                    <div>
                        <h4 className="font-bold text-[14px] uppercase tracking-widest text-foreground mb-6">Product</h4>
                        <ul className="space-y-4 font-bold text-[14px]">
                            <li><Link href="#features" className="text-foreground/70 hover:text-primary transition-colors uppercase tracking-wider">Features</Link></li>
                            <li><Link href="#pricing" className="text-foreground/70 hover:text-primary transition-colors uppercase tracking-wider">Pricing</Link></li>
                            <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors uppercase tracking-wider">Integrations</Link></li>
                            <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors uppercase tracking-wider">Changelog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-[14px] uppercase tracking-widest text-foreground mb-6">Company</h4>
                        <ul className="space-y-4 font-bold text-[14px]">
                            <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors uppercase tracking-wider">About</Link></li>
                            <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors uppercase tracking-wider">Blog</Link></li>
                            <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors uppercase tracking-wider">Careers</Link></li>
                            <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors uppercase tracking-wider">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-[14px] uppercase tracking-widest text-foreground mb-6">Resources</h4>
                        <ul className="space-y-4 font-bold text-[14px]">
                            <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors uppercase tracking-wider">Help Center</Link></li>
                            <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors uppercase tracking-wider">API Docs</Link></li>
                            <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors uppercase tracking-wider">Terms</Link></li>
                            <li><Link href="#" className="text-foreground/70 hover:text-primary transition-colors uppercase tracking-wider">Privacy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Newsletter & Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center py-10 border-t-2 border-border mt-16 gap-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                        <span className="text-[12px] font-bold tracking-widest uppercase text-foreground">WEEKLY TIPS FOR DESIGNERS</span>
                        <div className="flex w-full sm:w-auto mt-2 sm:mt-0 relative neo-shadow-sm">
                            <input
                                type="email"
                                placeholder="EMAIL ADDRESS"
                                className="px-4 py-3 border-y-2 border-l-2 border-r-0 border-border bg-card text-foreground focus:outline-none focus:bg-background tracking-widest text-[12px] font-bold w-full sm:w-64"
                            />
                            <button className="bg-foreground text-background border-2 border-border px-8 py-3 font-bold hover:bg-foreground/80 transition-colors uppercase tracking-widest text-[12px]">
                                SUBSCRIBE
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-foreground/60 mt-6 md:mt-0">
                        <span>© 2026 CHANGELOG. ALL RIGHTS RESERVED.</span>
                        <div className="hidden md:flex gap-6">
                            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                            <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
