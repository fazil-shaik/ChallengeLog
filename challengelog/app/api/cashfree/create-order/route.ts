import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import cashfree from "@/app/lib/cashfree";
import { db } from "@/app/db";
import { users } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json(); // e.g. 'pro'

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email)
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Standard Payment Gateway Order
    const orderId = `order_${createId()}`;

    // Amount for PRO plan in INR (roughly $49)
    const amount = 4500.00;

    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: dbUser.id,
        customer_email: dbUser.email,
        customer_phone: "9999999999", // Placeholder
        customer_name: dbUser.name || "Customer",
      },
      order_meta: {
        // Redirect back to billing with success/failure flags
        return_url: `${new URL(req.url).origin}/settings/billing?order_id={order_id}`,
        notify_url: `${new URL(req.url).origin}/api/webhooks/cashfree`,
      },
      order_note: `Upgrade to ${planId || 'pro'} plan`,
    };

    // Use current SDK method
    const response = await cashfree.PGCreateOrder(request).catch((err: any) => {
      console.error("Cashfree API error:", err.response?.data || err.message);
      throw err;
    });

    return NextResponse.json({
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id
    });

  } catch (error: any) {
    console.error("Cashfree Order Create error:", error);
    return NextResponse.json({
      error: error.message || "Failed to create checkout session"
    }, { status: 500 });
  }
}
