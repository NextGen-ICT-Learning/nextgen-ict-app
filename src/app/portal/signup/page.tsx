"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match");
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        password,
      }),
    });

    const payload = (await response.json()) as { message?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(payload.message ?? "Unable to create account");
      return;
    }

    router.push("/portal");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-line bg-surface p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
        Student Registration
      </p>
      <h1 className="mt-3 text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-sm text-muted">
        Join your coaching batch with email and password, then manage monthly
        payment records from your portal.
      </p>

      <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-semibold">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="Student name"
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

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
            minLength={8}
            placeholder="Create password"
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
            placeholder="Repeat password"
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

        {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-75"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already registered?{" "}
        <Link href="/portal/login" className="font-semibold text-primary">
          Login here
        </Link>
      </p>
    </div>
  );
}
