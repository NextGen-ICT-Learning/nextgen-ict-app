"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type JoinResponse = {
  message?: string;
};

export function JoinClassCodeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleJoin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const classCode = formData.get("classCode");

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/portal/classes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classCode }),
      });

      const payload = (await response.json()) as JoinResponse;

      if (!response.ok) {
        setError(payload.message ?? "Failed to join class");
        return;
      }

      setSuccess(payload.message ?? "Joined class successfully");
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setError("Network error while joining class");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="rounded-2xl border border-line bg-surface p-5 md:p-6">
      <h1 className="text-2xl font-bold">Join Class with Code</h1>
      <p className="mt-1 text-sm text-muted">
        Enter the unique class code shared by your mentor/admin.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          name="classCode"
          required
          minLength={4}
          maxLength={32}
          placeholder="ICT-ABC123"
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm uppercase"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Joining..." : "Join Class"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-success">{success}</p> : null}
    </form>
  );
}
