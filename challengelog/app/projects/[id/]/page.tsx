"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
    ArrowLeft, 
    Briefcase, 
    Clock, 
    CheckCircle2, 
    CircleDashed, 
    Users, 
    FileText, 
    IndianRupee,
    Mail,
    Calendar,
    ChevronDown,
    Plus
} from "lucide-react";
import { format } from "date-fns";
import ThemeToggle from "@/components/ThemeToggle";

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const [project, setProject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        async function loadProject() {
            try {
                const res = await fetch(`/api/projects/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProject(data);
                }
            } catch (err) {
                console.error("Failed to load project", err);
            } finally {
                setIsLoading(false);
            }
        }
        if (session) {
            loadProject();
        }
    }, [session, id]);

    const handleStatusChange = async (newStatus: string) => {
        if (!project || project.status === newStatus) return;
        
        // Optimistic UI update
        const previousStatus = project.status;
        setProject({ ...project, status: newStatus });
        setIsDropdownOpen(false);
        setIsUpdatingStatus(true);

        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                setProject({ ...project, status: previousStatus });
                console.error("Failed to update status");
            }
        } catch (err) {
            setProject({ ...project, status: previousStatus });
            console.error("Update failed", err);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'active': return <CircleDashed className="text-secondary animate-[spin_4s_linear_infinite]" size={16} />;
            case 'completed': return <CheckCircle2 className="text-primary" size={16} />;
            case 'on_hold': return <Clock className="text-warning" size={16} />;
            default: return <Briefcase className="text-foreground/60" size={16} />;
        }
    };

    const getStatusStyles = (status: string) => {
        switch(status) {
            case 'active': return "bg-background border-border text-foreground";
            case 'completed': return "bg-primary/10 border-primary/30 text-primary";
            case 'on_hold': return "bg-amber-100/50 border-amber-300 text-amber-700 dark:bg-[#D9A65C]/10 dark:text-[#D9A65C] dark:border-[#D9A65C]/30";
            default: return "bg-muted text-foreground border-border";
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pt-24 px-6 pb-20">
                <div className="max-w-[1200px] mx-auto animate-pulse">
                    <div className="h-10 w-48 bg-muted border border-border mb-12"></div>
                    <div className="h-48 bg-card border-2 border-border mb-10 neo-shadow"></div>
                    <div className="h-96 bg-card border-2 border-border neo-shadow"></div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="text-center bg-card border-2 border-border p-12 neo-shadow max-w-md w-full">
                    <h2 className="text-[32px] font-serif font-bold italic text-foreground mb-4">Project Not Found</h2>
                    <Link href="/dashboard" className="inline-block px-6 py-3 bg-primary text-background font-bold text-[12px] uppercase tracking-widest border-2 border-border neo-shadow hover:-translate-y-1 transition-transform">
                        RETURN TO DASHBOARD
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Header section */}
            <div className="bg-background border-b-2 border-border px-6 py-8 sticky top-0 z-20">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <Link 
                            href="/dashboard"
                            className="w-12 h-12 border-[1.5px] border-border flex items-center justify-center text-foreground hover:bg-muted neo-shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 bg-card mt-1 shrink-0"
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-4 flex-wrap mb-2">
                                <h1 className="text-[32px] md:text-[40px] font-serif font-bold italic tracking-tight text-foreground leading-none">
                                    {project.clientName}
                                </h1>
                                
                                {/* Status Toggle Dropdown */}
                                <div className="relative z-30">
                                    <button 
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        disabled={isUpdatingStatus}
                                        className={`px-3 py-1.5 border-[1.5px] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusStyles(project.status)}`}
                                    >
                                        {getStatusIcon(project.status)}
                                        {project.status.replace("_", " ")}
                                        <ChevronDown size={14} strokeWidth={3} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 mt-3 w-56 bg-card border-2 border-border neo-shadow overflow-hidden z-40">
                                            {['active', 'on_hold', 'completed'].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleStatusChange(s)}
                                                    className={`w-full text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-muted transition-colors ${project.status === s ? 'bg-primary/5 text-primary' : 'text-foreground'}`}
                                                >
                                                    {getStatusIcon(s)}
                                                    {s.replace("_", " ")}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-foreground/60 text-[13px] font-medium mt-3">
                                <span className="flex items-center gap-2"><Mail size={14} className="text-foreground/40" /> {project.clientEmail}</span>
                                <span className="flex items-center gap-2"><Calendar size={14} className="text-foreground/40" /> Created {format(new Date(project.createdAt), "MMM d, yyyy")}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="shrink-0 w-full md:w-auto flex items-center justify-end gap-6">
                        <ThemeToggle />
                        <div className="bg-primary text-background border-2 border-border px-8 py-5 neo-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-background/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 relative z-10 text-background/80">PROJECT VALUE</p>
                            <p className="text-[32px] font-serif font-bold text-background leading-none flex items-center relative z-10">
                                <IndianRupee size={24} className="text-background/60 mr-0.5" />
                                {Number(project.originalValue).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-[1200px] mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Left Column: Change Orders */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-card border-2 border-border neo-shadow p-8 relative">
                        {/* Corner Accent */}
                        <div className="absolute top-[-2px] right-[-2px] w-8 h-8 border-t-[4px] border-r-[4px] border-secondary z-10 pointer-events-none"></div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                            <div>
                                <h2 className="text-[24px] font-serif font-bold italic text-foreground flex items-center gap-3">
                                    <div className="w-4 h-4 bg-primary border-[1.5px] border-border"></div> 
                                    Change Orders
                                </h2>
                                <p className="text-[14px] text-foreground/60 mt-2">Manage scope requests and approvals</p>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-card border-[1.5px] border-border text-foreground font-bold text-[12px] uppercase tracking-widest hover:bg-muted transition-colors neo-shadow-sm hover:-translate-y-0.5 active:translate-y-0 shrink-0">
                                <Plus size={16} strokeWidth={3} /> NEW ORDER
                            </button>
                        </div>

                        {/* Empty State for Change Orders */}
                        <div className="border-2 border-dashed border-border/50 bg-muted/20 p-16 text-center hover:bg-muted/40 transition-colors">
                            <div className="w-16 h-16 border-2 border-border bg-card text-foreground/40 flex items-center justify-center mx-auto mb-6 neo-shadow-sm">
                                <FileText size={24} strokeWidth={2} />
                            </div>
                            <h3 className="text-[18px] font-bold text-foreground mb-3 tracking-wide">NO CHANGE ORDERS</h3>
                            <p className="text-foreground/60 max-w-sm mx-auto text-[14px] leading-relaxed">When the client requests out-of-scope work, create a change order here for their approval.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Project Brief */}
                <div className="space-y-10">
                    <div className="bg-card border-2 border-border neo-shadow p-8 relative hover:-translate-y-1 transition-transform">
                        <h2 className="text-[20px] font-serif font-bold italic text-foreground flex items-center gap-3 mb-8">
                            <div className="w-3 h-3 bg-warning border-[1.5px] border-border"></div> 
                            Project Brief
                        </h2>

                        {project.briefFileUrl ? (
                            <a 
                                href={project.briefFileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center justify-center p-10 bg-primary/5 border-[1.5px] border-primary/20 hover:border-primary/50 transition-colors text-center"
                            >
                                <div className="w-14 h-14 border-[1.5px] border-primary bg-background flex items-center justify-center text-primary neo-shadow-sm mb-5 group-hover:-translate-y-1 transition-transform">
                                    <FileText size={24} strokeWidth={2} />
                                </div>
                                <h4 className="font-bold text-[13px] tracking-widest uppercase text-foreground mb-2">VIEW BRIEF PDF</h4>
                                <p className="text-[10px] font-bold tracking-widest text-primary uppercase">OPENS IN NEW TAB</p>
                            </a>
                        ) : project.briefText ? (
                            <div className="bg-muted/30 border-[1.5px] border-border p-6 relative">
                                <p className="text-[14px] text-foreground/80 whitespace-pre-wrap leading-relaxed min-h-[120px]">
                                    {project.briefText}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-muted/20 border-2 border-dashed border-border/50">
                                <p className="text-foreground/50 font-bold text-[12px] uppercase tracking-widest">NO BRIEF PROVIDED</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
