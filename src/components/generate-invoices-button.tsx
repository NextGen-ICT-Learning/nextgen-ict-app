"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type GenerateResponse = {
  message?: string;
  stats?: {
    students: number;
    invoicesCreated: number;
    statusesUpdated: number;
  };
};

export function GenerateInvoicesButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      const response = await fetch("/api/admin/invoices/generate", {
        method: "POST",
      });

      const payload = (await response.json()) as GenerateResponse;

      if (!response.ok) {
        setError(payload.message ?? "Failed to generate invoices");
        return;
      }

      if (payload.stats) {
        setMessage(
          `Synced ${payload.stats.students} students, created ${payload.stats.invoicesCreated} invoices, updated ${payload.stats.statusesUpdated} statuses.`,
        );
      } else {
        setMessage(payload.message ?? "Invoice generation complete");
      }

      router.refresh();
    } catch {
      setError("Network error while generating invoices");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading}
        className="rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-primary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Running..." : "Generate Current + Next Invoices"}
      </button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      {message ? <p className="text-xs text-success">{message}</p> : null}
    </div>
  );
}
