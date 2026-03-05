import { InvoiceStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { statusFromDueDateForFailedManualReview } from "@/lib/invoice-lifecycle";

const reviewSchema = z.object({
  paymentId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(240).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const payment = await db.payment.findUnique({
      where: { id: parsed.data.paymentId },
      include: {
        invoice: true,
      },
    });

    if (!payment || !payment.invoiceId || !payment.invoice) {
      return NextResponse.json({ message: "Manual payment not found" }, { status: 404 });
    }

    if (payment.method !== PaymentMethod.MANUAL) {
      return NextResponse.json({ message: "Only manual submissions can be reviewed" }, { status: 400 });
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return NextResponse.json({ message: "This payment is already reviewed" }, { status: 400 });
    }

    const reviewNote = parsed.data.reason?.trim();

    if (parsed.data.action === "approve") {
      await db.$transaction([
        db.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.PAID,
            paidAt: new Date(),
            reviewedAt: new Date(),
            reviewedById: session.sub,
            reviewNote: reviewNote && reviewNote.length > 0 ? reviewNote : "Approved by admin",
          },
        }),
        db.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            status: InvoiceStatus.PAID,
          },
        }),
      ]);

      return NextResponse.json({ message: "Manual payment approved" });
    }

    const existingPaid = await db.payment.findFirst({
      where: {
        invoiceId: payment.invoiceId,
        id: { not: payment.id },
        status: PaymentStatus.PAID,
      },
      select: { id: true },
    });

    const fallbackStatus = existingPaid
      ? InvoiceStatus.PAID
      : statusFromDueDateForFailedManualReview(payment.invoice.dueDate);

    await db.$transaction([
      db.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          reviewedAt: new Date(),
          reviewedById: session.sub,
          reviewNote: reviewNote && reviewNote.length > 0 ? reviewNote : "Rejected by admin",
        },
      }),
      db.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          status: fallbackStatus,
        },
      }),
    ]);

    return NextResponse.json({ message: "Manual payment rejected" });
  } catch (error) {
    console.error("Manual review error", error);
    return NextResponse.json({ message: "Failed to review manual payment" }, { status: 500 });
  }
}
