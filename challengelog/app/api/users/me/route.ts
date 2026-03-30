/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/app/lib/auth";
import { db } from "../../../db";
import { users, subscriptions } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";

const getSession = async () => {
  return await getServerSession(authConfig);
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email)
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch subscription details
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, dbUser.id),
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)]
    });

    return NextResponse.json({
      ...dbUser,
      subscription
    });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
