import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { changeOrders, changeRequests, projects, users } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { ChangeOrderDiscussEmail } from "@/components/emails/ChangeOrderDiscussEmail";

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

    const { order, project, designer } = queryResult[0];

    if (!order || !project || !designer) {
      return new NextResponse("Incomplete data relationship", { status: 500 });
    }

    // If order is already approved, maybe don't allow discussion?
    if (order.status === 'approved') {
      return new NextResponse("Order is already approved", { status: 400 });
    }

    // Send email to designer requesting discussion
    if (designer.email) {
      const origin = req.url ? new URL(req.url).origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const orderLink = `${origin}/projects/${project.id}/orders/${order.id}`;

      const emailRes = await resend.emails.send({
        from: "hello@contact.shorty-url.online",
        to: [designer.email],
        subject: `Discussion Requested: Change Order for ${project.clientName}`,
        react: ChangeOrderDiscussEmail({
          designerName: designer.name || 'Designer',
          clientName: project.clientName || 'Client',
          projectName: project.clientName || 'Project',
          orderLink,
        }) as React.ReactElement,
      });

      if (emailRes.error) {
        console.error("Failed to send discussion request email (Resend API Error):", emailRes.error);
      }
    }

    return NextResponse.json({ success: true, message: 'Discussion requested successfully' });
  } catch (error) {
    console.error("Error requesting discussion:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
