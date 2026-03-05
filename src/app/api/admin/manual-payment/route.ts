import { NextResponse } from "next/server";
import { InvoiceStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { canInvoiceBeMarkedPaid } from "@/lib/invoice-lifecycle";

const manualPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  note: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = manualPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const invoice = await db.invoice.findUnique({
      where: { id: parsed.data.invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    if (!canInvoiceBeMarkedPaid(invoice.status)) {
      return NextResponse.json({ message: "Invoice already closed" }, { status: 400 });
    }

    await db.$transaction([
      db.invoice.update({
        where: { id: invoice.id },
        data: {
          status: InvoiceStatus.PAID,
        },
      }),
      db.payment.create({
        data: {
          invoiceId: invoice.id,
          studentId: invoice.studentId,
          amount: invoice.amount,
          currency: invoice.currency,
          method: PaymentMethod.MANUAL,
          status: PaymentStatus.PAID,
          providerRef: `manual_${invoice.id}_${Date.now()}`,
          paidAt: new Date(),
          note: parsed.data.note ?? "Marked paid manually by admin",
          reviewedAt: new Date(),
          reviewedById: session.sub,
          reviewNote: "Marked paid directly by admin",
        },
      }),
    ]);

    return NextResponse.json({ message: "Manual payment marked successfully" });
  } catch (error) {
    console.error("Manual payment error", error);
    return NextResponse.json({ message: "Failed to mark manual payment" }, { status: 500 });
  }
}
