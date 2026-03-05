import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="mx-auto my-10 w-[min(900px,calc(100%-2rem))] rounded-3xl border border-line bg-surface p-6 md:p-8">
      <h1 className="text-3xl font-bold">Refund Policy</h1>
      <p className="mt-3 text-sm text-muted">Last updated: March 6, 2026</p>

      <section className="mt-6 space-y-3 text-sm text-muted">
        <p>
          Monthly coaching fees are typically non-refundable once a billing cycle has started
          and classes/resources are made available.
        </p>
        <p>
          Duplicate payment or technical billing errors are eligible for adjustment or refund
          after verification by admin.
        </p>
        <p>
          For manual payment disputes, students must submit receipt proof within 7 days of payment.
        </p>
      </section>

      <Link href="/" className="mt-8 inline-flex text-sm font-semibold text-primary hover:underline">
        Back to homepage
      </Link>
    </main>
  );
}
