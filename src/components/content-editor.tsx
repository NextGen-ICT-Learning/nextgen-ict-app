"use client";

import { useEffect, useMemo, useState } from "react";
import { getHomeContent } from "@/lib/get-home-content";
import type { HomeContent, Locale } from "@/content/home-content";

type RevisionSummary = {
  id: string;
  version: number;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  payload: unknown;
} | null;

type ContentApiResponse = {
  locale: Locale;
  source: "cms" | "fallback";
  fallback: HomeContent;
  draft: RevisionSummary;
  published: RevisionSummary;
  nextVersion: number;
};

export function ContentEditor() {
  const [locale, setLocale] = useState<Locale>("en");
  const [jsonText, setJsonText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    source: "cms" | "fallback";
    draftVersion: number | null;
    publishedVersion: number | null;
    nextVersion: number;
  } | null>(null);

  const defaultFallback = useMemo(() => getHomeContent(locale), [locale]);

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      try {
        const response = await fetch(`/api/admin/content?locale=${locale}`);
        const payload = (await response.json()) as ContentApiResponse | { message?: string };

        if (!response.ok || !("locale" in payload)) {
          setJsonText(JSON.stringify(defaultFallback, null, 2));
          setMeta({
            source: "fallback",
            draftVersion: null,
            publishedVersion: null,
            nextVersion: 1,
          });
          setError("Unable to load CMS data, fallback loaded.");
          return;
        }

        if (cancelled) return;

        const latest =
          payload.draft?.payload ?? payload.published?.payload ?? payload.fallback;

        setJsonText(JSON.stringify(latest, null, 2));
        setMeta({
          source: payload.source,
          draftVersion: payload.draft?.version ?? null,
          publishedVersion: payload.published?.version ?? null,
          nextVersion: payload.nextVersion,
        });
      } catch {
        if (cancelled) return;
        setJsonText(JSON.stringify(defaultFallback, null, 2));
        setMeta({
          source: "fallback",
          draftVersion: null,
          publishedVersion: null,
          nextVersion: 1,
        });
        setError("Failed to load content. Fallback loaded.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, [locale, defaultFallback]);

  const parsePayload = () => {
    try {
      return JSON.parse(jsonText);
    } catch {
      setError("Invalid JSON format");
      return null;
    }
  };

  const runAction = async (action: "saveDraft" | "publish") => {
    const parsed = parsePayload();
    if (!parsed) return;

    setError(null);
    setMessage(null);

    if (action === "saveDraft") setIsSaving(true);
    if (action === "publish") setIsPublishing(true);

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          locale,
          payload: parsed,
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Content action failed");
        return;
      }

      setMessage(payload.message ?? "Success");

      const refresh = await fetch(`/api/admin/content?locale=${locale}`);
      const refreshPayload = (await refresh.json()) as ContentApiResponse;
      const latest =
        refreshPayload.draft?.payload ??
        refreshPayload.published?.payload ??
        refreshPayload.fallback;

      setJsonText(JSON.stringify(latest, null, 2));
      setMeta({
        source: refreshPayload.source,
        draftVersion: refreshPayload.draft?.version ?? null,
        publishedVersion: refreshPayload.published?.version ?? null,
        nextVersion: refreshPayload.nextVersion,
      });
    } catch {
      setError("Network error while saving content");
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Landing Content CMS</h2>
            <p className="mt-1 text-sm text-muted">
              Direct DB CMS with revisioned draft/publish workflow.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-line bg-surface-muted p-1">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                locale === "en" ? "bg-primary text-white" : "text-muted"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("bn")}
              className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                locale === "bn" ? "bg-primary text-white" : "text-muted"
              }`}
            >
              BN
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4 text-sm">
          <p className="rounded-lg border border-line px-3 py-2">
            Source: <strong>{meta?.source ?? "-"}</strong>
          </p>
          <p className="rounded-lg border border-line px-3 py-2">
            Draft v: <strong>{meta?.draftVersion ?? "-"}</strong>
          </p>
          <p className="rounded-lg border border-line px-3 py-2">
            Published v: <strong>{meta?.publishedVersion ?? "-"}</strong>
          </p>
          <p className="rounded-lg border border-line px-3 py-2">
            Next v: <strong>{meta?.nextVersion ?? "-"}</strong>
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <label className="mb-2 block text-sm font-semibold">Content JSON</label>
        <textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          className="h-[560px] w-full rounded-xl border border-line bg-white p-4 font-mono text-xs outline-none focus:border-primary"
          spellCheck={false}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => runAction("saveDraft")}
            disabled={isSaving || isPublishing || isLoading}
            className="rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-primary disabled:opacity-70"
          >
            {isSaving ? "Saving Draft..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => runAction("publish")}
            disabled={isSaving || isPublishing || isLoading}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-70"
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
          {isLoading ? <p className="text-sm text-muted">Loading...</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </div>
      </section>
    </div>
  );
}
