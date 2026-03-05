import { InvoiceStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { addMonths, getMonthLabel } from "@/lib/invoice";

const DEFAULT_MONTHLY_FEE = 4500;

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function isWaivedOrPaid(status: InvoiceStatus) {
  return status === InvoiceStatus.PAID || status === InvoiceStatus.WAIVED;
}

export function deriveOpenInvoiceStatus(dueDate: Date, now = new Date()): InvoiceStatus {
  const currentMonthEnd = endOfMonth(now);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (dueDate > currentMonthEnd) {
    return InvoiceStatus.PENDING;
  }

  if (dueDate < todayStart) {
    return InvoiceStatus.OVERDUE;
  }

  return InvoiceStatus.DUE;
}

export async function syncOpenInvoiceStatuses(studentId?: string) {
  const invoices = await db.invoice.findMany({
    where: {
      ...(studentId ? { studentId } : {}),
      status: {
        in: [InvoiceStatus.DUE, InvoiceStatus.PENDING, InvoiceStatus.OVERDUE],
      },
    },
    select: {
      id: true,
      dueDate: true,
      status: true,
    },
  });

  const updates = invoices
    .map((invoice) => {
      const expected = deriveOpenInvoiceStatus(invoice.dueDate);
      if (expected === invoice.status) {
        return null;
      }

      return db.invoice.update({
        where: { id: invoice.id },
        data: { status: expected },
      });
    })
    .filter((entry): entry is ReturnType<typeof db.invoice.update> => entry !== null);

  if (updates.length > 0) {
    await db.$transaction(updates);
  }

  return updates.length;
}

export async function ensureCurrentAndNextInvoices(studentId: string, monthlyAmount = DEFAULT_MONTHLY_FEE) {
  const now = new Date();
  const currentMonthDue = new Date(now.getFullYear(), now.getMonth(), 28, 12, 0, 0, 0);
  const nextMonthDue = addMonths(currentMonthDue, 1);

  const monthTargets = [currentMonthDue, nextMonthDue].map((dueDate) => ({
    dueDate,
    monthLabel: getMonthLabel(dueDate),
  }));

  const existing = await db.invoice.findMany({
    where: {
      studentId,
      monthLabel: {
        in: monthTargets.map((entry) => entry.monthLabel),
      },
    },
    select: {
      monthLabel: true,
      amount: true,
    },
  });

  const existingLabels = new Set(existing.map((entry) => entry.monthLabel));
  const latestInvoice = await db.invoice.findFirst({
    where: { studentId },
    orderBy: { dueDate: "desc" },
    select: { amount: true },
  });

  const baseAmount = latestInvoice?.amount ?? monthlyAmount;
  const toCreate = monthTargets
    .filter((entry) => !existingLabels.has(entry.monthLabel))
    .map((entry) => ({
      studentId,
      monthLabel: entry.monthLabel,
      amount: baseAmount,
      currency: "BDT",
      dueDate: entry.dueDate,
      status: deriveOpenInvoiceStatus(entry.dueDate),
    }));

  if (toCreate.length > 0) {
    await db.invoice.createMany({
      data: toCreate,
    });
  }

  return toCreate.length;
}

export async function ensureCurrentAndNextInvoicesForAllStudents(monthlyAmount = DEFAULT_MONTHLY_FEE) {
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true },
  });

  let created = 0;
  for (const student of students) {
    created += await ensureCurrentAndNextInvoices(student.id, monthlyAmount);
  }

  return { students: students.length, created };
}

export async function refreshInvoiceStateForStudent(studentId: string) {
  await ensureCurrentAndNextInvoices(studentId);
  const updatedStatuses = await syncOpenInvoiceStatuses(studentId);
  return { updatedStatuses };
}

export function canInvoiceBeMarkedPaid(status: InvoiceStatus) {
  return !isWaivedOrPaid(status);
}

export function statusFromDueDateForFailedManualReview(dueDate: Date) {
  return deriveOpenInvoiceStatus(dueDate);
}

export function currentMonthLabel() {
  return getMonthLabel(startOfMonth(new Date()));
}
