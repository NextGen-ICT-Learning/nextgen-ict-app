"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    const payload = (await response.json()) as {
      message?: string;
      role?: "ADMIN" | "CONTENT_EDITOR" | "STUDENT";
    };

    setIsLoading(false);

    if (!response.ok) {
      setError(payload.message ?? "Unable to login");
      return;
    }

    if (payload.role === "ADMIN") {
      router.push("/admin");
    } else if (payload.role === "CONTENT_EDITOR") {
      router.push("/admin/content");
    } else {
      router.push("/portal");
    }

    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-line bg-surface p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
        Student Login
      </p>
      <h1 className="mt-3 text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">
        Log in to check your classes, payment status and receipts.
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

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Enter password"
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isLoading ? "Logging in..." : "Login to Portal"}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-sm text-muted">
        <p>
          No account yet?{" "}
          <Link href="/portal/signup" className="font-semibold text-primary">
            Create account
          </Link>
        </p>
        <p>
          Forgot password?{" "}
          <Link href="/portal/forgot-password" className="font-semibold text-primary">
            Reset it here
          </Link>
        </p>
        <p>
          Admin user?{" "}
          <Link href="/admin/login" className="font-semibold text-primary">
            Login from admin panel
          </Link>
        </p>
      </div>
    </div>
  );
}
