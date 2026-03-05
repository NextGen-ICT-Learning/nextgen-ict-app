import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  ensureCurrentAndNextInvoicesForAllStudents,
  syncOpenInvoiceStatuses,
} from "@/lib/invoice-lifecycle";

export async function POST() {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [{ students, created }, updatedStatuses] = await Promise.all([
      ensureCurrentAndNextInvoicesForAllStudents(),
      syncOpenInvoiceStatuses(),
    ]);

    return NextResponse.json({
      message: "Invoice generation completed",
      stats: {
        students,
        invoicesCreated: created,
        statusesUpdated: updatedStatuses,
      },
    });
  } catch (error) {
    console.error("Invoice generation error", error);
    return NextResponse.json({ message: "Failed to generate invoices" }, { status: 500 });
  }
}
