"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LiveSessionSummary = {
  id: string;
  title: string;
  meetingRoom: string;
  status: "SCHEDULED" | "LIVE" | "ENDED";
  startedAt: string | Date | null;
  whiteboardUrl: string;
};

type ActionResponse = {
  message?: string;
  liveSession?: LiveSessionSummary;
};

type AdminLiveClassControlsProps = {
  classId: string;
  activeSession: LiveSessionSummary | null;
};

export function AdminLiveClassControls({ classId, activeSession }: AdminLiveClassControlsProps) {
  const router = useRouter();
  const [sessionTitle, setSessionTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const startLiveSession = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/classes/${classId}/live-session`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          action: "start",
          title: sessionTitle.trim() || undefined,
        }),
      });

      const payload = (await response.json()) as ActionResponse;

      if (!response.ok) {
        setError(payload.message ?? "Failed to start live class");
        return;
      }

      setSessionTitle("");
      setSuccess(payload.message ?? "Live class started");
      router.refresh();
    } catch {
      setError("Network error while starting live class");
    } finally {
      setIsSubmitting(false);
    }
  };

  const endLiveSession = async () => {
    if (!activeSession) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/classes/${classId}/live-session`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          action: "end",
          sessionId: activeSession.id,
        }),
      });

      const payload = (await response.json()) as ActionResponse;

      if (!response.ok) {
        setError(payload.message ?? "Failed to end live class");
        return;
      }

      setSuccess(payload.message ?? "Live class ended");
      router.refresh();
    } catch {
      setError("Network error while ending live class");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
      <h2 className="text-xl font-bold">Live Class Studio</h2>
      <p className="mt-1 text-sm text-muted">
        Run live video classes with screen-sharing and use whiteboard for drawing explanations.
      </p>

      {activeSession ? (
        <div className="mt-4 space-y-3 rounded-xl border border-success/30 bg-success/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-success">Live now</p>
          <p className="text-lg font-bold">{activeSession.title}</p>
          <p className="text-sm text-muted">Room: {activeSession.meetingRoom}</p>
          <p className="text-sm text-muted">
            Started: {activeSession.startedAt ? new Date(activeSession.startedAt).toLocaleString() : "Just now"}
          </p>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/classes/${classId}/live`}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-strong"
            >
              Open Live Room
            </Link>
            <a
              href={activeSession.whiteboardUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-primary"
            >
              Open Whiteboard
            </a>
            <button
              type="button"
              onClick={endLiveSession}
              disabled={isSubmitting}
              className="rounded-lg border border-danger px-3 py-2 text-sm font-semibold text-danger hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              End Live Session
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3 rounded-xl border border-line bg-surface-muted p-4">
          <label htmlFor="sessionTitle" className="text-sm font-semibold">
            Session title (optional)
          </label>
          <input
            id="sessionTitle"
            value={sessionTitle}
            onChange={(event) => setSessionTitle(event.target.value)}
            placeholder="ICT Live Problem Solving Class"
            maxLength={120}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={startLiveSession}
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Starting..." : "Start Live Class"}
          </button>
        </div>
      )}

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-success">{success}</p> : null}
    </section>
  );
}
