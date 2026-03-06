"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ClassChannelPostFormProps = {
  classId: string;
};

type PostResponse = {
  message?: string;
};

export function ClassChannelPostForm({ classId }: ClassChannelPostFormProps) {
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

      const response = await fetch(`/api/classes/${classId}/posts`, {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as PostResponse;

      if (!response.ok) {
        setError(payload.message ?? "Failed to publish post");
        return;
      }

      setSuccess(payload.message ?? "Post published");
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setError("Network error while posting");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-xl font-bold">Post Update to Class Channel</h2>
      <p className="text-sm text-muted">Share announcements, study materials, videos, images, or PDFs.</p>

      <textarea
        name="message"
        rows={3}
        maxLength={2000}
        placeholder="Write update message for students..."
        className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
      />

      <div className="space-y-1">
        <label htmlFor="media" className="text-sm font-semibold">
          Optional attachment (image/video/pdf)
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
        disabled={isSubmitting}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Publishing..." : "Publish Post"}
      </button>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}
    </form>
  );
}
