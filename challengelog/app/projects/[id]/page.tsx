"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import jsPDF from "jspdf";
import {
    ArrowLeft,
    Briefcase,
    Clock,
    CheckCircle2,
    CircleDashed,
    Users,
    FileText,
    Download,
    Receipt,
    History,
    IndianRupee,
    Mail,
    Calendar,
    ChevronDown,
    Plus,
    X,
    Loader2,
    MessageSquare,
    Phone,
    BrainCircuit,
    Wand2
} from "lucide-react";
import { format } from "date-fns";
import ThemeToggle from "@/components/ThemeToggle";

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const [project, setProject] = useState<any>(null);
    const [changeRequests, setChangeRequests] = useState<any[]>([]);
    const [changeOrders, setChangeOrders] = useState<any[]>([]);
    const [auditEvents, setAuditEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // AI Request Modal State
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [reqDescription, setReqDescription] = useState("");
    const [reqSource, setReqSource] = useState("email");

    // Convert to Order Modal State
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [selectedReqForOrder, setSelectedReqForOrder] = useState<any>(null);
    const [orderHours, setOrderHours] = useState("");
    const [orderCost, setOrderCost] = useState("");
    const [orderNotes, setOrderNotes] = useState("");
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

    // Filters & Sorting for Table
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        async function loadProject() {
            try {
                const res = await fetch(`/api/projects/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProject(data);
                    setChangeRequests(data.changeRequests || []);
                    setChangeOrders(data.changeOrders || []);
                    setAuditEvents(data.auditEvents || []);
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
            }
        } catch (err) {
            setProject({ ...project, status: previousStatus });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleLogRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reqDescription.trim()) return;

        // Optimistic UI
        const tempId = `temp-${Date.now()}`;
        const newReq = {
            id: tempId,
            description: reqDescription,
            source: reqSource,
            status: "draft",
            createdAt: new Date().toISOString(),
            isAnalyzing: true
        };

        setChangeRequests((prev) => [newReq, ...prev]);
        setIsRequestModalOpen(false);
        setReqDescription("");
        setReqSource("email");

        try {
            const res = await fetch('/api/gemini/analyze', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: id,
                    description: newReq.description,
                    source: newReq.source,
                    briefText: project.briefText
                })
            });

            if (res.ok) {
                const data = await res.json();
                setChangeRequests((prev) =>
                    prev.map((req) => req.id === tempId ? { ...data.changeRequest, isAnalyzing: false } : req)
                );
                toast.success("Request logged and analyzed");
            } else {
                setChangeRequests((prev) => prev.filter(req => req.id !== tempId));
                toast.error("Failed to analyze. Try again.");
            }
        } catch (err) {
            setChangeRequests((prev) => prev.filter(req => req.id !== tempId));
            toast.error("Error analyzing request.");
        }
    };

    const openConvertToOrderModal = (req: any) => {
        setSelectedReqForOrder(req);
        setOrderHours(req.aiHours?.toString() || "");
        setOrderCost(req.aiCost?.toString() || "");
        setOrderNotes(req.aiReasoning || "");
        setIsConvertModalOpen(true);
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReqForOrder) return;
        setIsSubmittingOrder(true);

        try {
            const res = await fetch('/api/change-orders', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    changeRequestId: selectedReqForOrder.id,
                    hours: orderHours,
                    cost: orderCost,
                    designerNotes: orderNotes,
                    projectId: id,
                })
            });

            if (res.ok) {
                const data = await res.json();
                setChangeOrders(prev => [data.changeOrder, ...prev]);
                setChangeRequests(prev => prev.map(r => r.id === selectedReqForOrder.id ? { ...r, status: 'pending' } : r));
                setIsConvertModalOpen(false);
                toast.success("Change order sent for approval!");
            } else {
                toast.error("Failed to create change order.");
            }
        } catch (err) {
            toast.error("Error creating order.");
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    const sortedRequests = [...changeRequests].sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortDirection === "desc" ? timeB - timeA : timeA - timeB;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CircleDashed className="text-secondary animate-[spin_4s_linear_infinite]" size={16} />;
            case 'completed': return <CheckCircle2 className="text-primary" size={16} />;
            case 'on_hold': return <Clock className="text-warning" size={16} />;
            default: return <Briefcase className="text-foreground/60" size={16} />;
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

    if (!project) return null;

    const approvedOrders = changeOrders.filter(o => o.status === 'approved');
    const totalApprovedRecovered = approvedOrders.reduce((acc, curr) => acc + Number(curr.cost), 0);
    const invoiceSummaryText = `Invoice Summary for ${project.clientName}\n\nTotal Approved Recovered Value: $${totalApprovedRecovered.toFixed(2)}\nNumber of Approved Orders: ${approvedOrders.length}\n`;

    const handleCopySummary = () => {
        navigator.clipboard.writeText(invoiceSummaryText);
        toast.success("Summary copied to clipboard");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("PROJECT SUMMARY INVOICE", 20, 30);
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(`Client: ${project.clientName}`, 20, 45);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 52);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(`Total Recovered Value: $${totalApprovedRecovered.toFixed(2)}`, 20, 70);
        doc.text(`Approved Change Orders: ${approvedOrders.length}`, 20, 78);

        doc.setLineWidth(0.5);
        doc.line(20, 85, 190, 85);

        let startY = 95;
        doc.setFontSize(12);

        if (approvedOrders.length === 0) {
            doc.setFont("helvetica", "italic");
            doc.text("No approved change orders found for this project.", 20, startY);
        } else {
            approvedOrders.forEach((order, idx) => {
                if (startY > 270) {
                    doc.addPage();
                    startY = 20;
                }
                doc.setFont("helvetica", "bold");
                doc.text(`${idx + 1}. Order #${order.id.slice(-6).toUpperCase()}`, 20, startY);
                doc.setFont("helvetica", "normal");
                doc.text(`Cost: $${order.cost} | Hours: ${order.hours} HRS | Approved: ${new Date(order.approvedAt || order.createdAt).toLocaleDateString()}`, 20, startY + 6);
                
                const notesLines = doc.splitTextToSize(`Notes: ${order.designerNotes || 'N/A'}`, 170);
                doc.text(notesLines, 20, startY + 14);
                
                startY += 14 + (notesLines.length * 5) + 8;
            });
        }

        doc.save(`${project.clientName.replace(/\s+/g, '_')}_Summary.pdf`);
        toast.success("PDF Exported Successfully");
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Header section... */}
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

                {/* Left Column: Change Requests & Orders */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Change Requests Section (AI Logging) */}
                    <div className="bg-card border-2 border-border neo-shadow focus-within:ring-2 p-8 relative">
                        <div className="absolute top-[-2px] right-[-2px] w-8 h-8 border-t-[4px] border-r-[4px] border-[#9b87f5] z-10 pointer-events-none"></div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                            <div>
                                <h2 className="text-[24px] font-serif font-bold italic text-foreground flex items-center gap-3">
                                    <div className="w-4 h-4 bg-[#9b87f5] border-[1.5px] border-border"></div>
                                    Change Requests
                                </h2>
                                <p className="text-[14px] text-foreground/60 mt-2">Log client requests & instant AI scope analysis</p>
                            </div>
                            <button
                                onClick={() => setIsRequestModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#9b87f5] text-white border-[1.5px] border-border font-bold text-[12px] uppercase tracking-widest hover:bg-[#8b75f0] transition-colors neo-shadow hover:-translate-y-0.5 active:translate-y-0 shrink-0"
                            >
                                <Wand2 size={16} strokeWidth={2.5} /> LOG REQUEST
                            </button>
                        </div>

                        {/* Requests Table */}
                        {changeRequests.length > 0 ? (
                            <div className="border-[1.5px] border-border bg-background overflow-hidden">
                                {/* Table Controls */}
                                <div className="p-4 border-b-[1.5px] border-border bg-muted/20 flex justify-end">
                                    <button
                                        onClick={() => setSortDirection(prev => prev === "desc" ? "asc" : "desc")}
                                        className="text-[11px] font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors flex items-center gap-1"
                                    >
                                        Date {sortDirection === "desc" ? "↓" : "↑"}
                                    </button>
                                </div>
                                <div className="divide-y-[1.5px] divide-border">
                                    {sortedRequests.map((req) => (
                                        <div key={req.id} className={`p-5 transition-all ${req.isAnalyzing ? 'bg-muted/30 animate-pulse' : 'hover:bg-muted/10'}`}>
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1">
                                                    <p className="text-[15px] font-medium leading-relaxed group-hover:text-primary transition-colors line-clamp-2">{req.description}</p>
                                                </div>
                                                <div className="shrink-0 flex items-center gap-3">
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/50 bg-muted px-2 py-1 rounded">
                                                        {req.source}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-foreground/40 min-w-[80px] text-right">
                                                        {format(new Date(req.createdAt), "MMM d")}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* AI Analysis Card */}
                                            {req.isAnalyzing ? (
                                                <div className="mt-4 flex items-center gap-3 text-secondary text-[12px] font-bold uppercase tracking-widest bg-secondary/10 border border-secondary/20 p-3">
                                                    <Loader2 className="animate-spin" size={16} />
                                                    Gemini AI Analyzing Scope...
                                                </div>
                                            ) : (
                                                <div className="mt-4 bg-background border-[1px] border-border p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center neo-shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 rounded-full ${req.aiInScope ? 'bg-primary' : 'bg-destructive'}`}></div>
                                                            <span className="text-[12px] font-bold uppercase tracking-widest">
                                                                {req.aiInScope ? 'IN SCOPE' : 'OUT OF SCOPE'}
                                                            </span>
                                                        </div>
                                                        <div className="text-[12px] text-foreground/60 max-w-[200px] truncate" title={req.aiReasoning}>
                                                            {req.aiReasoning || "Manual entry"}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className="bg-card border border-border px-3 py-1 text-[12px] font-bold font-mono">
                                                            {req.aiHours} <span className="text-foreground/50">HRS</span>
                                                        </div>
                                                        <div className="bg-card border border-border px-3 py-1 text-[12px] font-bold font-mono">
                                                            <span className="text-foreground/50">$</span>{req.aiCost}
                                                        </div>
                                                        {req.status === 'draft' && (
                                                            <button 
                                                                onClick={() => openConvertToOrderModal(req)}
                                                                className="px-3 py-1 bg-primary text-background border border-primary text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors neo-shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                                                            >
                                                                Convert
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-border/50 bg-muted/20 p-12 text-center">
                                <MessageSquare size={24} className="text-foreground/40 mx-auto mb-4" />
                                <h3 className="text-[16px] font-bold text-foreground mb-2 tracking-wide">NO REQUESTS YET</h3>
                                <p className="text-foreground/60 text-[13px]">Log requests received via email, WhatsApp, or calls.</p>
                            </div>
                        )}
                    </div>

                    {/* Change Orders Section */}
                    <div className="bg-card border-2 border-border neo-shadow p-8 relative">
                        <div className="absolute top-[-2px] right-[-2px] w-8 h-8 border-t-[4px] border-r-[4px] border-secondary z-10 pointer-events-none"></div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                            <div>
                                <h2 className="text-[24px] font-serif font-bold italic text-foreground flex items-center gap-3">
                                    <div className="w-4 h-4 bg-primary border-[1.5px] border-border"></div>
                                    Change Orders
                                </h2>
                                <p className="text-[14px] text-foreground/60 mt-2">Manage out-of-scope work approvals</p>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-card border-[1.5px] border-border text-foreground font-bold text-[12px] uppercase tracking-widest hover:bg-muted transition-colors neo-shadow-sm hover:-translate-y-0.5 active:translate-y-0 shrink-0">
                                <Plus size={16} strokeWidth={3} /> NEW ORDER
                            </button>
                        </div>

                        {changeOrders.length > 0 ? (
                            <div className="border-[1.5px] border-border bg-background divide-y-[1.5px] divide-border">
                                {changeOrders.map((order) => (
                                    <div key={order.id} className="p-5 flex items-center justify-between hover:bg-muted/10 transition-colors group">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                                                    order.status === 'approved' ? 'bg-primary/10 text-primary border-primary/30' :
                                                    order.status === 'pending' ? 'bg-[#9b87f5]/10 text-[#9b87f5] border-[#9b87f5]/30' :
                                                    'bg-muted text-foreground/60 border-border'
                                                }`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-[12px] font-medium text-foreground/60">
                                                    Order #{order.id.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-[15px] font-bold mt-2 text-foreground group-hover:text-primary transition-colors">${order.cost} for {order.hours} hrs</p>
                                        </div>
                                        <Link
                                            href={`/projects/${id}/orders/${order.id}`}
                                            className="px-4 py-2 border-[1.5px] border-border text-[11px] font-bold uppercase tracking-widest hover:bg-muted transition-colors neo-shadow-sm shrink-0"
                                        >
                                            View
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-border/50 bg-muted/20 p-16 text-center hover:bg-muted/40 transition-colors">
                                <div className="w-16 h-16 border-2 border-border bg-card text-foreground/40 flex items-center justify-center mx-auto mb-6 neo-shadow-sm">
                                    <FileText size={24} strokeWidth={2} />
                                </div>
                                <h3 className="text-[18px] font-bold text-foreground mb-3 tracking-wide">NO CHANGE ORDERS</h3>
                                <p className="text-foreground/60 max-w-sm mx-auto text-[14px] leading-relaxed">When the client requests out-of-scope work, convert the request to a change order here for their approval.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Project Brief & Audit & Invoice */}
                <div className="space-y-10">
                    
                    {/* Invoice Summary Card */}
                    <div className="bg-primary/5 border-2 border-primary neo-shadow p-8 relative">
                        <h2 className="text-[20px] font-serif font-bold italic text-foreground flex items-center gap-3 mb-6">
                            <Receipt size={18} className="text-primary" />
                            Invoice Summary
                        </h2>
                        
                        <div className="bg-background border-[1.5px] border-border p-6 text-center space-y-4 mb-6 neo-shadow-sm">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Recovered Value</p>
                                <p className="text-[32px] font-mono font-bold text-success flex items-center justify-center">
                                    <span className="text-[16px] mr-1 opacity-70">$</span>{totalApprovedRecovered.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-border">
                                <p className="text-[13px] font-bold text-foreground">{approvedOrders.length} Approved Orders</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCopySummary}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-card border-[1.5px] border-border font-bold text-[11px] uppercase tracking-widest hover:bg-muted transition-colors neo-shadow-sm"
                            >
                                <FileText size={14} /> COPY SUMMARY
                            </button>
                            <button onClick={handleExportPDF} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-background border-[1.5px] border-border font-bold text-[11px] uppercase tracking-widest hover:bg-primary/90 transition-colors neo-shadow-sm">
                                <Download size={14} /> EXPORT PDF
                            </button>
                        </div>
                    </div>

                    {/* Audit Trail Section */}
                    <div className="bg-card border-2 border-border neo-shadow p-8 relative">
                        <h2 className="text-[20px] font-serif font-bold italic text-foreground flex items-center gap-3 mb-6">
                            <History size={18} className="text-foreground" />
                            Audit Trail
                        </h2>

                        {auditEvents.length > 0 ? (
                            <div className="relative border-l-[1.5px] border-border ml-3 pb-4 space-y-8 mt-6">
                                {auditEvents.map((evt, idx) => (
                                    <div key={evt.id} className="relative pl-6">
                                        <div className="absolute left-[-5px] top-1 w-[9px] h-[9px] rounded-full bg-background border-[1.5px] border-primary"></div>
                                        <p className="text-[12px] font-bold uppercase tracking-widest text-foreground">
                                            {evt.eventType.replace(/_/g, " ")}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] text-foreground/50">
                                                {format(new Date(evt.createdAt), "MMM d, h:mm a")}
                                            </span>
                                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-foreground/60">{evt.actor}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-muted/20 border-2 border-dashed border-border/50">
                                <p className="text-foreground/50 font-bold text-[12px] uppercase tracking-widest">NO EVENTS RECORDED</p>
                            </div>
                        )}
                    </div>

                    {/* Project Brief */}
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

            {/* Log Request Modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-lg border-2 border-border neo-shadow flex flex-col max-h-[90vh]">
                        <div className="border-b-2 border-border p-6 flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#9b87f5] text-white flex items-center justify-center border-2 border-border neo-shadow-sm">
                                    <BrainCircuit size={16} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-[18px] font-serif font-bold italic text-foreground leading-none mb-1">Log Client Request</h3>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">Gemini Scope Analysis</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsRequestModalOpen(false)}
                                className="text-foreground/50 hover:text-foreground hover:bg-muted p-2 border-[1.5px] border-transparent hover:border-border transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleLogRequest} className="p-6 overflow-y-auto space-y-6">

                            <div>
                                <label className="block text-[12px] font-bold uppercase tracking-widest text-foreground mb-2">
                                    What did the client ask for?
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="e.g., Can we add a dark mode toggle on the dashboard?"
                                    value={reqDescription}
                                    onChange={(e) => setReqDescription(e.target.value)}
                                    className="w-full bg-background border-[1.5px] border-border p-4 text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none neo-shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold uppercase tracking-widest text-foreground mb-3">
                                    Request Source
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['email', 'whatsapp', 'call', 'in_person'].map((src) => (
                                        <label
                                            key={src}
                                            className={`
                                                cursor-pointer border-[1.5px] p-3 text-center flex flex-col items-center gap-2 transition-all
                                                ${reqSource === src
                                                    ? 'border-primary bg-primary/5 text-primary neo-shadow-sm'
                                                    : 'border-border bg-background text-foreground/60 hover:border-foreground/30'
                                                }
                                            `}
                                        >
                                            <input
                                                type="radio"
                                                name="source"
                                                value={src}
                                                checked={reqSource === src}
                                                onChange={(e) => setReqSource(e.target.value)}
                                                className="hidden"
                                            />
                                            {src === 'email' && <Mail size={16} />}
                                            {src === 'whatsapp' && <MessageSquare size={16} />}
                                            {src === 'call' && <Phone size={16} />}
                                            {src === 'in_person' && <Users size={16} />}
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{src.replace("_", " ")}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsRequestModalOpen(false)}
                                    className="px-5 py-3 border-[1.5px] border-border font-bold text-[12px] uppercase tracking-widest hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#9b87f5] text-white border-[1.5px] border-border font-bold text-[12px] uppercase tracking-widest hover:bg-[#8b75f0] neo-shadow hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
                                >
                                    <Wand2 size={16} /> ANALYZE REQUEST
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Convert to Order Modal */}
            {isConvertModalOpen && selectedReqForOrder && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-lg border-2 border-border neo-shadow flex flex-col max-h-[90vh]">
                        <div className="border-b-2 border-border p-6 flex items-center justify-between bg-primary/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary text-background flex items-center justify-center border-2 border-border neo-shadow-sm">
                                    <FileText size={16} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-[18px] font-serif font-bold italic text-foreground leading-none mb-1">Convert to Change Order</h3>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">Send Approval Email</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsConvertModalOpen(false)}
                                className="text-foreground/50 hover:text-foreground hover:bg-muted p-2 border-[1.5px] border-transparent hover:border-border transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrder} className="p-6 overflow-y-auto space-y-6">
                            <div className="bg-muted/30 border border-border p-4 mb-2">
                                <p className="text-[13px] text-foreground/80 line-clamp-3 italic">"{selectedReqForOrder.description}"</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-bold uppercase tracking-widest text-foreground mb-2">
                                        Estimated Hours
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.5"
                                            required
                                            value={orderHours}
                                            onChange={(e) => setOrderHours(e.target.value)}
                                            className="w-full bg-background border-[1.5px] border-border p-3 pl-4 text-[14px] font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all neo-shadow-sm"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-foreground/40">HRS</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold uppercase tracking-widest text-foreground mb-2">
                                        Estimated Cost
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-mono text-foreground/40">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={orderCost}
                                            onChange={(e) => setOrderCost(e.target.value)}
                                            className="w-full bg-background border-[1.5px] border-border p-3 pl-8 text-[14px] font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all neo-shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold uppercase tracking-widest text-foreground mb-2">
                                    Designer Notes for Client
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Explain the scope of this change..."
                                    value={orderNotes}
                                    onChange={(e) => setOrderNotes(e.target.value)}
                                    className="w-full bg-background border-[1.5px] border-border p-4 text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none neo-shadow-sm"
                                />
                            </div>

                            <div className="pt-4 border-t border-border flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsConvertModalOpen(false)}
                                    className="px-5 py-3 border-[1.5px] border-border font-bold text-[12px] uppercase tracking-widest hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingOrder}
                                    className="px-6 py-3 bg-primary text-background border-[1.5px] border-border font-bold text-[12px] uppercase tracking-widest hover:bg-primary/90 neo-shadow hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmittingOrder ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                    {isSubmittingOrder ? 'SENDING...' : 'SEND APPROVAL & CREATE'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
