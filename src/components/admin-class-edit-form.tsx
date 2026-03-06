"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminClassEditFormProps = {
  classId: string;
  initialTitle: string;
  initialDescription: string;
  initialClassCode: string;
};

type UpdateResponse = {
  message?: string;
};

export function AdminClassEditForm({
  classId,
  initialTitle,
  initialDescription,
  initialClassCode,
}: AdminClassEditFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: "PATCH",
        body: formData,
      });

      const payload = (await response.json()) as UpdateResponse;

      if (!response.ok) {
        setError(payload.message ?? "Failed to update class");
        return;
      }

      setSuccess(payload.message ?? "Class updated");
      router.refresh();
    } catch {
      setError("Network error while updating class");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-3 rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-xl font-bold">Edit Class Details</h2>
      <p className="text-sm text-muted">Update class name, description, code, or replace media.</p>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="title" className="text-sm font-semibold">
            Class title
          </label>
          <input
            id="title"
            name="title"
            required
            minLength={4}
            maxLength={140}
            defaultValue={initialTitle}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="classCode" className="text-sm font-semibold">
            Class code
          </label>
          <input
            id="classCode"
            name="classCode"
            required
            minLength={4}
            maxLength={32}
            defaultValue={initialClassCode}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm uppercase"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-semibold">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={12}
          maxLength={2000}
          defaultValue={initialDescription}
          rows={4}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="media" className="text-sm font-semibold">
          Replace media (optional, image/video/pdf)
        </label>
        <input
          id="media"
          name="media"
          type="file"
          accept="image/*,video/*,.pdf,application/pdf"
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? "Saving..." : "Save Class"}
      </button>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}
    </form>
  );
}
