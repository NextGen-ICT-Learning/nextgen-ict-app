import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { InvoiceStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

function isInvoiceClosed(status: InvoiceStatus) {
  return status === InvoiceStatus.PAID || status === InvoiceStatus.WAIVED;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const invoiceId = formData.get("invoiceId");
    const note = formData.get("note");
    const receipt = formData.get("receipt");

    if (typeof invoiceId !== "string" || invoiceId.trim().length === 0) {
      return NextResponse.json({ message: "Invoice is required" }, { status: 400 });
    }

    if (!(receipt instanceof File)) {
      return NextResponse.json({ message: "Receipt file is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(receipt.type)) {
      return NextResponse.json(
        { message: "Unsupported receipt type. Use JPG, PNG, WEBP, or PDF." },
        { status: 400 },
      );
    }

    if (receipt.size > MAX_RECEIPT_SIZE_BYTES) {
      return NextResponse.json({ message: "Receipt size must be below 5MB" }, { status: 400 });
    }

    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        studentId: session.sub,
      },
    });

    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    if (isInvoiceClosed(invoice.status)) {
      return NextResponse.json({ message: "Invoice is already closed" }, { status: 400 });
    }

    const existingPending = await db.payment.findFirst({
      where: {
        invoiceId: invoice.id,
        method: PaymentMethod.MANUAL,
        status: PaymentStatus.PENDING,
      },
      select: { id: true },
    });

    if (existingPending) {
      return NextResponse.json(
        { message: "A manual payment request is already pending review" },
        { status: 400 },
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "receipts");
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(receipt.name) || ".bin";
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}_${sanitizeFilename(
      receipt.name.replace(ext, ""),
    )}${ext}`;

    const fullPath = path.join(uploadsDir, fileName);
    const bytes = await receipt.arrayBuffer();
    await writeFile(fullPath, Buffer.from(bytes));

    const receiptUrl = `/uploads/receipts/${fileName}`;

    await db.$transaction([
      db.invoice.update({
        where: { id: invoice.id },
        data: {
          status: InvoiceStatus.PENDING,
        },
      }),
      db.payment.create({
        data: {
          invoiceId: invoice.id,
          studentId: session.sub,
          amount: invoice.amount,
          currency: invoice.currency,
          method: PaymentMethod.MANUAL,
          status: PaymentStatus.PENDING,
          providerRef: `manual_submission_${invoice.id}_${Date.now()}`,
          note:
            typeof note === "string" && note.trim().length > 0
              ? note.trim().slice(0, 400)
              : "Manual payment submitted by student",
          receiptUrl,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Manual payment submitted successfully. Admin review pending.",
      receiptUrl,
    });
  } catch (error) {
    console.error("Manual payment submit error", error);
    return NextResponse.json({ message: "Failed to submit manual payment" }, { status: 500 });
  }
}
