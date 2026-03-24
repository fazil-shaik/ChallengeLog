"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, FileText, IndianRupee, Mail, Loader2 } from "lucide-react";
import { format } from "date-fns";
import ThemeToggle from "@/components/ThemeToggle";

export default function ChangeOrderDetail({
    params
}: {
    params: Promise<{ id: string; orderId: string }>
}) {
    const { id, orderId } = use(params);
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApproving, setIsApproving] = useState(false);
    const [approvalSuccess, setApprovalSuccess] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/change-orders/${orderId}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [orderId]);

    const handleApprove = async () => {
        if (!token) return;
        setIsApproving(true);
        try {
            const res = await fetch(`/api/change-orders/${orderId}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });
            if (res.ok) {
                setApprovalSuccess(true);
                // Refresh data to show updated timeline and status
                const refreshed = await fetch(`/api/change-orders/${orderId}`);
                if (refreshed.ok) {
                   setData(await refreshed.json());
                }
            } else {
                alert(await res.text());
            }
        } catch (err) {
            alert("Approval failed.");
        } finally {
            setIsApproving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pt-24 px-6 pb-20 flex justify-center items-center">
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    if (!data || !data.order) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <h1 className="text-2xl font-bold font-serif italic mb-4">Order Not Found</h1>
                <Link href={`/projects/${id}`} className="px-6 py-3 bg-primary text-background font-bold tracking-widest text-xs uppercase neo-shadow-sm border-2 border-border">Back to Project</Link>
            </div>
        );
    }

    const { order, request, project, timeline } = data;
    const isPending = order.status === 'pending';
    const canApprove = token && isPending && order.approvalToken === token;

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Header section */}
            <div className="bg-background border-b-2 border-border px-6 py-8 sticky top-0 z-20">
                <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <Link
                            href={`/projects/${id}`}
                            className="w-12 h-12 border-[1.5px] border-border flex items-center justify-center text-foreground hover:bg-muted neo-shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 bg-card mt-1 shrink-0"
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-4 flex-wrap mb-2">
                                <h1 className="text-[32px] md:text-[40px] font-serif font-bold italic tracking-tight text-foreground leading-none">
                                    Change Order #{order.id.slice(-6).toUpperCase()}
                                </h1>
                                <span className={`px-3 py-1.5 border-[1.5px] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                                    order.status === 'approved' ? 'bg-primary/10 text-primary border-primary/30' :
                                    order.status === 'pending' ? 'bg-[#9b87f5]/10 text-[#9b87f5] border-[#9b87f5]/30' :
                                    'bg-muted text-foreground/60 border-border'
                                }`}>
                                    {order.status === 'approved' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                    {order.status}
                                </span>
                            </div>
                            <div className="text-foreground/60 text-[13px] font-medium mt-3">
                                Project: <span className="font-bold text-foreground">{project.clientName}</span>
                            </div>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-[1000px] mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Left Column: Details & Approval */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Order Details */}
                    <div className="bg-card border-2 border-border neo-shadow p-8 relative">
                        <div className="absolute top-[-2px] right-[-2px] w-8 h-8 border-t-[4px] border-r-[4px] border-primary z-10 pointer-events-none"></div>
                        
                        <h2 className="text-[24px] font-serif font-bold italic text-foreground flex items-center gap-3 mb-8">
                            <div className="w-4 h-4 bg-primary border-[1.5px] border-border"></div>
                            Scope Details
                        </h2>

                        <div className="bg-muted/30 border-[1.5px] border-border p-6 relative mb-8">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 mb-3">Requested Change</h3>
                            <p className="text-[15px] font-medium leading-relaxed">{request.description}</p>
                        </div>

                        {order.designerNotes && (
                            <div className="bg-background border-[1.5px] border-border p-6 mb-8 neo-shadow-sm">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                                    <FileText size={14} /> Designer Notes
                                </h3>
                                <p className="text-[14px] leading-relaxed text-foreground/80 whitespace-pre-wrap">{order.designerNotes}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div className="border-[1.5px] border-border p-6 bg-card text-center">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 mb-2">Estimated Hours</p>
                                <p className="text-[32px] font-mono font-bold">{order.hours} <span className="text-[16px] text-foreground/40">HRS</span></p>
                            </div>
                            <div className="border-[1.5px] border-border p-6 bg-primary/5 text-center text-primary">
                                <p className="text-[11px] font-bold uppercase tracking-widest mb-2 opacity-70">Total Cost</p>
                                <p className="text-[32px] font-mono font-bold"><span className="text-[20px] opacity-50 mr-1">$</span>{order.cost}</p>
                            </div>
                        </div>
                    </div>

                    {/* Approval Section */}
                    {canApprove && (
                        <div className="bg-primary/10 border-2 border-primary neo-shadow p-8 text-center mt-10">
                            <h3 className="text-[24px] font-serif font-bold text-primary mb-4">Approval Required</h3>
                            <p className="text-foreground/80 text-[14px] leading-relaxed max-w-md mx-auto mb-8">
                                By approving this order, you agree to the updated scope and the estimated cost. Work on this change will begin once approved.
                            </p>
                            <button
                                onClick={handleApprove}
                                disabled={isApproving}
                                className="px-8 py-4 bg-primary text-background border-2 border-border font-bold text-[14px] uppercase tracking-widest hover:bg-primary/90 transition-colors neo-shadow hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 w-full md:w-auto mx-auto disabled:opacity-50"
                            >
                                {isApproving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                {isApproving ? "APPROVING..." : "APPROVE CHANGE ORDER"}
                            </button>
                        </div>
                    )}

                    {approvalSuccess && (
                        <div className="bg-success/10 border-2 border-success p-6 flex items-center justify-center gap-4 text-success neo-shadow mt-10">
                            <CheckCircle2 size={24} />
                            <span className="font-bold uppercase tracking-widest">Change Order Approved Successfully!</span>
                        </div>
                    )}
                </div>

                {/* Right Column: Timeline */}
                <div className="space-y-10">
                    <div className="bg-card border-2 border-border neo-shadow p-8">
                        <h2 className="text-[20px] font-serif font-bold italic text-foreground flex items-center gap-3 mb-8">
                            <div className="w-3 h-3 bg-secondary border-[1.5px] border-border"></div>
                            Timeline Activity
                        </h2>

                        <div className="relative border-l-[1.5px] border-border ml-3 pb-4 space-y-8">
                            
                            {/* Order Created */}
                            <div className="relative pl-6">
                                <div className="absolute left-[-5px] top-1 w-[9px] h-[9px] rounded-full bg-background border-[1.5px] border-border"></div>
                                <p className="text-[12px] font-bold uppercase tracking-widest text-foreground">Order Draft Created</p>
                                <p className="text-[11px] text-foreground/50 mt-1">{format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                            </div>

                            {/* Sent for Approval */}
                            <div className="relative pl-6">
                                <div className="absolute left-[-6px] top-0 w-3 h-3 bg-secondary border-[1.5px] border-border neo-shadow-sm flex items-center justify-center"></div>
                                <p className="text-[12px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                                    Sent for Approval <Mail size={12} />
                                </p>
                            </div>
                            
                            {/* Approved */}
                            {order.status === 'approved' && order.approvedAt && (
                                <div className="relative pl-6">
                                    <div className="absolute left-[-6px] top-0 w-3 h-3 bg-primary border-[1.5px] border-border neo-shadow-sm flex items-center justify-center"></div>
                                    <p className="text-[12px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                        Approved by Client <CheckCircle2 size={12} />
                                    </p>
                                    <p className="text-[11px] text-foreground/50 mt-1">{format(new Date(order.approvedAt), "MMM d, yyyy 'at' h:mm a")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

