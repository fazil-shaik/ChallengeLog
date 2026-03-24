import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/lib/auth";
import { db } from "@/app/db";
import { projects, changeRequests } from "@/app/(Schema)/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Note: Next 15 expects params to be a Promise in some contexts, but standard route is just params. Waiting, let's just await properly or use destructuring.
) {
  try {
    const session = await getServerSession(authConfig);
    const userId = (session?.user as any)?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const awaitedParams = await params;
    const projectId = awaitedParams.id;

    // Fetch project
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Verify ownership
    if (project.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch related change requests
    const projectChangeRequests = await db.query.changeRequests.findMany({
      where: eq(changeRequests.projectId, projectId),
      orderBy: [desc(changeRequests.createdAt)],
    });

    return NextResponse.json({ ...project, changeRequests: projectChangeRequests });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    const userId = (session?.user as any)?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const awaitedParams = await params;
    const projectId = awaitedParams.id;
    
    const body = await req.json();
    const { status } = body;

    const [updatedProject] = await db
      .update(projects)
      .set({ status })
      .where(eq(projects.id, projectId))
      .returning();

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
