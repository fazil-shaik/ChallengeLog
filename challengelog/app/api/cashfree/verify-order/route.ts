import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import cashfree from "@/app/lib/cashfree";
import { db } from "@/app/db";
import { users, subscriptions } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // 1. Fetch order status from Cashfree
    const response = await cashfree.PGFetchOrder(orderId).catch((err: any) => {
      console.error("Cashfree Fetch Order error:", err.response?.data || err.message);
      throw err;
    });

    const orderData = response.data;

    // 2. If order is PAID, update database (Proactive update for Local Dev/Reliability)
    if (orderData.order_status === "PAID" && orderData.customer_details) {
      const customerEmail = orderData.customer_details.customer_email;
      const customerId = orderData.customer_details.customer_id;

      if (!customerId) {
        return NextResponse.json({ error: "Missing customer_id in order" }, { status: 400 });
      }

      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, customerId) // Match by ID for better reliability
      });

      if (dbUser && dbUser.plan !== 'pro') {
        console.log(`[VERIFY-ORDER] Proactively updating user ${dbUser.email} to PRO plan`);

        await db.update(users)
          .set({ plan: 'pro' })
          .where(eq(users.id, dbUser.id));

        // Upsert subscription
        const existingSub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.userId, dbUser.id)
        });

        if (existingSub) {
          await db.update(subscriptions)
            .set({
              status: 'active',
              cashfreeSubId: orderId,
              plan: 'pro',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            })
            .where(eq(subscriptions.userId, dbUser.id));
        } else {
          await db.insert(subscriptions).values({
            userId: dbUser.id,
            cashfreeCustomerId: customerId,
            cashfreeSubId: orderId,
            status: 'active',
            plan: 'pro',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          });
        }
      }

      return NextResponse.json({
        status: "PAID",
        plan: "pro",
        message: "Order verified and plan updated."
      });
    }

    return NextResponse.json({
      status: orderData.order_status,
      plan: "free",
      message: `Order status is ${orderData.order_status}`
    });

  } catch (error: any) {
    console.error("Verify Order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify order" }, { status: 500 });
  }
}
