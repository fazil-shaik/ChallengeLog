/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/lib/auth";
import { db } from "@/app/db";
import { changeOrders, changeRequests, auditEvents, projects, users } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { Resend } from "resend";
import { ChangeOrderApprovalEmail } from "@/components/emails/ChangeOrderApprovalEmail";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

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

    // 4. Send Email directly using Resend
    const origin = req.url ? new URL(req.url).origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const approvalLink = `${origin}/approve/${approvalToken}`;

    try {
      const emailRes = await resend.emails.send({
        from: '"ChangeLog" <hello@contact.shorty-url.online>', // Quoted name helps avoid spam filters
        to: [project.clientEmail],
        subject: `Approval Required: New Change Order for ${project.clientName}`,
        react: ChangeOrderApprovalEmail({
          designerName: designer?.name || "Your Designer",
          clientName: project.clientName,
          projectName: project.clientName,
          changeDescription: updatedReq.description,
          cost: cost.toString(),
          approvalLink,
        }) as React.ReactElement,
      });

      if (emailRes.error) {
        console.error("Failed to send approval email (Resend API Error):", emailRes.error);
      }
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

    return NextResponse.json({ changeOrder: newOrder });

  } catch (error) {
    console.error("Error creating change order:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
