"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities, @typescript-eslint/no-unused-vars, @next/next/no-img-element */

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, Clock, CheckCircle2, CircleDashed, Users, FileText, IndianRupee, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ThemeToggle from "@/components/ThemeToggle";

export default function Dashboard() {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [projRes, userRes] = await Promise.all([
                    fetch("/api/projects"),
                    fetch("/api/users/me")
                ]);
                if (projRes.ok) {
                    const data = await projRes.json();
                    setProjects(data);
                }
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);
                }
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setIsLoading(false);
            }
        }
        if (session) {
            loadData();
        }
    }, [session]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CircleDashed className="text-secondary animate-[spin_4s_linear_infinite]" size={18} />;
            case 'completed': return <CheckCircle2 className="text-primary" size={18} />;
            case 'on_hold': return <Clock className="text-warning" size={18} />;
            default: return <Briefcase className="text-foreground/60" size={18} />;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'active': return "bg-background border-border text-foreground";
            case 'completed': return "bg-primary/10 border-primary/30 text-primary";
            case 'on_hold': return "bg-amber-100/50 border-amber-300 text-amber-700 dark:bg-[#D9A65C]/10 dark:text-[#D9A65C] dark:border-[#D9A65C]/30";
            default: return "bg-muted text-foreground border-border";
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Header section */}
            <div className="bg-background border-b-2 border-border px-6 py-6 sticky top-0 z-20">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="text-[12px] font-bold text-primary tracking-widest uppercase mb-2 flex items-center gap-3">
                            <div className="w-8 h-[2px] bg-primary"></div>
                            WORKSPACE
                        </div>

                        <div className="flex items-center gap-4 mt-2 mb-2">
                            {user?.logoUrl ? (
                                <div className="w-12 h-12 rounded-full border-2 border-border overflow-hidden bg-background">
                                    <img src={user.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-background">
                                    <Users size={20} className="text-foreground/40" />
                                </div>
                            )}
                            <h1 className="text-[40px] md:text-[48px] font-serif font-bold italic tracking-tight text-foreground leading-none">
                                {user?.name ? `${user.name.split(' ')[0]}'s Dashboard` : "Dashboard"}
                            </h1>
                        </div>
                        {user && (
                            <p className="text-foreground/60 font-medium text-[15px]">
                                {user.email} • {user.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center flex-wrap md:flex-nowrap gap-4">
                        <ThemeToggle />
                        <Link
                            href="/settings"
                            className="text-[12px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors px-3 py-2 flex items-center gap-2"
                        >
                            <Settings size={14} /> SETTINGS
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: "/signin" })}
                            className="text-[12px] font-bold uppercase tracking-widest text-foreground/60 hover:text-[#E65D47] transition-colors px-3 py-2"
                        >
                            LOG OUT
                        </button>
                        <Link
                            href="/projects/new"
                            className="flex items-center gap-2 px-6 py-3.5 bg-primary text-background text-[13px] font-bold tracking-widest uppercase hover:bg-primary-hover transition-colors neo-shadow-sm border-2 border-border hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Plus size={16} strokeWidth={3} /> NEW PROJECT
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-[1400px] mx-auto px-6 mt-12">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-card border-2 border-border neo-shadow p-6">
                                <div className="animate-pulse flex flex-col h-full">
                                    <div className="flex justify-between mb-8">
                                        <div className="h-6 w-24 bg-muted border border-border"></div>
                                        <div className="h-4 w-16 bg-muted/50"></div>
                                    </div>
                                    <div className="h-8 w-3/4 bg-muted mb-auto"></div>
                                    <div className="grid grid-cols-2 gap-6 pt-6 border-t-[1.5px] border-border/50">
                                        <div className="h-12 bg-muted"></div>
                                        <div className="h-12 bg-muted"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center bg-card border-2 border-border p-16 neo-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="w-16 h-16 border-2 border-primary bg-primary/5 flex items-center justify-center mx-auto mb-6 relative z-10">
                            <Briefcase className="text-primary" size={28} />
                        </div>
                        <h2 className="text-[32px] font-serif font-bold italic text-foreground mb-3 relative z-10">No projects yet</h2>
                        <p className="text-foreground/70 mb-10 max-w-md mx-auto relative z-10 text-[16px]">Get started by creating your first client project. You can track change orders, value, and status.</p>
                        <Link
                            href="/projects/new"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background font-bold uppercase tracking-widest text-[13px] border-2 border-border neo-shadow hover:-translate-y-1 active:translate-y-0 transition-all relative z-10"
                        >
                            <Plus size={18} strokeWidth={3} /> CREATE FIRST PROJECT
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <Link
                                href={`/projects/${project.id}`}
                                key={project.id}
                                className="group bg-card border-[1.5px] border-border p-7 neo-shadow hover:-translate-y-1 transition-transform flex flex-col relative"
                            >
                                {/* L-Shaped Accent */}
                                <div className="absolute top-[-1.5px] right-[-1.5px] w-6 h-6 border-t-[3px] border-r-[3px] border-secondary z-10 transition-colors group-hover:border-primary"></div>

                                <div className="flex justify-between items-start mb-8">
                                    <div className={`px-2.5 py-1 border-[1.5px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getStatusStyles(project.status)}`}>
                                        {getStatusIcon(project.status)}
                                        {project.status.replace("_", " ")}
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/40 mt-1">
                                        {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                                    </span>
                                </div>

                                <div className="mb-8 flex-1">
                                    <h3 className="text-[24px] font-serif font-bold italic text-foreground leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                        {project.clientName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-foreground/60 text-[13px] font-medium">
                                        <Users size={14} className="text-foreground/40" />
                                        <span className="truncate">{project.clientEmail}</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t-[1.5px] border-border/40 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5">VALUE</p>
                                        <p className="text-[20px] font-serif font-bold text-foreground leading-none flex items-center">
                                            ${Number(project.originalValue).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5">CHANGES</p>
                                        <p className="text-[20px] font-serif font-bold text-foreground leading-none flex items-center gap-2">
                                            0
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}