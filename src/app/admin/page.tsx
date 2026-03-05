import { InvoiceStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { requireAdminSession } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { MarkManualPaidButton } from "@/components/mark-manual-paid-button";
import { ReviewManualPaymentButton } from "@/components/review-manual-payment-button";
import { GenerateInvoicesButton } from "@/components/generate-invoices-button";
import { canInvoiceBeMarkedPaid, syncOpenInvoiceStatuses } from "@/lib/invoice-lifecycle";

function formatCurrency(amount: number) {
  return `BDT ${amount.toLocaleString("en-US")}`;
}

export default async function AdminDashboard() {
  await requireAdminSession();
  await syncOpenInvoiceStatuses();

  const [students, invoices, payments, loginActivities, pendingManualPayments] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.invoice.findMany({
      include: {
        student: true,
      },
      orderBy: { dueDate: "asc" },
    }),
    db.payment.findMany({
      include: {
        student: true,
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    db.loginActivity.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.payment.findMany({
      where: {
        method: PaymentMethod.MANUAL,
        status: PaymentStatus.PENDING,
      },
      include: {
        student: true,
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const dueCount = invoices.filter((invoice) => invoice.status === InvoiceStatus.DUE).length;
  const overdueCount = invoices.filter((invoice) => invoice.status === InvoiceStatus.OVERDUE).length;
  const paidTotal = payments
    .filter((payment) => payment.status === PaymentStatus.PAID)
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-lg font-bold">Billing maintenance</h2>
        <p className="mt-1 text-sm text-muted">
          Ensure every student has current and next-month invoices with updated due states.
        </p>
        <div className="mt-4">
          <GenerateInvoicesButton />
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-4">
        <article className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">Total students</p>
          <p className="mt-2 text-3xl font-bold">{students}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">Due invoices</p>
          <p className="mt-2 text-3xl font-bold text-warning">{dueCount}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">Overdue invoices</p>
          <p className="mt-2 text-3xl font-bold text-danger">{overdueCount}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">Collected</p>
          <p className="mt-2 text-3xl font-bold text-success">{formatCurrency(paidTotal)}</p>
        </article>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-6 md:p-8">
        <h2 className="text-2xl font-bold">Manual payment review queue</h2>
        <p className="mt-1 text-sm text-muted">Approve or reject student-submitted receipt uploads.</p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="border-b border-line px-4 py-3 font-semibold">Date</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Student</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Invoice</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Amount</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Receipt</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingManualPayments.length > 0 ? (
                pendingManualPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="border-b border-line/70 px-4 py-4">
                      {new Date(payment.createdAt).toLocaleString()}
                    </td>
                    <td className="border-b border-line/70 px-4 py-4 font-semibold">
                      {payment.student.fullName}
                    </td>
                    <td className="border-b border-line/70 px-4 py-4">
                      {payment.invoice?.monthLabel ?? "-"}
                    </td>
                    <td className="border-b border-line/70 px-4 py-4">{formatCurrency(payment.amount)}</td>
                    <td className="border-b border-line/70 px-4 py-4">
                      {payment.receiptUrl ? (
                        <a
                          href={payment.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline"
                        >
                          View receipt
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border-b border-line/70 px-4 py-4">
                      <div className="flex items-center gap-2">
                        <ReviewManualPaymentButton paymentId={payment.id} action="approve" />
                        <ReviewManualPaymentButton paymentId={payment.id} action="reject" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-4 text-sm text-muted" colSpan={6}>
                    No pending manual submissions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-6 md:p-8">
        <h2 className="text-2xl font-bold">Student invoices</h2>
        <p className="mt-1 text-sm text-muted">Admin view of due and paid months.</p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="border-b border-line px-4 py-3 font-semibold">Student</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Email</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Month</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Amount</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Status</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="border-b border-line/70 px-4 py-4 font-semibold">
                    {invoice.student.fullName}
                  </td>
                  <td className="border-b border-line/70 px-4 py-4">{invoice.student.email}</td>
                  <td className="border-b border-line/70 px-4 py-4">{invoice.monthLabel}</td>
                  <td className="border-b border-line/70 px-4 py-4">{formatCurrency(invoice.amount)}</td>
                  <td className="border-b border-line/70 px-4 py-4">{invoice.status}</td>
                  <td className="border-b border-line/70 px-4 py-4">
                    {canInvoiceBeMarkedPaid(invoice.status) ? (
                      <MarkManualPaidButton invoiceId={invoice.id} />
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-6 md:p-8">
        <h2 className="text-2xl font-bold">Recent payment activity</h2>
        <p className="mt-1 text-sm text-muted">Stripe and manual transactions.</p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="border-b border-line px-4 py-3 font-semibold">Date</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Student</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Month</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Method</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Amount</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="border-b border-line/70 px-4 py-4">
                    {new Date(payment.createdAt).toLocaleString()}
                  </td>
                  <td className="border-b border-line/70 px-4 py-4 font-semibold">
                    {payment.student.fullName}
                  </td>
                  <td className="border-b border-line/70 px-4 py-4">
                    {payment.invoice?.monthLabel ?? "-"}
                  </td>
                  <td className="border-b border-line/70 px-4 py-4">{payment.method}</td>
                  <td className="border-b border-line/70 px-4 py-4">{formatCurrency(payment.amount)}</td>
                  <td className="border-b border-line/70 px-4 py-4">{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-6 md:p-8">
        <h2 className="text-2xl font-bold">Login activity audit</h2>
        <p className="mt-1 text-sm text-muted">Successful and failed login attempts.</p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="border-b border-line px-4 py-3 font-semibold">Date</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Email</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Role</th>
                <th className="border-b border-line px-4 py-3 font-semibold">IP</th>
                <th className="border-b border-line px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loginActivities.map((activity) => (
                <tr key={activity.id}>
                  <td className="border-b border-line/70 px-4 py-4">
                    {new Date(activity.createdAt).toLocaleString()}
                  </td>
                  <td className="border-b border-line/70 px-4 py-4 font-semibold">
                    {activity.email}
                  </td>
                  <td className="border-b border-line/70 px-4 py-4">
                    {activity.role ?? activity.user?.role ?? "-"}
                  </td>
                  <td className="border-b border-line/70 px-4 py-4">
                    {activity.ipAddress ?? "-"}
                  </td>
                  <td className="border-b border-line/70 px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        activity.success ? "bg-[#e8f7f1] text-success" : "bg-[#fef1f1] text-danger"
                      }`}
                    >
                      {activity.success ? "Success" : "Failed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
