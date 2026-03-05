import { InvoiceStatus } from "@prisma/client";

export function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function buildStarterInvoices(studentId: string, monthlyAmount = 4500) {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 28, 12, 0, 0, 0);
  const nextMonth = addMonths(currentMonth, 1);

  return [
    {
      studentId,
      monthLabel: getMonthLabel(currentMonth),
      amount: monthlyAmount,
      currency: "BDT",
      dueDate: currentMonth,
      status: InvoiceStatus.DUE,
    },
    {
      studentId,
      monthLabel: getMonthLabel(nextMonth),
      amount: monthlyAmount,
      currency: "BDT",
      dueDate: nextMonth,
      status: InvoiceStatus.PENDING,
    },
  ];
}
