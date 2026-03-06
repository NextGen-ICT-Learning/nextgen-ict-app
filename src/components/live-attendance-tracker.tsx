"use client";

import { useEffect, useRef, useState } from "react";

type LiveAttendanceTrackerProps = {
  classId: string;
  sessionId: string;
};

type AttendanceState = "idle" | "joining" | "tracking" | "error";

export function LiveAttendanceTracker({ classId, sessionId }: LiveAttendanceTrackerProps) {
  const [state, setState] = useState<AttendanceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function sendAction(action: "join" | "heartbeat" | "leave", silent = false) {
      try {
        const response = await fetch(`/api/classes/${classId}/live-attendance`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ action, sessionId }),
          keepalive: action === "leave",
        });

        if (!response.ok && !silent) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          setError(payload.message ?? "Failed to track attendance");
          setState("error");
          return false;
        }

        return true;
      } catch {
        if (!silent) {
          setError("Network issue while tracking attendance");
          setState("error");
        }
        return false;
      }
    }

    async function startTracking() {
      setState("joining");
      setError(null);

      const joined = await sendAction("join");
      if (!joined || cancelled) {
        return;
      }

      setState("tracking");
      intervalRef.current = window.setInterval(() => {
        void sendAction("heartbeat", true);
      }, 45000);
    }

    void startTracking();

    const handlePageHide = () => {
      navigator.sendBeacon(
        `/api/classes/${classId}/live-attendance`,
        JSON.stringify({ action: "leave", sessionId }),
      );
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      cancelled = true;
      window.removeEventListener("pagehide", handlePageHide);

      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }

      void sendAction("leave", true);
    };
  }, [classId, sessionId]);

  if (state === "error") {
    return <p className="text-sm text-danger">{error}</p>;
  }

  if (state === "joining") {
    return <p className="text-sm text-muted">Joining live session and starting attendance tracking...</p>;
  }

  if (state === "tracking") {
    return (
      <p className="text-sm text-success">
        Attendance tracking is active. Stay in this page during class so your attendance is recorded.
      </p>
    );
  }

  return <p className="text-sm text-muted">Preparing attendance tracker...</p>;
}

