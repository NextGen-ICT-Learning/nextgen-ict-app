"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const tokenFromQuery = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Password and confirm password must match");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: String(formData.get("token") ?? ""),
          password,
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Failed to reset password");
        return;
      }

      setMessage(payload.message ?? "Password reset successful");
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-line bg-surface p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
        Reset Password
      </p>
      <h1 className="mt-3 text-3xl font-bold">Set a new password</h1>
      <p className="mt-2 text-sm text-muted">
        Paste your reset token and choose a strong new password.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="token" className="text-sm font-semibold">
            Reset token
          </label>
          <input
            id="token"
            name="token"
            type="text"
            required
            defaultValue={tokenFromQuery}
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-semibold">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

        {message ? <p className="text-sm text-success">{message}</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-70"
        >
          {isLoading ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Go to{" "}
        <Link href="/portal/login" className="font-semibold text-primary">
          student login
        </Link>
      </p>
    </div>
  );
}
