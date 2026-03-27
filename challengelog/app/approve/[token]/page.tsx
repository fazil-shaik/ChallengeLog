/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
import { db } from "@/app/db";
import { changeOrders, changeRequests, projects, users } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ClientActions from "./client-actions";
import { FileText, Clock, FileWarning } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default async function ApproveChangeOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const awaitedParams = await params;
  const token = awaitedParams.token;

  if (!token) {
    notFound();
  }

  const queryResult = await db
    .select({
      order: changeOrders,
      request: changeRequests,
      project: projects,
      designer: users,
    })
    .from(changeOrders)
    .leftJoin(changeRequests, eq(changeOrders.changeRequestId, changeRequests.id))
    .leftJoin(projects, eq(changeRequests.projectId, projects.id))
    .leftJoin(users, eq(projects.userId, users.id))
    .where(eq(changeOrders.approvalToken, token))
    .limit(1);

  if (!queryResult || queryResult.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <FileWarning size={64} className="text-destructive mb-6" />
        <h1 className="text-3xl font-serif font-bold italic mb-4">Link Invalid or Expired</h1>
        <p className="text-foreground/70 max-w-md mx-auto">
          We couldn't find a change order matching this secure token. Please contact your designer for a new link.
        </p>
      </div>
    );
  }

  const { order, request, project, designer } = queryResult[0];

  if (!order || !request || !project || !designer) {
    return notFound();
  }

  const isAlreadyApproved = order.status === 'approved';

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header section */}
      <div className="bg-background border-b-2 border-border px-6 py-6 sticky top-0 z-20">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {designer.logoUrl && designer.plan !== 'free' ? (
              <img src={designer.logoUrl} alt={designer.name || 'Designer Logo'} className="w-12 h-12 rounded border-2 border-border object-cover neo-shadow-sm" />
            ) : (
              <div className="w-12 h-12 bg-primary text-background flex items-center justify-center font-bold text-xl border-2 border-border neo-shadow-sm">
                {designer.name?.charAt(0).toUpperCase() || 'D'}
              </div>
            )}
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-foreground/50">Designer</p>
              <h1 className="text-xl font-bold font-serif italic text-foreground leading-tight">
                {designer.name}
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mx-auto px-6 mt-12">
        <div className="mb-10 text-center">
          <span className="px-3 py-1.5 bg-muted text-foreground/60 border-[1.5px] border-border text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2 mb-6">
            <Clock size={12} /> Pending Approval
          </span>
          <h2 className="text-[32px] md:text-[48px] font-serif font-bold italic tracking-tight text-foreground leading-none mb-4">
            Change Order Request
          </h2>
          <p className="text-foreground/60 font-medium">
            Project: <span className="text-foreground font-bold">{project.clientName}</span>
          </p>
        </div>

        <div className="bg-card border-2 border-border neo-shadow p-8 relative">
          <div className="absolute top-[-2px] right-[-2px] w-8 h-8 border-t-[4px] border-r-[4px] border-primary z-10 pointer-events-none"></div>

          <h3 className="text-[20px] font-serif font-bold flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-secondary border-[1.5px] border-border"></div>
            Scope Details
          </h3>

          <div className="bg-muted/30 border-[1.5px] border-border p-6 mb-8">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 mb-3 block">Requested Change</h4>
            <p className="text-[15px] font-medium leading-relaxed">{request.description}</p>
          </div>

          {order.designerNotes && (
            <div className="bg-background border-[1.5px] border-border p-6 mb-8 neo-shadow-sm">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                <FileText size={14} /> Designer Notes
              </h4>
              <p className="text-[14px] leading-relaxed text-foreground/80 whitespace-pre-wrap">{order.designerNotes}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-[1.5px] border-border p-6 bg-card text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-muted/20 rotate-45 transform translate-x-8 -translate-y-8"></div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 mb-2">Timeline Note</p>
              <p className="text-[32px] font-mono font-bold">{order.hours} <span className="text-[16px] text-foreground/40">HRS</span></p>
            </div>
            <div className="border-[1.5px] border-border p-6 bg-primary/5 text-center text-primary relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/10 rotate-45 transform -translate-x-8 translate-y-8"></div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2 opacity-70">Total Cost</p>
              <p className="text-[32px] font-mono font-bold"><span className="text-[20px] opacity-50 mr-1">$</span>{order.cost}</p>
            </div>
          </div>
        </div>

        <ClientActions token={token} orderId={order.id} isAlreadyApproved={isAlreadyApproved} />
      </div>
    </div>
  );
}
