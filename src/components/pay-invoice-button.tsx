"use client";

import { useState } from "react";

type PayInvoiceButtonProps = {
  invoiceId: string;
  amount: number;
};

export function PayInvoiceButton({ invoiceId, amount }: PayInvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoiceId }),
      });

      const payload = (await response.json()) as { message?: string; url?: string };

      if (!response.ok || !payload.url) {
        setError(payload.message ?? "Unable to create payment session");
        return;
      }

      window.location.href = payload.url;
    } catch {
      setError("Payment request failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handlePayment}
        disabled={isLoading}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isLoading ? "Redirecting..." : `Pay BDT ${amount.toLocaleString()}`}
      </button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
