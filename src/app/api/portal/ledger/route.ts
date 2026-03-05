import { InvoiceStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { refreshInvoiceStateForStudent } from "@/lib/invoice-lifecycle";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await refreshInvoiceStateForStudent(session.sub);

    const invoices = await db.invoice.findMany({
      where: { studentId: session.sub },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const summary = {
      totalInvoices: invoices.length,
      paid: invoices.filter((invoice) => invoice.status === InvoiceStatus.PAID).length,
      open: invoices.filter(
        (invoice) =>
          invoice.status === InvoiceStatus.DUE ||
          invoice.status === InvoiceStatus.PENDING ||
          invoice.status === InvoiceStatus.OVERDUE,
      ).length,
      overdue: invoices.filter((invoice) => invoice.status === InvoiceStatus.OVERDUE).length,
    };

    return NextResponse.json({
      summary,
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        monthLabel: invoice.monthLabel,
        amount: invoice.amount,
        currency: invoice.currency,
        status: invoice.status,
        dueDate: invoice.dueDate,
        latestPayment: invoice.payments[0]
          ? {
              id: invoice.payments[0].id,
              method: invoice.payments[0].method,
              status: invoice.payments[0].status,
              createdAt: invoice.payments[0].createdAt,
              note: invoice.payments[0].note,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Ledger API error", error);
    return NextResponse.json({ message: "Failed to load ledger" }, { status: 500 });
  }
}
