"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ReviewManualPaymentButtonProps = {
  paymentId: string;
  action: "approve" | "reject";
};

export function ReviewManualPaymentButton({ paymentId, action }: ReviewManualPaymentButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/manual-payment/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          action,
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Failed to review payment");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const label = action === "approve" ? "Approve" : "Reject";
  const colorClass =
    action === "approve"
      ? "border-success text-success hover:bg-[#e8f7f1]"
      : "border-danger text-danger hover:bg-[#fef1f1]";

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleAction}
        disabled={isLoading}
        className={`rounded-lg border px-2 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-70 ${colorClass}`}
      >
        {isLoading ? "Saving..." : label}
      </button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
