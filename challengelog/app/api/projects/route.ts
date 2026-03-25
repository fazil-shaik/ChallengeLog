/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/lib/auth";
import { db } from "@/app/db";
import { projects, users } from "@/app/(Schema)/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    const userId = (session?.user as any)?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const userProjects = await db.query.projects.findMany({
      where: eq(projects.userId, userId),
      // order by descending createdAt is good practice, but requires eq or ordering configs
    });

    return NextResponse.json(userProjects);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const userId = (session?.user as any)?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { clientName, clientEmail, briefText, briefFileUrl, briefFileId, originalValue } = body;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { plan: true }
    });

    if (user?.plan === 'free') {
      const existingProjects = await db.query.projects.findMany({
        where: eq(projects.userId, userId),
        columns: { id: true }
      });
      if (existingProjects.length >= 2) {
        return new NextResponse("Free plan limit reached (max 2 projects). Please upgrade to Pro.", { status: 403 });
      }
    }

    const newProject = await db.insert(projects).values({
      userId,
      clientName,
      clientEmail,
      briefText: briefText || null,
      briefFileUrl: briefFileUrl || null,
      briefFileId: briefFileId || null,
      originalValue: originalValue || 0,
    }).returning();

    return NextResponse.json(newProject[0]);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
