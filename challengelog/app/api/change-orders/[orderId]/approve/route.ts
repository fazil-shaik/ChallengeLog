import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { changeOrders, auditEvents, changeRequests } from "@/app/(Schema)/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const awaitedParams = await params;
    const orderId = awaitedParams.orderId;

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return new NextResponse("Token is required", { status: 400 });
    }

    // Fetch the order
    const order = await db.query.changeOrders.findFirst({
      where: and(
        eq(changeOrders.id, orderId),
        eq(changeOrders.approvalToken, token)
      )
    });

    if (!order) {
      return new NextResponse("Invalid token or order not found", { status: 404 });
    }

    if (order.status === 'approved') {
      return new NextResponse("Order is already approved", { status: 400 });
    }

    // Update order status
    await db.update(changeOrders)
      .set({
        status: 'approved',
        approvedAt: new Date()
      })
      .where(eq(changeOrders.id, orderId));

    // Update change request status to approved
    await db.update(changeRequests)
      .set({ status: 'approved' })
      .where(eq(changeRequests.id, order.changeRequestId));

    // Log audit event
    // Find project id from changeRequest
    const reqData = await db.query.changeRequests.findFirst({
      where: eq(changeRequests.id, order.changeRequestId)
    });

    if (reqData) {
      await db.insert(auditEvents).values({
        projectId: reqData.projectId,
        eventType: 'change_order_approved',
        actor: 'client',
        payload: JSON.stringify({
          changeOrderId: orderId
        })
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error approving order:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
