/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { changeOrders, changeRequests, projects, users } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";
import ImageKit from "imagekit";
import jsPDF from "jspdf";
import { format } from "date-fns";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "placeholder_public_key",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "placeholder_private_key",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/placeholder",
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const awaitedParams = await params;
    const orderId = awaitedParams.orderId;

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    // Fetch the order with joined data
    const queryResult = await db
      .select({
        order: changeOrders,
        request: changeRequests,
        project: projects,
        designer: users,
      })
      .from(changeOrders)
      .leftJoin(changeRequests, eq(changeOrders.changeRequestId, changeRequests.id))
      .leftJoin(projects, eq(changeRequests.projectId, projects.id))
      .leftJoin(users, eq(projects.userId, users.id))
      .where(eq(changeOrders.id, orderId))
      .limit(1);

    if (!queryResult || queryResult.length === 0) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const { order, request, project, designer } = queryResult[0];

    if (!order || !request || !project || !designer) {
      return new NextResponse("Incomplete data relationship", { status: 500 });
    }

    if (order.status !== 'approved') {
      return new NextResponse("Only approved change orders can generate a PDF", { status: 400 });
    }

    // Create a new jsPDF instance (standard letter size: 8.5 x 11 inches -> 215.9 x 279.4 mm -> default 'a4' is close enough)
    const doc = new jsPDF();

    // Configuration / Theme matching "Neo-Brutalism" vibes
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);

    if (designer.plan === 'free') {
      doc.saveGraphicsState();
      doc.setGState(new (doc as any).GState({opacity: 0.1}));
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(80);
      doc.text("WATERMARK - FREE PLAN", 30, 250, { angle: 45 });
      doc.restoreGraphicsState();
      doc.setTextColor(0, 0, 0); // reset color
    }

    // Header
    doc.text("CHANGE ORDER APPROVAL", 20, 30);

    // Line separator
    doc.setLineWidth(1);
    doc.line(20, 35, 190, 35);

    // Designer details
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Designer: ${designer.name}`, 20, 50);

    // Project Info
    doc.setFont("helvetica", "bold");
    doc.text(`Project: ${project.clientName}`, 20, 60);

    // Order Meta
    doc.setFont("helvetica", "normal");
    doc.text(`Change Order ID: #${order.id.slice(-8).toUpperCase()}`, 110, 50);
    const dateFormatted = order.approvedAt ? format(new Date(order.approvedAt), "MMM d, yyyy h:mm a") : "N/A";
    doc.text(`Approved Date: ${dateFormatted}`, 110, 60);

    // Box for Scope Details
    doc.setLineWidth(0.5);
    doc.rect(20, 75, 170, 70);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SCOPE DETAILS", 25, 85);

    doc.setFont("helvetica", "normal");
    const scopeLines = doc.splitTextToSize(`Change Request: ${request.description}`, 160);
    doc.text(scopeLines, 25, 95);

    if (order.designerNotes) {
      const notesLines = doc.splitTextToSize(`Designer Notes: ${order.designerNotes}`, 160);
      doc.text(notesLines, 25, 115);
    }

    // Costs Box
    doc.setLineWidth(0.5);
    doc.rect(20, 155, 80, 30);
    doc.rect(110, 155, 80, 30);

    doc.setFontSize(10);
    doc.text("ESTIMATED HOURS", 25, 165);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`${order.hours} HRS`, 25, 178);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("TOTAL COST", 115, 165);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`$${order.cost}`, 115, 178);

    // Audit Info
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(`Electronically approved by: ${order.approvedByName || project.clientName}`, 20, 210);
    if (order.approvedIp) {
      doc.text(`IP Address: ${order.approvedIp}`, 20, 217);
    }

    doc.setFontSize(8);
    doc.text("This document serves as an official addendum to your contract.", 20, 260);
    doc.text("System generated via Challengelog.", 20, 265);

    // Output to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Upload to ImageKit
    const uploadPath = `/changelog/orders/${order.id}`;
    const uploadFileName = `CO-${order.id.slice(-6).toUpperCase()}.pdf`;

    const imageKitResponse = await imagekit.upload({
      file: pdfBuffer.toString("base64"),
      fileName: uploadFileName,
      folder: uploadPath,
      useUniqueFileName: false
    });

    // Update DB
    await db.update(changeOrders)
      .set({
        pdfUrl: imageKitResponse.url,
        pdfFileId: imageKitResponse.fileId,
      })
      .where(eq(changeOrders.id, order.id));

    return NextResponse.json({
      success: true,
      pdfUrl: imageKitResponse.url,
      pdfFileId: imageKitResponse.fileId
    });
  } catch (error) {
    console.error("PDF Generate error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
