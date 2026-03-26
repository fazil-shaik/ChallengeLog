/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db";
import { changeRequests, auditEvents, projects } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";



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
    let aiInScope = false;
    let aiReasoning = null;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are an expert project manager estimating change requests for a software/design project. Respond ONLY with a raw JSON object."
            },
            {
              role: "user",
              content: `
                Project Brief / Contract:
                ---
                ${briefText || "No brief provided. Assume all requests are Out of Scope."}
                ---
                
                Change Request Description:
                ---
                ${description}
                ---
                
                Analyze the "Change Request Description" against the "Project Brief / Contract".
                
                Rules for "inScope":
                1. Set "inScope" to true ONLY if the change request is explicitly mentioned or reasonably implied as part of the initial deliverables in the brief.
                2. Set "inScope" to false if the request adds new features, design changes, or functionality NOT covered by the brief.
                3. If no brief is provided, "inScope" MUST be false.
                
                Provide your response as a JSON object with exactly these fields:
                - "hours": (number) Estimated hours to complete.
                - "cost": (number) Estimated cost based on typical $100/hr consultant rate.
                - "inScope": (boolean) Whether the request is within the original scope.
                - "reasoning": (string) Short explanation (1-2 sentences max) for your scope decision.
              `
            }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const result = await response.json();
      const parsed = JSON.parse(result.choices[0].message.content);
      
      aiHours = Number(parsed.hours) || 0;
      aiCost = Number(parsed.cost) || 0;
      if (typeof parsed.inScope === "boolean") {
          aiInScope = parsed.inScope;
      }
      aiReasoning = parsed.reasoning || "";
    } catch (aiError) {
      console.error("Groq AI failed to generate response:", aiError);
      aiReasoning = "AI Analysis failed or timed out.";
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
