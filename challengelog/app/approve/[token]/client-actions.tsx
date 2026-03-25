"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities, @typescript-eslint/no-unused-vars, @next/next/no-img-element */

import { useState } from "react";
import { CheckCircle2, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ClientActionsProps {
  token: string;
  orderId: string;
  isAlreadyApproved: boolean;
}

export default function ClientActions({ token, orderId, isAlreadyApproved }: ClientActionsProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isDiscussing, setIsDiscussing] = useState(false);
  const [approvedState, setApprovedState] = useState(isAlreadyApproved);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApprove = async () => {
    setIsApproving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/approve/${token}`, {
        method: "POST",
      });
      if (res.ok) {
        setApprovedState(true);
        setMsg({ type: "success", text: "Change Order Approved Successfully!" });
      } else {
        const text = await res.text();
        setMsg({ type: "error", text: text || "Failed to approve order." });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Network error occurred." });
    } finally {
      setIsApproving(false);
    }
  };

  const handleDiscuss = async () => {
    setIsDiscussing(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/approve/${token}/discuss`, {
        method: "POST",
      });
      if (res.ok) {
        setMsg({ type: "success", text: "Discussion requested. The designer will contact you soon." });
      } else {
        const text = await res.text();
        setMsg({ type: "error", text: text || "Failed to request discussion." });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Network error occurred." });
    } finally {
      setIsDiscussing(false);
    }
  };

  if (approvedState) {
    return (
      <div className="bg-success/10 border-2 border-success p-8 text-center text-success neo-shadow mt-10">
        <CheckCircle2 size={48} className="mx-auto mb-4" />
        <h3 className="text-[24px] font-serif font-bold mb-2">Change Order Approved</h3>
        <p className="text-[14px] font-medium opacity-80 max-w-md mx-auto">
          Thank you for approving this order. The designer has been notified and will proceed with the changes.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-6">
      {msg && (
        <div className={`p-4 border-2 font-bold text-[13px] uppercase tracking-widest flex items-center gap-3 ${msg.type === 'success' ? 'bg-success/10 text-success border-success' : 'bg-destructive/10 text-destructive border-destructive'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />}
          {msg.text}
        </div>
      )}

      <div className="bg-primary/5 border-2 border-primary neo-shadow p-8 text-center">
        <h3 className="text-[24px] font-serif font-bold text-primary mb-4">Approval Required</h3>
        <p className="text-foreground/80 text-[14px] leading-relaxed max-w-md mx-auto mb-8">
          By approving this order, you agree to the updated scope and estimated cost.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleApprove}
            disabled={isApproving || isDiscussing}
            className="w-full sm:w-auto px-8 py-4 bg-primary text-background border-2 border-border font-bold text-[14px] uppercase tracking-widest hover:bg-primary/90 transition-colors neo-shadow hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isApproving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            {isApproving ? "APPROVING..." : "APPROVE CHANGE"}
          </button>

          <button
            onClick={handleDiscuss}
            disabled={isApproving || isDiscussing}
            className="w-full sm:w-auto px-8 py-4 bg-card text-foreground border-2 border-border font-bold text-[14px] uppercase tracking-widest hover:bg-muted transition-colors neo-shadow-sm hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isDiscussing ? <Loader2 className="animate-spin" size={20} /> : <MessageSquare size={20} />}
            {isDiscussing ? "SENDING..." : "REQUEST DISCUSSION"}
          </button>
        </div>
      </div>
    </div>
  );
}
