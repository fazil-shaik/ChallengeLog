import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { waitlist } from "@/app/(Schema)/schema";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await db.insert(waitlist).values({ email });
    return NextResponse.json({ message: "Success" });
  } catch (error: any) {
    // Check for unique constraint violation (Postgres code 23505)
    if (error.code === '23505' || error.message?.includes('unique constraint')) {
      return NextResponse.json({ message: "You're already on the list!" }, { status: 200 });
    }
    console.error("Waitlist error:", error);
    return NextResponse.json({ message: "Failed to join waitlist" }, { status: 500 });
  }
}
