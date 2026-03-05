import { NextResponse } from "next/server";
import { z } from "zod";
import type { Locale } from "@/content/home-content";
import { getSession } from "@/lib/auth";
import {
  getContentRevisions,
  getPublishedHomeContent,
  publishContent,
  saveDraftContent,
} from "@/lib/content-cms";

const postSchema = z.object({
  action: z.enum(["saveDraft", "publish"]),
  locale: z.enum(["en", "bn"]),
  payload: z.unknown(),
});

function hasContentAccess(role: string) {
  return role === "ADMIN" || role === "CONTENT_EDITOR";
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !hasContentAccess(session.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale");
  const locale: Locale = localeParam === "bn" ? "bn" : "en";

  try {
    const [revisions, publishedOrFallback] = await Promise.all([
      getContentRevisions(locale),
      getPublishedHomeContent(locale),
    ]);

    return NextResponse.json({
      locale,
      fallback: publishedOrFallback.content,
      source: publishedOrFallback.source,
      draft: revisions.draft,
      published: revisions.published,
      nextVersion: revisions.nextVersion,
    });
  } catch (error) {
    console.error("Failed to load admin content", error);
    return NextResponse.json({ message: "Failed to load content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !hasContentAccess(session.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    if (parsed.data.action === "saveDraft") {
      const result = await saveDraftContent({
        locale: parsed.data.locale,
        payload: parsed.data.payload,
        userId: session.sub,
      });

      if (!result.ok) {
        return NextResponse.json(
          { message: result.message, errors: result.errors },
          { status: 400 },
        );
      }

      return NextResponse.json({
        message: "Draft saved",
        revision: result.draft,
      });
    }

    const result = await publishContent({
      locale: parsed.data.locale,
      payload: parsed.data.payload,
      userId: session.sub,
    });

    if (!result.ok) {
      return NextResponse.json(
        { message: result.message, errors: result.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Content published",
      revision: result.published,
    });
  } catch (error) {
    console.error("Failed content action", error);
    return NextResponse.json({ message: "Failed content operation" }, { status: 500 });
  }
}
