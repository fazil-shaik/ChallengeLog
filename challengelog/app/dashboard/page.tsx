"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, Clock, CheckCircle2, CircleDashed, Users, FileText, IndianRupee } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProjects() {
            try {
                const res = await fetch("/api/projects");
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data);
                }
            } catch (err) {
                console.error("Failed to load projects", err);
            } finally {
                setIsLoading(false);
            }
        }
        if (session) {
            loadProjects();
        }
    }, [session]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CircleDashed className="text-blue-500 animate-[spin_4s_linear_infinite]" size={18} />;
            case 'completed': return <CheckCircle2 className="text-emerald-500" size={18} />;
            case 'on_hold': return <Clock className="text-amber-500" size={18} />;
            default: return <Briefcase className="text-slate-500" size={18} />;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'active': return "bg-blue-50 text-blue-700 border-blue-200";
            case 'completed': return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case 'on_hold': return "bg-amber-50 text-amber-700 border-amber-200";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            {/* Header section */}
            <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <Briefcase className="text-white" size={18} />
                            </div>
                            Dashboard
                        </h1>
                        {session?.user && (
                            <p className="text-slate-500 mt-1 font-medium text-sm ml-11">
                                Welcome back, {session.user.name || session.user.email}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => signOut({ callbackUrl: "/signin" })}
                            className="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                        >
                            Log out
                        </button>
                        <Link
                            href="/projects/new"
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <Plus size={18} /> New Project
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-8 mt-10">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse p-6">
                                <div className="h-6 bg-slate-200 rounded-md w-1/3 mb-4"></div>
                                <div className="h-4 bg-slate-100 rounded-md w-1/2 mb-8"></div>
                                <div className="space-y-3">
                                    <div className="h-10 bg-slate-50 rounded-xl w-full"></div>
                                    <div className="h-10 bg-slate-50 rounded-xl w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center bg-white border border-slate-200 border-dashed rounded-3xl py-24 px-6 shadow-sm">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">No projects yet</h2>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Get started by creating your first client project. You can track change orders, value, and status.</p>
                        <Link
                            href="/projects/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all hover:shadow-lg"
                        >
                            <Plus size={20} /> Create First Project
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Link
                                href={`/projects/${project.id}`}
                                key={project.id}
                                className="group bg-white rounded-[2rem] border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${getStatusStyles(project.status)}`}>
                                        {getStatusIcon(project.status)}
                                        {project.status.replace("_", " ")}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400">
                                        {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                                    </span>
                                </div>

                                <div className="mb-6 flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                        {project.clientName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                        <Users size={14} /> {project.clientEmail}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Value</p>
                                        <p className="text-lg font-black text-slate-800 flex items-center">
                                            <IndianRupee size={16} className="text-slate-400 mr-0.5" />
                                            {Number(project.originalValue).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Changes</p>
                                        <p className="text-lg font-black text-slate-800 flex items-center gap-2">
                                            <FileText size={16} className="text-indigo-400" />
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