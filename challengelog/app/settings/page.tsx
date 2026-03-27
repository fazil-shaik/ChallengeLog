/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { User, Settings as SettingsIcon, CreditCard, ChevronLeft, Upload, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "sonner";
import { updateProfile } from "./actions";
import { IKUpload, ImageKitProvider } from "imagekitio-next";

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [hourlyRate, setHourlyRate] = useState("");
    
    const [logoUrl, setLogoUrl] = useState("");
    const [logoFileId, setLogoFileId] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const ikUploadRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function loadProfile() {
            try {
                // Fetch current user from DB
                const res = await fetch("/api/auth/session"); // NextAuth session or custom endpoint
                // Since session only has standard data, let's fetch from a dedicated route if needed or use session if customized
                // Actually the session object usually just has simple data. We should get it from our own endpoint or server action.
                // Let's create an effect to fetch `/api/users/me` if we need the full user, or we can just fetch it directly in a server component.
                // For now, I'll assume we can create an api route for `me` or use NextAuth if configured.
                
                // Workaround: We'll fetch from an API route we will create.
                const userRes = await fetch("/api/users/me");
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);
                    setName(userData.name || "");
                    setEmail(userData.email || "");
                    setHourlyRate(userData.hourlyRate || "0");
                    setLogoUrl(userData.logoUrl || "");
                    setLogoFileId(userData.logoFileId || "");
                }
            } catch (err) {
                console.error("Failed to load user profile", err);
            } finally {
                setIsLoading(false);
            }
        }
        if (session) {
            loadProfile();
        }
    }, [session]);

    const authenticator = async () => {
        try {
            const response = await fetch("/api/upload");
            if (!response.ok) {
                throw new Error("Authentication request failed");
            }
            const data = await response.json();
            return {
                signature: data.signature,
                expire: data.expire,
                token: data.token,
            };
        } catch (error: any) {
            throw new Error(`Authentication request failed: ${error.message}`);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        try {
            const res = await updateProfile(user.id, {
                name,
                email,
                hourlyRate,
                logoUrl,
                logoFileId,
                oldLogoFileId: user.logoFileId
            });
            if (res.error) throw new Error(res.error);
            toast.success("Profile updated successfully");
            // Also user session update conceptually
            updateSession();
            
            // update local state so next save doesn't delete the newly uploaded logo
            setUser({ ...user, name, email, hourlyRate, logoUrl, logoFileId });
        } catch (err: any) {
            toast.error(err.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ImageKitProvider
            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
            authenticator={authenticator}
        >
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
                                <p className="text-[14px] font-medium leading-tight opacity-90">Max 2 projects.<br/>Watermarked PDFs.</p>
                            </div>
                        )}
                        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 bg-card border-l-[4px] border-primary text-foreground font-bold text-[14px] uppercase tracking-wider neo-shadow-sm">
                            <SettingsIcon size={18} /> General
                        </Link>
                        <Link href="/settings/billing" className="flex items-center gap-3 px-4 py-3 text-foreground/60 hover:text-foreground font-bold text-[14px] uppercase tracking-wider transition-colors hover:bg-card">
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
                            <form onSubmit={handleSave} className="bg-card border-2 border-border p-8 neo-shadow flex flex-col gap-8">
                                <div>
                                    <h2 className="text-[24px] font-serif font-bold italic mb-6">Profile Settings</h2>
                                    
                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <label className="block text-[12px] font-bold uppercase tracking-widest text-foreground/70 mb-2">Display Name</label>
                                            <input 
                                                type="text" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-background border-2 border-border px-4 py-3 text-[16px] font-medium focus:outline-none focus:border-primary transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[12px] font-bold uppercase tracking-widest text-foreground/70 mb-2">Email Address</label>
                                            <input 
                                                type="email" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-background border-2 border-border px-4 py-3 text-[16px] font-medium focus:outline-none focus:border-primary transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[12px] font-bold uppercase tracking-widest text-foreground/70 mb-2">Hourly Rate ($)</label>
                                            <input 
                                                type="number" 
                                                value={hourlyRate}
                                                onChange={(e) => setHourlyRate(e.target.value)}
                                                className="w-full bg-background border-2 border-border px-4 py-3 text-[16px] font-medium focus:outline-none focus:border-primary transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[12px] font-bold uppercase tracking-widest text-foreground/70 mb-2">Workspace Logo</label>
                                            <div className="flex items-center gap-6 mt-2">
                                                {logoUrl ? (
                                                    <div className="w-20 h-20 rounded-full border-2 border-border overflow-hidden bg-background">
                                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-border bg-background flex items-center justify-center text-foreground/40">
                                                        <User size={32} />
                                                    </div>
                                                )}
                                                <div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => user?.plan !== 'free' ? ikUploadRef.current?.click() : toast.error("Custom logo is a Pro feature. Please upgrade to use it.")} 
                                                        className={`px-4 py-2 border-2 border-border text-[12px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${user?.plan === 'free' ? 'opacity-50 cursor-not-allowed bg-muted' : 'hover:bg-primary/5'}`} 
                                                        disabled={isUploading || user?.plan === 'free'}
                                                    >
                                                        {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                                        {isUploading ? "UPLOADING..." : user?.plan === 'free' ? "PRO FEATURE" : "UPLOAD NEW LOGO"}
                                                    </button>
                                                    {user?.plan === 'free' ? (
                                                        <p className="text-[12px] text-primary font-bold mt-2 uppercase tracking-wide">
                                                            <Link href="/settings/billing" className="hover:underline">Upgrade to Pro for custom branding</Link>
                                                        </p>
                                                    ) : (
                                                        <p className="text-[12px] text-foreground/50 mt-2">Recommended: 256x256px PNG or JPG</p>
                                                    )}
                                                </div>
                                                
                                                {/* Hidden IKUpload */}
                                                <div className="hidden">
                                                    <IKUpload
                                                        ref={ikUploadRef}
                                                        fileName="workspace-logo"
                                                        folder="/challengelog-uploads/logos"
                                                        useUniqueFileName={true}
                                                        onUploadStart={() => setIsUploading(true)}
                                                        onUploadProgress={() => setIsUploading(true)}
                                                        onError={(err) => {
                                                            setIsUploading(false);
                                                            toast.error("Upload failed: " + err.message);
                                                        }}
                                                        onSuccess={(res) => {
                                                            setIsUploading(false);
                                                            setLogoUrl(res.url);
                                                            setLogoFileId(res.fileId);
                                                            toast.success("Logo uploaded successfully");
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t-[1.5px] border-border flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="bg-primary text-background px-8 py-3 font-bold uppercase tracking-widest text-[14px] border-2 border-border neo-shadow hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : null}
                                        {isSaving ? "SAVING..." : "SAVE CHANGES"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </ImageKitProvider>
    );
}
