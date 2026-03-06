import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadClassAsset } from "@/lib/cloudinary";

export const runtime = "nodejs";

const updateSchema = z.object({
  title: z.string().min(4).max(140),
  description: z.string().min(12).max(2000),
  classCode: z.string().min(4).max(32),
});

const DEFAULT_MAX_UPLOAD_MB = 200;
const parsedMaxMb = Number(process.env.CLASS_UPLOAD_MAX_MB ?? DEFAULT_MAX_UPLOAD_MB);
const MAX_UPLOAD_MB = Number.isFinite(parsedMaxMb) && parsedMaxMb > 0 ? parsedMaxMb : DEFAULT_MAX_UPLOAD_MB;
const MAX_FILE_SIZE = Math.floor(MAX_UPLOAD_MB * 1024 * 1024);

function isAllowedMediaType(type: string) {
  return type.startsWith("image/") || type.startsWith("video/") || type === "application/pdf";
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ classId: string }> },
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await context.params;

    const existingClass = await db.classContent.findUnique({
      where: { id: classId },
      select: { id: true },
    });

    if (!existingClass) {
      return NextResponse.json({ message: "Class not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const classCodeValue = formData.get("classCode");
    const mediaValue = formData.get("media");

    const classCode = typeof classCodeValue === "string" ? classCodeValue.trim().toUpperCase() : "";

    const parsed = updateSchema.safeParse({
      title: typeof title === "string" ? title.trim() : title,
      description: typeof description === "string" ? description.trim() : description,
      classCode,
    });

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid class update payload" }, { status: 400 });
    }

    const duplicateCode = await db.classContent.findFirst({
      where: {
        classCode,
        id: { not: classId },
      },
      select: { id: true },
    });

    if (duplicateCode) {
      return NextResponse.json({ message: "Class code already in use" }, { status: 409 });
    }

    const media = mediaValue instanceof File && mediaValue.size > 0 ? mediaValue : null;

    if (media) {
      if (media.size > MAX_FILE_SIZE) {
        return NextResponse.json({ message: `File must be under ${MAX_UPLOAD_MB}MB` }, { status: 400 });
      }

      if (!isAllowedMediaType(media.type)) {
        return NextResponse.json(
          { message: "Only image, video, or PDF files are allowed" },
          { status: 400 },
        );
      }
    }

    const uploaded = media ? await uploadClassAsset(media) : null;

    const updated = await db.classContent.update({
      where: { id: classId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        classCode: parsed.data.classCode,
        ...(uploaded
          ? {
              mediaType: uploaded.mediaType,
              mediaUrl: uploaded.secureUrl,
              mediaPublicId: uploaded.publicId,
              mediaOriginalName: uploaded.originalName,
            }
          : {}),
      },
    });

    return NextResponse.json({ message: "Class updated successfully", class: updated });
  } catch (error) {
    console.error("Class update error", error);
    return NextResponse.json({ message: "Failed to update class" }, { status: 500 });
  }
}
