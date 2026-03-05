"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setIsLoading(true);
    setError(null);
    setMessage(null);
    setDevResetUrl(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        resetUrl?: string;
      };

      if (!response.ok) {
        setError(payload.message ?? "Failed to send reset request");
        return;
      }

      setMessage(payload.message ?? "Password reset request accepted");
      if (payload.resetUrl) {
        setDevResetUrl(payload.resetUrl);
      }
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-line bg-surface p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
        Password Recovery
      </p>
      <h1 className="mt-3 text-3xl font-bold">Forgot your password?</h1>
      <p className="mt-2 text-sm text-muted">
        Enter your account email. We will generate a reset link.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="student@email.com"
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

        {message ? <p className="text-sm text-success">{message}</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}

        {devResetUrl ? (
          <p className="text-sm text-primary">
            Dev reset link: <a href={devResetUrl} className="underline">{devResetUrl}</a>
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-70"
        >
          {isLoading ? "Submitting..." : "Send reset request"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Back to{" "}
        <Link href="/portal/login" className="font-semibold text-primary">
          student login
        </Link>
      </p>
    </div>
  );
}
