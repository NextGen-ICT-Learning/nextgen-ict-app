import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto my-10 w-[min(900px,calc(100%-2rem))] rounded-3xl border border-line bg-surface p-6 md:p-8">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted">Last updated: March 6, 2026</p>

      <section className="mt-6 space-y-3 text-sm text-muted">
        <p>
          NextGenICT stores student profile and payment data only for admission, class support,
          and billing operations.
        </p>
        <p>
          We do not sell personal data. Sensitive payment processing is handled via trusted
          gateway providers such as Stripe.
        </p>
        <p>
          Students and guardians can request profile correction by contacting our support team.
        </p>
      </section>

      <Link href="/" className="mt-8 inline-flex text-sm font-semibold text-primary hover:underline">
        Back to homepage
      </Link>
    </main>
  );
}
