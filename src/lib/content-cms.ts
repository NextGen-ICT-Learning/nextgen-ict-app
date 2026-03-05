import { ContentStatus } from "@prisma/client";
import type { HomeContent, Locale } from "@/content/home-content";
import { homeContentByLocale } from "@/content/home-content";
import { db } from "@/lib/db";
import { homeContentSchema } from "@/lib/content-schema";

function fallbackContent(locale: Locale): HomeContent {
  return homeContentByLocale[locale] ?? homeContentByLocale.en;
}

function parseContent(payload: unknown): HomeContent | null {
  const parsed = homeContentSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

export async function getPublishedHomeContent(locale: Locale): Promise<{
  content: HomeContent;
  source: "cms" | "fallback";
  revisionId?: string;
  version?: number;
}> {
  try {
    const published = await db.contentRevision.findFirst({
      where: {
        locale,
        status: ContentStatus.PUBLISHED,
      },
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    if (!published) {
      return { content: fallbackContent(locale), source: "fallback" };
    }

    const parsed = parseContent(published.payload);
    if (!parsed) {
      return { content: fallbackContent(locale), source: "fallback" };
    }

    return {
      content: parsed,
      source: "cms",
      revisionId: published.id,
      version: published.version,
    };
  } catch (error) {
    console.error("Failed to load CMS content. Falling back.", error);
    return { content: fallbackContent(locale), source: "fallback" };
  }
}

export async function getContentRevisions(locale: Locale) {
  const [draft, published, maxVersionRow] = await Promise.all([
    db.contentRevision.findFirst({
      where: { locale, status: ContentStatus.DRAFT },
      orderBy: { createdAt: "desc" },
    }),
    db.contentRevision.findFirst({
      where: { locale, status: ContentStatus.PUBLISHED },
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
    }),
    db.contentRevision.findFirst({
      where: { locale },
      orderBy: { version: "desc" },
      select: { version: true },
    }),
  ]);

  return {
    draft,
    published,
    nextVersion: (maxVersionRow?.version ?? 0) + 1,
  };
}

export async function saveDraftContent(params: {
  locale: Locale;
  payload: unknown;
  userId: string;
}) {
  const parsed = homeContentSchema.safeParse(params.payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Content failed schema validation",
      errors: parsed.error.flatten(),
    };
  }

  const revisions = await getContentRevisions(params.locale);

  const draft = await db.contentRevision.create({
    data: {
      locale: params.locale,
      version: revisions.nextVersion,
      status: ContentStatus.DRAFT,
      payload: parsed.data,
      createdById: params.userId,
    },
  });

  return {
    ok: true as const,
    draft,
  };
}

export async function publishContent(params: {
  locale: Locale;
  payload: unknown;
  userId: string;
}) {
  const parsed = homeContentSchema.safeParse(params.payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Content failed schema validation",
      errors: parsed.error.flatten(),
    };
  }

  const revisions = await getContentRevisions(params.locale);

  const published = await db.$transaction(async (tx) => {
    await tx.contentRevision.updateMany({
      where: {
        locale: params.locale,
        status: ContentStatus.PUBLISHED,
      },
      data: {
        status: ContentStatus.ARCHIVED,
      },
    });

    return tx.contentRevision.create({
      data: {
        locale: params.locale,
        version: revisions.nextVersion,
        status: ContentStatus.PUBLISHED,
        payload: parsed.data,
        createdById: params.userId,
        publishedAt: new Date(),
      },
    });
  });

  return {
    ok: true as const,
    published,
  };
}
