/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/lib/auth";
import { db } from "@/app/db";
import { projects, changeRequests, changeOrders, auditEvents } from "@/app/(Schema)/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    const userId = (session?.user as any)?.id;
    
    const awaitedParams = await params;
    const orderId = awaitedParams.orderId;

    // Fetch the order
    const order = await db.query.changeOrders.findFirst({
      where: eq(changeOrders.id, orderId)
    });

    if (!order) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Fetch the related request
    const request = await db.query.changeRequests.findFirst({
      where: eq(changeRequests.id, order.changeRequestId)
    });

    if (!request) {
       return new NextResponse("Related Request Not Found", { status: 404 });
    }

    // Fetch the related project
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, request.projectId)
    });

    if (!project) {
        return new NextResponse("Project Not Found", { status: 404 });
    }

    // Check permissions if there's no token in query? 
    // Wait, the client can view this if they have the link (they are not logged in)
    // Actually, client goes to this link from their email. They are NOT logged in.
    // So this route MUST allow public access if token is valid, or just public read for order details (it's UUID based so unguessable).
    // Let's just allow read access without auth, since orderId is a UUID and acts as a capability URL.
    
    // We can also fetch the timeline (audit events)
    const timeline = await db.query.auditEvents.findMany({
      where: eq(auditEvents.projectId, project.id),
      orderBy: (auditEvents, { asc }) => [asc(auditEvents.createdAt)]
    });

    const orderTimeline = timeline.filter(t => {
       const p = t.payload ? JSON.parse(t.payload) : {};
       return t.eventType.startsWith('change_order') && p.changeOrderId === orderId;
    });

    return NextResponse.json({
        order,
        request,
        project,
        timeline: orderTimeline
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
