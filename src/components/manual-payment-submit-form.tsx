"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ManualPaymentSubmitFormProps = {
  invoiceId: string | null;
  amount?: number;
};

export function ManualPaymentSubmitForm({ invoiceId, amount }: ManualPaymentSubmitFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!invoiceId) {
      setError("No open invoice found for manual payment.");
      setMessage(null);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("invoiceId", invoiceId);

    try {
      setIsSubmitting(true);
      setError(null);
      setMessage(null);

      const response = await fetch("/api/portal/manual-payment", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Failed to submit manual payment");
        return;
      }

      setMessage(payload.message ?? "Manual payment submitted successfully.");
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setError("Network error while submitting manual payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <input type="hidden" name="invoiceId" value={invoiceId ?? ""} />

      <div className="rounded-xl border border-line bg-surface-muted px-3 py-2 text-xs text-muted">
        {invoiceId
          ? `Submit receipt for ${amount ? `BDT ${amount.toLocaleString("en-US")}` : "current invoice"}.`
          : "No due invoice available for manual submission."}
      </div>

      <div className="space-y-1">
        <label htmlFor="receipt" className="text-xs font-semibold text-muted">
          Receipt (JPG/PNG/WEBP/PDF, max 5MB)
        </label>
        <input
          id="receipt"
          name="receipt"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          required={Boolean(invoiceId)}
          disabled={!invoiceId || isSubmitting}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="note" className="text-xs font-semibold text-muted">
          Note (optional)
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          maxLength={400}
          placeholder="Write transaction reference, branch, or sender details"
          disabled={!invoiceId || isSubmitting}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={!invoiceId || isSubmitting}
        className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-primary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Submitting..." : "Upload Receipt"}
      </button>

      {error ? <p className="text-xs text-danger">{error}</p> : null}
      {message ? <p className="text-xs text-success">{message}</p> : null}
    </form>
  );
}
