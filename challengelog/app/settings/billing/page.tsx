/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Settings as SettingsIcon, CreditCard, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

function BillingContent() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams?.get("mock_success") === "true") {
            toast.success("Successfully upgraded to Pro! (Mock)");
        }

        async function loadProfile() {
            try {
                const orderId = searchParams?.get("order_id");

                // Proactively verify order if returning from Cashfree
                if (orderId) {
                    await fetch("/api/cashfree/verify-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId })
                    });
                }

                const userRes = await fetch("/api/users/me");
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);
                    return userData;
                }
            } catch (err) {
                console.error("Failed to load user profile", err);
            } finally {
                setIsLoading(false);
            }
            return null;
        }

        if (session) {
            loadProfile();

            // Polling for upgrade status if order_id is present
            const orderId = searchParams?.get("order_id");
            if (orderId) {
                let attempts = 0;
                const interval = setInterval(async () => {
                    attempts++;
                    const updatedUser = await loadProfile();
                    if (updatedUser?.plan === "pro") {
                        toast.success("Welcome to Pro Plan!");
                        clearInterval(interval);
                    }
                    if (attempts > 10) clearInterval(interval); // Stop after 30s
                }, 3000);
                return () => clearInterval(interval);
            }
        }
    }, [session, searchParams]);

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            const res = await fetch("/api/cashfree/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: "pro" })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            if (data.payment_session_id) {
                // Initialize Cashfree-JS
                const rawMode = process.env.NEXT_PUBLIC_CASHFREE_MODE?.replace(/^['"]|['"]$/g, "").trim();
                const mode = rawMode === "PRODUCTION" ? "production" : "sandbox";
                const { load } = await import("@cashfreepayments/cashfree-js");
                const cashfree = await load({
                    mode: mode
                });

                // Trigger Checkout
                await cashfree.checkout({
                    paymentSessionId: data.payment_session_id,
                    redirectTarget: "_self", // Or "_modal"
                });
            } else {
                toast.error("Payment Session ID not found");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to initiate upgrade");
        } finally {
            setIsUpgrading(false);
        }
    };

    const isPro = user?.plan === "pro";

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Header section */}
            <div className="bg-background border-b-2 border-border px-6 py-6 sticky top-0 z-20">
                <div className="max-w-[800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <Link href="/dashboard" className="text-[12px] font-bold text-foreground/60 tracking-widest uppercase mb-4 flex items-center gap-2 hover:text-primary transition-colors">
                            <ChevronLeft size={14} /> BACK TO DASHBOARD
                        </Link>
                        <h1 className="text-[40px] md:text-[48px] font-serif font-bold italic tracking-tight text-foreground leading-none flex items-center gap-4">
                            Settings
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => signOut({ callbackUrl: "/signin" })}
                            className="text-[12px] font-bold uppercase tracking-widest text-foreground/60 hover:text-secondary transition-colors px-3 py-2"
                        >
                            LOG OUT
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-[800px] mx-auto px-6 mt-12 flex flex-col md:flex-row gap-8">
                {/* Sidebar Nav */}
                <div className="w-full md:w-64 shrink-0 flex flex-col gap-2 relative">
                    {user?.plan === 'free' && (
                        <div className="mb-4 bg-primary/10 border-2 border-primary text-primary px-4 py-3 neo-shadow-sm">
                            <p className="text-[12px] font-bold uppercase tracking-widest mb-1">Free Plan</p>
                            <p className="text-[14px] font-medium leading-tight opacity-90">Max 2 projects.<br />Watermarked PDFs.</p>
                        </div>
                    )}
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-foreground/60 hover:text-foreground font-bold text-[14px] uppercase tracking-wider transition-colors hover:bg-card">
                        <SettingsIcon size={18} /> General
                    </Link>
                    <Link href="/settings/billing" className="flex items-center gap-3 px-4 py-3 bg-card border-l-[4px] border-primary text-foreground font-bold text-[14px] uppercase tracking-wider neo-shadow-sm">
                        <CreditCard size={18} /> Billing
                    </Link>
                </div>

                {/* Settings Form */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : (
                        <div className="bg-card border-2 border-border p-8 neo-shadow flex flex-col gap-8">
                            <div>
                                <h2 className="text-[24px] font-serif font-bold italic mb-6">Billing & Subscription</h2>

                                <div className={`border-2 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isPro ? "border-primary bg-primary/5" : "border-border"}`}>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-[20px] font-serif font-bold italic uppercase">{isPro ? "Pro Plan" : "Free Plan"}</h3>
                                            {isPro && <CheckCircle2 className="text-primary" size={20} />}
                                        </div>
                                        <p className="text-foreground/70 text-[14px] font-medium mb-4">
                                            {isPro
                                                ? "You have unlimited projects and unwatermarked PDFs."
                                                : "You are limited to 2 projects and watermarked PDFs."}
                                        </p>
                                        <div className="flex flex-col gap-1 text-[13px] font-medium text-foreground/60">
                                            {isPro ? (
                                                <p>Next billing date: 1 month from today</p>
                                            ) : (
                                                <p>Upgrade to remove limits and watermarks.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
                                        {isPro ? (
                                            <button
                                                className="w-full px-6 py-3 border-2 border-border text-foreground text-[12px] font-bold uppercase tracking-widest hover:bg-background transition-colors text-center"
                                                onClick={() => toast.info("Manage subscription portal integration pending...")}
                                            >
                                                MANAGE PLAN
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleUpgrade}
                                                disabled={isUpgrading}
                                                className="w-full px-8 py-4 bg-primary text-background text-[13px] font-bold uppercase tracking-widest hover:-translate-y-1 active:translate-y-0 transition-transform flex items-center justify-center gap-2 border-2 border-border neo-shadow"
                                            >
                                                {isUpgrading ? <Loader2 className="animate-spin" size={16} /> : null}
                                                {isUpgrading ? "LOADING..." : "UPGRADE TO PRO ($49/mo)"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>}>
            <BillingContent />
        </Suspense>
    );
}
