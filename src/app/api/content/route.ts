import { NextResponse } from "next/server";
import type { Locale } from "@/content/home-content";
import { getPublishedHomeContent } from "@/lib/content-cms";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang");
  const locale: Locale = lang === "bn" ? "bn" : "en";
  const result = await getPublishedHomeContent(locale);

  return NextResponse.json({
    locale,
    source: result.source,
    revisionId: result.revisionId ?? null,
    version: result.version ?? null,
    data: result.content,
  });
}
