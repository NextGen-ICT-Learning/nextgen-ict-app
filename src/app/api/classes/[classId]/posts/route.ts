import { ClassPostMediaType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadClassPostAsset } from "@/lib/cloudinary";

export const runtime = "nodejs";

const DEFAULT_MAX_POST_MB = 200;
const parsedPostMaxMb = Number(process.env.CLASS_POST_MAX_MB ?? DEFAULT_MAX_POST_MB);
const MAX_POST_MB = Number.isFinite(parsedPostMaxMb) && parsedPostMaxMb > 0 ? parsedPostMaxMb : DEFAULT_MAX_POST_MB;
const MAX_POST_SIZE = Math.floor(MAX_POST_MB * 1024 * 1024);

function canManageClassChannel(role: string) {
  return role === "ADMIN" || role === "CONTENT_EDITOR";
}

function isAllowedPostMedia(file: File) {
  return (
    file.type.startsWith("image/") ||
    file.type.startsWith("video/") ||
    file.type === "application/pdf"
  );
}

async function resolveClassId(params: Promise<{ classId: string }>) {
  const resolved = await params;
  return resolved.classId;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ classId: string }> },
) {
  try {
    const classId = await resolveClassId(context.params);
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!canManageClassChannel(session.role)) {
      const enrollment = await db.classEnrollment.findUnique({
        where: {
          classId_studentId: {
            classId,
            studentId: session.sub,
          },
        },
        select: { id: true },
      });

      if (!enrollment) {
        return NextResponse.json({ message: "Class access denied" }, { status: 403 });
      }
    }

    const classInfo = await db.classContent.findUnique({
      where: { id: classId },
      include: {
        createdBy: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!classInfo) {
      return NextResponse.json({ message: "Class not found" }, { status: 404 });
    }

    const posts = await db.classPost.findMany({
      where: { classId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ class: classInfo, posts });
  } catch (error) {
    console.error("Class posts GET error", error);
    return NextResponse.json({ message: "Failed to load class channel" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ classId: string }> },
) {
  try {
    const classId = await resolveClassId(context.params);
    const session = await getSession();

    if (!session || !canManageClassChannel(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const classInfo = await db.classContent.findUnique({
      where: { id: classId },
      select: { id: true },
    });

    if (!classInfo) {
      return NextResponse.json({ message: "Class not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const messageValue = formData.get("message");
    const mediaValue = formData.get("media");

    const message = typeof messageValue === "string" ? messageValue.trim() : "";
    const media = mediaValue instanceof File ? mediaValue : null;

    if (!message && !media) {
      return NextResponse.json(
        { message: "Post requires a message or media attachment" },
        { status: 400 },
      );
    }

    if (media) {
      if (media.size > MAX_POST_SIZE) {
        return NextResponse.json({ message: `Media must be under ${MAX_POST_MB}MB` }, { status: 400 });
      }

      if (!isAllowedPostMedia(media)) {
        return NextResponse.json(
          { message: "Only image, video, or PDF files are allowed for class posts" },
          { status: 400 },
        );
      }
    }

    const uploaded = media ? await uploadClassPostAsset(media) : null;

    const createdPost = await db.classPost.create({
      data: {
        classId,
        authorId: session.sub,
        message: message || null,
        mediaType: uploaded?.mediaType ?? ClassPostMediaType.TEXT,
        mediaUrl: uploaded?.secureUrl,
        mediaPublicId: uploaded?.publicId,
        mediaOriginalName: uploaded?.originalName,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ message: "Post published", post: createdPost });
  } catch (error) {
    console.error("Class posts POST error", error);
    return NextResponse.json({ message: "Failed to publish class post" }, { status: 500 });
  }
}
