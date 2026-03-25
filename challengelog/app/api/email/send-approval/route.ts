import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ChangeOrderApprovalEmail } from "@/components/emails/ChangeOrderApprovalEmail";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientEmail, clientName, designerName, projectName, changeDescription, cost, approvalToken, projectId, orderId } = body;

    const approvalLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/approve/${approvalToken}`;

    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // Uses Resend's default onboarding email to avoid verification blocks
      to: [clientEmail],
      subject: `Approval Required: New Change Order for ${projectName}`,
      react: ChangeOrderApprovalEmail({
        designerName,
        clientName,
        projectName,
        changeDescription,
        cost,
        approvalLink,
      }) as React.ReactElement,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email API error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
