"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type LiveClassRoomProps = {
  classTitle: string;
  sessionTitle: string;
  meetingRoom: string;
  whiteboardUrl: string;
  displayName: string;
  email: string;
  jitsiDomain: string;
};

type JitsiApiInstance = {
  dispose: () => void;
};

type JitsiApiConstructor = new (
  domain: string,
  options: {
    roomName: string;
    parentNode: HTMLElement;
    width: string;
    height: string;
    userInfo: {
      displayName: string;
      email: string;
    };
    configOverwrite?: Record<string, unknown>;
    interfaceConfigOverwrite?: Record<string, unknown>;
  },
) => JitsiApiInstance;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiApiConstructor;
  }
}

function loadJitsiApiScript(domain: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    if (window.JitsiMeetExternalAPI) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[data-jitsi-domain="${domain}"]`);

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Jitsi script failed to load")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.dataset.jitsiDomain = domain;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Jitsi script failed to load"));
    document.body.appendChild(script);
  });
}

export function LiveClassRoom({
  classTitle,
  sessionTitle,
  meetingRoom,
  whiteboardUrl,
  displayName,
  email,
  jitsiDomain,
}: LiveClassRoomProps) {
  const jitsiContainerRef = useRef<HTMLDivElement | null>(null);
  const jitsiApiRef = useRef<JitsiApiInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"video" | "whiteboard" | "split">("split");

  useEffect(() => {
    let cancelled = false;

    async function mountJitsi() {
      try {
        setLoadError(null);
        setIsReady(false);
        await loadJitsiApiScript(jitsiDomain);

        if (cancelled || !jitsiContainerRef.current || !window.JitsiMeetExternalAPI) {
          return;
        }

        const api = new window.JitsiMeetExternalAPI(jitsiDomain, {
          roomName: meetingRoom,
          parentNode: jitsiContainerRef.current,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName,
            email,
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_POWERED_BY: false,
            MOBILE_APP_PROMO: false,
            DEFAULT_BACKGROUND: "#f8fbff",
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "chat",
              "raisehand",
              "participants-pane",
              "tileview",
              "settings",
            ],
          },
        });

        jitsiApiRef.current = api;
        setIsReady(true);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load live meeting. Please refresh and retry.";
        setLoadError(message);
      }
    }

    mountJitsi();

    return () => {
      cancelled = true;
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [displayName, email, jitsiDomain, meetingRoom]);

  const panelClassName = useMemo(() => {
    if (viewMode === "split") {
      return "grid gap-4 lg:grid-cols-2";
    }
    return "grid gap-4";
  }, [viewMode]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Live Class Room</p>
        <h1 className="mt-2 text-2xl font-bold">{sessionTitle}</h1>
        <p className="mt-1 text-sm text-muted">{classTitle}</p>
        <p className="mt-3 text-sm text-muted">
          Use the meeting toolbar for video, mic, and <span className="font-semibold">screen share</span>. Use the
          whiteboard panel for drawing and explanations.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setViewMode("video")}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              viewMode === "video" ? "border-primary text-primary" : "border-line hover:border-primary"
            }`}
          >
            Video Focus
          </button>
          <button
            type="button"
            onClick={() => setViewMode("whiteboard")}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              viewMode === "whiteboard" ? "border-primary text-primary" : "border-line hover:border-primary"
            }`}
          >
            Whiteboard Focus
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              viewMode === "split" ? "border-primary text-primary" : "border-line hover:border-primary"
            }`}
          >
            Split View
          </button>
          <a
            href={whiteboardUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-primary"
          >
            Open Whiteboard in New Tab
          </a>
        </div>
      </div>

      {loadError ? (
        <article className="rounded-2xl border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
          {loadError}
        </article>
      ) : null}

      {!isReady ? (
        <article className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
          Loading live meeting room...
        </article>
      ) : null}

      <div className={panelClassName}>
        <div className={`overflow-hidden rounded-2xl border border-line bg-black ${viewMode === "whiteboard" ? "hidden" : ""}`}>
          <div ref={jitsiContainerRef} className="h-[520px] w-full" />
        </div>

        {viewMode !== "video" ? (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <iframe
              title="Live class whiteboard"
              src={whiteboardUrl}
              className="h-[520px] w-full border-0"
              allow="clipboard-write; fullscreen"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
