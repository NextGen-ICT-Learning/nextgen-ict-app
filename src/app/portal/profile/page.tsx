"use client";

import { useEffect, useState } from "react";

type ProfileUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  program: string | null;
  batch: string | null;
};

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [parentAccessCode, setParentAccessCode] = useState<string>("");
  const [parentAccessUrl, setParentAccessUrl] = useState<string>("");
  const [isUpdatingParentLink, setIsUpdatingParentLink] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setIsLoading(true);
        const [profileResponse, parentAccessResponse] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/profile/parent-access"),
        ]);
        const profilePayload = (await profileResponse.json()) as {
          user?: ProfileUser;
          message?: string;
        };
        const parentPayload = (await parentAccessResponse.json()) as {
          code?: string;
          parentAccessUrl?: string;
        };

        if (!profileResponse.ok || !profilePayload.user) {
          setError(profilePayload.message ?? "Failed to load profile");
          return;
        }

        if (!cancelled) {
          setProfile(profilePayload.user);
          setParentAccessCode(parentPayload.code ?? "");
          setParentAccessUrl(parentPayload.parentAccessUrl ?? "");
        }
      } catch {
        if (!cancelled) {
          setError("Network error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    const formData = new FormData(event.currentTarget);
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          phone: formData.get("phone"),
          guardianName: formData.get("guardianName"),
          guardianPhone: formData.get("guardianPhone"),
          program: formData.get("program"),
          batch: formData.get("batch"),
        }),
      });

      const payload = (await response.json()) as { user?: ProfileUser; message?: string };

      if (!response.ok || !payload.user) {
        setError(payload.message ?? "Failed to update profile");
        return;
      }

      setProfile(payload.user);
      setMessage(payload.message ?? "Profile updated");
    } catch {
      setError("Network error while saving profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRegenerateParentAccess() {
    try {
      setIsUpdatingParentLink(true);
      setError(null);
      setMessage(null);

      const response = await fetch("/api/profile/parent-access", {
        method: "POST",
      });
      const payload = (await response.json()) as {
        code?: string;
        parentAccessUrl?: string;
        message?: string;
      };

      if (!response.ok || !payload.code || !payload.parentAccessUrl) {
        setError(payload.message ?? "Failed to regenerate parent access link");
        return;
      }

      setParentAccessCode(payload.code);
      setParentAccessUrl(payload.parentAccessUrl);
      setMessage(payload.message ?? "Parent access link regenerated");
    } catch {
      setError("Network error while regenerating parent access");
    } finally {
      setIsUpdatingParentLink(false);
    }
  }

  async function handleCopyParentLink() {
    if (!parentAccessUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(parentAccessUrl);
      setMessage("Parent attendance link copied");
      setError(null);
    } catch {
      setError("Could not copy parent link. Please copy manually.");
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted">Loading profile...</p>;
  }

  if (!profile) {
    return <p className="text-sm text-danger">{error ?? "Profile unavailable"}</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-line bg-surface p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
        Student Profile
      </p>
      <h1 className="mt-3 text-3xl font-bold">Profile and guardian details</h1>
      <p className="mt-2 text-sm text-muted">
        Update your contact and academic details used in portal reports.
      </p>

      <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSave}>
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="email" className="text-sm font-semibold">
            Email (read-only)
          </label>
          <input
            id="email"
            value={profile.email}
            readOnly
            className="h-12 w-full rounded-xl border border-line bg-surface-muted px-4"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-semibold">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            defaultValue={profile.fullName}
            required
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-semibold">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={profile.phone ?? ""}
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="guardianName" className="text-sm font-semibold">
            Guardian name
          </label>
          <input
            id="guardianName"
            name="guardianName"
            defaultValue={profile.guardianName ?? ""}
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="guardianPhone" className="text-sm font-semibold">
            Guardian phone
          </label>
          <input
            id="guardianPhone"
            name="guardianPhone"
            defaultValue={profile.guardianPhone ?? ""}
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="program" className="text-sm font-semibold">
            Program
          </label>
          <input
            id="program"
            name="program"
            defaultValue={profile.program ?? ""}
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="batch" className="text-sm font-semibold">
            Batch
          </label>
          <input
            id="batch"
            name="batch"
            defaultValue={profile.batch ?? ""}
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="parentAccessCode" className="text-sm font-semibold">
            Parent attendance access code
          </label>
          <input
            id="parentAccessCode"
            value={parentAccessCode}
            readOnly
            className="h-12 w-full rounded-xl border border-line bg-surface-muted px-4"
          />
          <p className="text-xs text-muted">Share the link below with guardian to track live class attendance.</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="parentAccessUrl" className="text-sm font-semibold">
            Parent attendance link
          </label>
          <input
            id="parentAccessUrl"
            value={parentAccessUrl}
            readOnly
            className="h-12 w-full rounded-xl border border-line bg-surface-muted px-4"
          />
        </div>

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button
            type="button"
            onClick={handleCopyParentLink}
            className="rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-primary"
          >
            Copy Parent Link
          </button>
          <button
            type="button"
            onClick={handleRegenerateParentAccess}
            disabled={isUpdatingParentLink}
            className="rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isUpdatingParentLink ? "Regenerating..." : "Regenerate Parent Link"}
          </button>
        </div>

        {message ? <p className="text-sm text-success md:col-span-2">{message}</p> : null}
        {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSaving}
            className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-70"
          >
            {isSaving ? "Saving profile..." : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
