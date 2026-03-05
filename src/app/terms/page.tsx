import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto my-10 w-[min(900px,calc(100%-2rem))] rounded-3xl border border-line bg-surface p-6 md:p-8">
      <h1 className="text-3xl font-bold">Terms and Conditions</h1>
      <p className="mt-3 text-sm text-muted">Last updated: March 6, 2026</p>

      <section className="mt-6 space-y-3 text-sm text-muted">
        <p>
          By enrolling at NextGenICT, students and guardians agree to follow class discipline,
          attendance standards and payment deadlines.
        </p>
        <p>
          Access to digital portal features may be restricted for prolonged unpaid dues,
          except for essential billing visibility.
        </p>
        <p>
          Course materials are provided for enrolled learners only and may not be redistributed
          without written permission.
        </p>
      </section>

      <Link href="/" className="mt-8 inline-flex text-sm font-semibold text-primary hover:underline">
        Back to homepage
      </Link>
    </main>
  );
}
