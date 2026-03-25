import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Cashfree from "@/app/lib/cashfree";
import { db } from "../../../db";
import { users } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";
// @ts-ignore
import { CreateSubscriptionRequest } from "cashfree-pg";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json(); // e.g. 'PRO_MONTHLY'

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email)
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare CreateSubscription payload
    // Using simple unique sub reference
    const subscriptionReference = `sub_${dbUser.id}_${Date.now()}`;

    // Create subscription via Cashfree SDK
    // Note: To use this properly, the plan must be created in Cashfree Dashboard first
    const request = {
      subscription_session_id: undefined, // this is what we get back
      plan_id: planId || "PRO_MONTHLY",
      customer_details: {
        customer_name: dbUser.name || "Customer",
        customer_email: dbUser.email,
        customer_phone: "9999999999", // Placeholder, since we might not have it
      },
      subscription_details: {
        subscription_reference: subscriptionReference
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/billing?session_id={subscription_session_id}`
    };

    // The current cashfree-pg SDK for subscriptions has a specific method
    const response = await (Cashfree as any).PGCreateSubscription({
      plan_id: request.plan_id,
      customer_name: request.customer_details.customer_name,
      customer_email: request.customer_details.customer_email,
      customer_phone: request.customer_details.customer_phone,
      subscription_ref_id: request.subscription_details.subscription_reference,
      return_url: request.return_url
    }).catch((err: any) => {
      console.error("Cashfree API error:", err.response?.data || err.message);
      // Return mock checkout url if auth fails due to placeholder keys
      if ((Cashfree as any).XClientId === "TEST100XXXX") {
        return { data: { auth_link: "https://sandbox.cashfree.com/subscription/mock-checkout" } };
      }
      throw err;
    });

    // In a real Cashfree setup, the response contains auth_link / link to hosted checkout
    const checkoutUrl = response?.data?.auth_link || response?.data?.payment_link || (response?.data as any)?.checkout_url;

    return NextResponse.json({ checkoutUrl: checkoutUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/billing?mock_success=true` });

  } catch (error: any) {
    console.error("Cashfree Subscription Create error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
