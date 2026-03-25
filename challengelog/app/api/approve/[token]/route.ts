import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { changeOrders, auditEvents, changeRequests, projects, users } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { ChangeOrderApprovedEmail } from "@/components/emails/ChangeOrderApprovedEmail";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const awaitedParams = await params;
    const token = awaitedParams.token;

    if (!token) {
      return new NextResponse("Token is required", { status: 400 });
    }

    // Capture IP
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Fetch the order with joined data
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
      return new NextResponse("Invalid token or order not found", { status: 404 });
    }

    const { order, request, project, designer } = queryResult[0];

    if (!order || !request || !project || !designer) {
      return new NextResponse("Incomplete data relationship", { status: 500 });
    }

    if (order.status === 'approved') {
      return new NextResponse("Order is already approved", { status: 400 });
    }

    // Update order status
    await db.update(changeOrders)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        approvedIp: ip,
        approvedByName: project.clientName,
      })
      .where(eq(changeOrders.id, order.id));

    // Update change request status to approved
    await db.update(changeRequests)
      .set({ status: 'approved' })
      .where(eq(changeRequests.id, request.id));

    // Log audit event
    await db.insert(auditEvents).values({
      projectId: project.id,
      eventType: 'change_order_approved',
      actor: 'client',
      payload: JSON.stringify({
        changeOrderId: order.id,
        ip,
      }),
    });

    // Send email to designer
    if (designer.email) {
      const orderLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/projects/${project.id}/orders/${order.id}`;
      
      await resend.emails.send({
        from: "onboarding@resend.dev", // Use onboarding domain to ensure delivery in test mode
        to: [designer.email],
        subject: `Approved: Change Order for ${project.clientName}`,
        react: ChangeOrderApprovedEmail({
          designerName: designer.name || 'Designer',
          clientName: project.clientName || 'Client',
          projectName: project.clientName || 'Project', // fallback if we don't have project name explicitly
          cost: order.cost?.toString() || "0.00",
          orderLink,
        }) as React.ReactElement,
      });
    }

    return NextResponse.json({ success: true, message: 'Approved successfully' });
  } catch (error) {
    console.error("Error approving order:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
