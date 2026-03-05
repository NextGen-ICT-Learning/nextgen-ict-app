import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  FileText,
} from "lucide-react";
import { InvoiceStatus, PaymentMethod } from "@prisma/client";
import { db } from "@/lib/db";
import { requireStudentSession } from "@/lib/auth-guards";
import { PayInvoiceButton } from "@/components/pay-invoice-button";
import { ManualPaymentSubmitForm } from "@/components/manual-payment-submit-form";
import { refreshInvoiceStateForStudent } from "@/lib/invoice-lifecycle";

const statusClass: Record<InvoiceStatus, string> = {
  PAID: "bg-[#e8f7f1] text-success",
  DUE: "bg-[#fff3df] text-warning",
  PENDING: "bg-[#eaf1fb] text-primary",
  OVERDUE: "bg-[#fef1f1] text-danger",
  WAIVED: "bg-[#f3f4f6] text-muted",
};

const statusLabel: Record<InvoiceStatus, string> = {
  PAID: "Paid",
  DUE: "Due",
  PENDING: "Pending",
  OVERDUE: "Overdue",
  WAIVED: "Waived",
};

function formatCurrency(amount: number) {
  return `BDT ${amount.toLocaleString("en-US")}`;
}

function methodLabel(method?: PaymentMethod) {
  if (method === PaymentMethod.STRIPE) return "Online Gateway";
  if (method === PaymentMethod.MANUAL) return "Manual Payment";
  return "Pending";
}

export default async function PortalDashboard() {
  const session = await requireStudentSession();
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

  const timeline = await db.payment.findMany({
    where: { studentId: session.sub },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const dueInvoice =
    invoices.find(
      (entry) => entry.status === InvoiceStatus.DUE || entry.status === InvoiceStatus.OVERDUE,
    ) ??
    invoices.find(
      (entry) => entry.status !== InvoiceStatus.PAID && entry.status !== InvoiceStatus.WAIVED,
    ) ??
    null;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-line bg-surface p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              Student Account
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">Hi, {session.fullName}</h1>
            <p className="mt-2 text-muted">Email: {session.email}</p>
          </div>

          <div className="rounded-2xl border border-line bg-surface-muted px-5 py-4">
            <p className="text-sm text-muted">Next payment deadline</p>
            <p className="mt-1 text-xl font-bold">
              {dueInvoice ? new Date(dueInvoice.dueDate).toLocaleDateString() : "No due invoice"}
            </p>
            <p className="mt-1 text-sm text-warning">
              {dueInvoice ? `${formatCurrency(dueInvoice.amount)} pending` : "All clear"}
            </p>
          </div>
        </div>
      </section>

      <section id="payments" className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-line bg-surface p-6">
          <p className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecf5fb] text-primary">
            <CreditCard size={18} />
          </p>
          <h2 className="mt-4 text-xl font-bold">Pay Online (Stripe)</h2>
          <p className="mt-2 text-sm text-muted">
            Complete your due invoice through Stripe checkout.
          </p>
          {dueInvoice ? (
            <PayInvoiceButton invoiceId={dueInvoice.id} amount={dueInvoice.amount} />
          ) : (
            <p className="mt-5 text-sm font-semibold text-success">No dues right now.</p>
          )}
        </article>

        <article className="rounded-2xl border border-line bg-surface p-6">
          <p className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff2ed] text-accent">
            <Banknote size={18} />
          </p>
          <h2 className="mt-4 text-xl font-bold">Manual Payment Update</h2>
          <p className="mt-2 text-sm text-muted">
            Upload your transfer receipt and wait for admin approval.
          </p>
          <ManualPaymentSubmitForm invoiceId={dueInvoice?.id ?? null} amount={dueInvoice?.amount} />
        </article>

        <article className="rounded-2xl border border-line bg-surface p-6">
          <p className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fef1f1] text-danger">
            <CircleAlert size={18} />
          </p>
          <h2 className="mt-4 text-xl font-bold">Current Due</h2>
          <p className="mt-2 text-sm text-muted">
            {dueInvoice ? `${dueInvoice.monthLabel} is not cleared yet.` : "No pending due."}
          </p>
          <p className="mt-5 text-3xl font-bold">
            {dueInvoice ? formatCurrency(dueInvoice.amount) : "BDT 0"}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Monthly payment ledger</h2>
            <p className="mt-1 text-sm text-muted">
              Unified record of online and manual payment updates.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold"
          >
            <FileText size={16} /> Export Statement (Soon)
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="border-b border-line px-4 py-3 font-semibold">Month</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Amount</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Method</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Invoice</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((entry) => (
                <tr key={entry.id}>
                  <td className="border-b border-line/70 px-4 py-4 font-semibold">{entry.monthLabel}</td>
                  <td className="border-b border-line/70 px-4 py-4">{formatCurrency(entry.amount)}</td>
                  <td className="border-b border-line/70 px-4 py-4">
                    {methodLabel(entry.payments[0]?.method)}
                  </td>
                  <td className="border-b border-line/70 px-4 py-4">{entry.id.slice(0, 10)}</td>
                  <td className="border-b border-line/70 px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass[entry.status]}`}
                    >
                      {statusLabel[entry.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="text-lg font-bold">Payment timeline</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {timeline.length > 0 ? (
              timeline.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 text-success" />
                  <div>
                    <p className="font-semibold">
                      {entry.method === PaymentMethod.STRIPE ? "Stripe" : "Manual"} - {entry.status}
                    </p>
                    <p className="text-muted">
                      {new Date(entry.createdAt).toLocaleString()} | {formatCurrency(entry.amount)}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className="flex items-start gap-3">
                <CalendarClock size={18} className="mt-0.5 text-warning" />
                <div>
                  <p className="font-semibold">No payments yet</p>
                  <p className="text-muted">Your payment updates will appear here.</p>
                </div>
              </li>
            )}
          </ul>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="text-lg font-bold">Support contact</h3>
          <p className="mt-2 text-sm text-muted">
            Need billing help? Reach center admin quickly.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p>Phone: +880 1700-000000</p>
            <p>Email: billing@nextgenict.edu.bd</p>
            <p>Hours: Sat-Thu, 10:00 AM - 8:00 PM</p>
          </div>
        </article>
      </section>
    </div>
  );
}
