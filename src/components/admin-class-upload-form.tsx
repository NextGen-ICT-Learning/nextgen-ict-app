"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UploadResponse = {
  message?: string;
  class?: {
    id: string;
    title: string;
    classCode: string;
  };
};

export function AdminClassUploadForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/admin/classes", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as UploadResponse;

      if (!response.ok) {
        setError(payload.message ?? "Failed to upload class");
        return;
      }

      const classCode = payload.class?.classCode ? ` (${payload.class.classCode})` : "";
      setSuccess(`${payload.message ?? "Class uploaded"}${classCode}`);
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setError("Network error while uploading class");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-5">
      <div>
        <h2 className="text-xl font-bold">Upload New Class</h2>
        <p className="mt-1 text-sm text-muted">
          Upload a recorded class (video/image). A unique class code will be generated automatically.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
            placeholder="Hardware & Networking Basics"
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="media" className="text-sm font-semibold">
            Upload media (image/video/pdf, default limit 200MB)
          </label>
          <input
            id="media"
            name="media"
            type="file"
            required
            accept="image/*,video/*,.pdf,application/pdf"
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-semibold">
          Class description
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={12}
          maxLength={2000}
          rows={4}
          placeholder="Explain what students will learn in this class and expected outcomes."
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Uploading..." : "Upload Class"}
      </button>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}
    </form>
  );
}
