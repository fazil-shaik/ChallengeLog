import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { users, subscriptions } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";
import Cashfree from "@/app/lib/cashfree";

export async function POST(req: Request) {
  try {
    // In a production environment, you should verify the Cashfree webhook signature here
    const payload = await req.json();

    // Depending on webhook version, fields might vary. We'll use a generic approach based on standard patterns
    const type = payload.type || payload.event_time ? "CASHFREE_EVENT" : "UNKNOWN";
    
    // Quick parse logic for demonstration
    // Usually Cashfree subscription webhook gives payload.data.subscription.subscription_ref_id
    const subscriptionEvent = payload.data?.subscription; 
    
    if (subscriptionEvent) {
       const subRef = subscriptionEvent.subscription_ref_id; 
       const status = subscriptionEvent.status; // e.g. 'ACTIVE', 'COMPLETED', 'CANCELLED'
       const customerEmail = subscriptionEvent.customer_email;

       if (status === "ACTIVE") {
           // Find user by email (or extract id from subRef if we embedded it)
           const dbUser = await db.query.users.findFirst({
               where: eq(users.email, customerEmail)
           });

           if (dbUser) {
               // Upsert subscription logic
               const existingSub = await db.query.subscriptions.findFirst({
                   where: eq(subscriptions.userId, dbUser.id)
               });

               if (existingSub) {
                   await db.update(subscriptions)
                      .set({ 
                          status: 'active',
                          cashfreeSubId: subRef,
                          plan: 'pro'
                      })
                      .where(eq(subscriptions.userId, dbUser.id));
               } else {
                   await db.insert(subscriptions).values({
                       userId: dbUser.id,
                       cashfreeSubId: subRef,
                       cashfreeCustomerId: dbUser.id, // Or customer_id from payload
                       status: 'active',
                       plan: 'pro'
                   });
               }

               // Update user plan
               await db.update(users)
                  .set({ plan: 'pro' })
                  .where(eq(users.id, dbUser.id));
           }
       } else if (status === "CANCELLED") {
           // Handle cancellation
           const dbUser = await db.query.users.findFirst({
               where: eq(users.email, customerEmail)
           });

           if (dbUser) {
               await db.update(subscriptions)
                  .set({ 
                      status: 'cancelled',
                      plan: 'free'
                  })
                  .where(eq(subscriptions.userId, dbUser.id));

               await db.update(users)
                  .set({ plan: 'free' })
                  .where(eq(users.id, dbUser.id));
           }
       }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Cashfree Webhook error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }
}
