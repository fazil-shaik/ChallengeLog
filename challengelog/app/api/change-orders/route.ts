import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/lib/auth";
import { db } from "@/app/db";
import { changeOrders, changeRequests, auditEvents, projects, users } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const userId = (session?.user as any)?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { changeRequestId, hours, cost, designerNotes, projectId } = body;

    // Verify Project Ownership
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
         // Maybe user is not configured in relations, we fetch user separately
      }
    });

    if (!project || project.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const designer = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    // Generate unique approval token
    const approvalToken = crypto.randomUUID();

    // 1. Create Change Order
    const [newOrder] = await db.insert(changeOrders).values({
      changeRequestId,
      hours: hours.toString(),
      cost: cost.toString(),
      designerNotes,
      approvalToken,
      status: 'pending'
    }).returning();

    // 2. Update Change Request status
    const [updatedReq] = await db.update(changeRequests)
      .set({ status: 'pending' })
      .where(eq(changeRequests.id, changeRequestId))
      .returning();

    // 3. Log Audit Event
    await db.insert(auditEvents).values({
      projectId,
      eventType: 'change_order_created',
      actor: 'designer',
      payload: JSON.stringify({
        changeOrderId: newOrder.id,
        hours,
        cost
      })
    });

    // 4. Send Email via internal API call (or directly here if preferred, but following plan)
    const emailRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send-approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientEmail: project.clientEmail,
        clientName: project.clientName,
        designerName: designer?.name || "Your Designer",
        projectName: project.clientName,
        changeDescription: updatedReq.description,
        cost: cost.toString(),
        approvalToken: approvalToken,
        projectId: project.id,
        orderId: newOrder.id
      })
    });

    if (!emailRes.ok) {
       console.error("Failed to send approval email");
       // we still return success for order creation, email can be retried or caught
    }

    return NextResponse.json({ changeOrder: newOrder });

  } catch (error) {
    console.error("Error creating change order:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
