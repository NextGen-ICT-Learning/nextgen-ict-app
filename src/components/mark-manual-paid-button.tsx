"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkManualPaidButton({ invoiceId }: { invoiceId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleMarkPaid = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/manual-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId,
          note: "Manual payment approved by admin",
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Failed to mark payment");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleMarkPaid}
        disabled={isLoading}
        className="rounded-lg border border-line px-2 py-1 text-xs font-semibold hover:border-primary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Saving..." : "Mark Manual Paid"}
      </button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
