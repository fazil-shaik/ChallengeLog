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

    // Create a new jsPDF instance
    const doc = new jsPDF();
    let y = 0;
    const margin = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    const primaryColor = [15, 23, 42]; // Slate 900
    const accentColor = [139, 92, 246]; // Violet 500

    const addWatermark = (pdfDoc: jsPDF) => {
      if (designer.plan === 'free') {
        pdfDoc.saveGraphicsState();
        // @ts-ignore
        pdfDoc.setGState(new (pdfDoc as any).GState({ opacity: 0.05 }));
        pdfDoc.setTextColor(150, 150, 150);
        pdfDoc.setFontSize(70);
        pdfDoc.text("Changelog", 40, 200, { angle: 45 });
        pdfDoc.restoreGraphicsState();
      }
    };

    const addFooter = (pdfDoc: jsPDF, pageNum: number, totalPages: number) => {
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.setFontSize(8);
      pdfDoc.setTextColor(150, 150, 150);
      pdfDoc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
      pdfDoc.text("Generated via Challengelog • Professional Change Management", margin, pageHeight - 10);
    };

    const checkPageBreak = (height: number) => {
      if (y + height > pageHeight - margin - 20) {
        doc.addPage();
        addWatermark(doc);
        y = margin + 10;
        return true;
      }
      return false;
    };

    // --- PAGE 1 CONTENT ---
    addWatermark(doc);

    // Modern Header Bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("CHANGE ORDER", margin, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`ID: #${order.id.slice(-8).toUpperCase()}`, margin, 32);
    
    const dateFormatted = order.approvedAt ? format(new Date(order.approvedAt), "MMM d, yyyy") : format(new Date(), "MMM d, yyyy");
    doc.text(`DATE: ${dateFormatted.toUpperCase()}`, pageWidth - margin - 40, 32);

    y = 55;

    // Grid Layout for Metadata
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    // FROM (Designer)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DESIGNER", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(designer.name, margin, y);
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(designer.email, margin, y);

    // TO (Client) - Same Y, different X
    y = 55;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("CLIENT / PROJECT", 110, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(project.clientName, 110, y);
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(project.clientEmail, 110, y);

    y += 20;

    // SECTION: SCOPE OF WORK
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DESCRIPTION OF CHANGE", margin + 2, y + 6);
    y += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    const scopeLines = doc.splitTextToSize(request.description, pageWidth - 2 * margin);
    doc.text(scopeLines, margin, y);
    y += (scopeLines.length * 6) + 15;

    if (order.designerNotes) {
      checkPageBreak(30);
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
      doc.setFont("helvetica", "bold");
      doc.text("DESIGNER NOTES", margin + 2, y + 6);
      y += 15;
      doc.setFont("helvetica", "normal");
      const notesLines = doc.splitTextToSize(order.designerNotes, pageWidth - 2 * margin);
      doc.text(notesLines, margin, y);
      y += (notesLines.length * 6) + 15;
    }

    if (request.aiReasoning) {
      checkPageBreak(40);
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2], 0.05);
      doc.rect(margin, y, pageWidth - 2 * margin, 35, 'F');
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text("AI SCOPE ANALYSIS", margin + 5, y + 10);
      y += 16;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      const reasoningLines = doc.splitTextToSize(request.aiReasoning, pageWidth - 2 * margin - 10);
      doc.text(reasoningLines, margin + 5, y);
      y += (reasoningLines.length * 5) + 15;
    }

    // SECTION: COST SUMMARY
    checkPageBreak(40);
    y += 10;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    // Hours Box
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, 40, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("TOTAL HOURS", margin + 5, y + 7);
    doc.setFontSize(14);
    doc.text(`${order.hours} HRS`, margin + 5, y + 15);

    // Cost Box
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(margin + 45, y, 60, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("RECOVERABLE VALUE", margin + 50, y + 7);
    doc.setFontSize(14);
    doc.text(`$${Number(order.cost).toLocaleString()}`, margin + 50, y + 15);

    y += 35;

    // APPROVAL FOOTER
    checkPageBreak(30);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const approvedByName = order.approvedByName || project.clientName;
    const approvalText = `This change order was electronically approved by ${approvedByName}${order.approvedIp ? ` from IP ${order.approvedIp}` : ''} on ${format(new Date(order.approvedAt || new Date()), "MMM d, yyyy")}.`;
    const approvalLines = doc.splitTextToSize(approvalText, pageWidth - 2 * margin);
    doc.text(approvalLines, margin, y);

    // Add page numbers at the end
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages);
    }

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
