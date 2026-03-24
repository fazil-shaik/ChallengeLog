import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db";
import { changeRequests, auditEvents, projects } from "@/app/(Schema)/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { eq } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { projectId, description, source, briefText } = await req.json();

    if (!projectId || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Initial Insert of the Change Request as analyzing
    const [draftRequest] = await db
      .insert(changeRequests)
      .values({
        projectId,
        description,
        source: source || "email",
        status: "draft", // initial status
      })
      .returning();

    // Log the audit event immediately
    await db.insert(auditEvents).values({
      projectId,
      eventType: "request_created",
      payload: JSON.stringify({ changeRequestId: draftRequest.id }),
    });

    let aiHours = 0;
    let aiCost = 0;
    let aiInScope = null;
    let aiReasoning = null;

    if (briefText) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-pro",
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const prompt = `
          You are an expert project manager estimating change requests.
          Project Brief / Contract:
          ---
          ${briefText}
          ---
          
          Change Request Description:
          ---
          ${description}
          ---
          
          Evaluate this request against the project brief. Provide your response as a JSON object with exactly these fields:
          - "hours": (number) Estimated hours to complete.
          - "cost": (number) Estimated cost based on typical $100/hr consultant rate.
          - "inScope": (boolean) True if this request is already covered by the brief, False if it is out of scope.
          - "reasoning": (string) Short explanation (1-2 sentences max) for your scope decision.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the JSON safely
        const parsed = JSON.parse(responseText);
        aiHours = Number(parsed.hours) || 0;
        aiCost = Number(parsed.cost) || 0;
        if (typeof parsed.inScope === "boolean") aiInScope = parsed.inScope;
        aiReasoning = parsed.reasoning || "";
      } catch (geminiError) {
        console.error("Gemini AI failed to generate response:", geminiError);
        // Fallback or leave fields empty on timeout/error
      }
    }

    // 2. Update the Draft Request with AI results
    const [finalRequest] = await db
      .update(changeRequests)
      .set({
        aiHours: aiHours.toString(),
        aiCost: aiCost.toString(),
        aiInScope,
        aiReasoning,
      })
      .where(eq(changeRequests.id, draftRequest.id))
      .returning();

    return NextResponse.json({ success: true, changeRequest: finalRequest });
  } catch (error: any) {
    console.error("Change Request Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
