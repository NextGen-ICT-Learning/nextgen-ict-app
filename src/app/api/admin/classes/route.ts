import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadClassAsset } from "@/lib/cloudinary";
import { generateClassCode } from "@/lib/class-code";

export const runtime = "nodejs";

const classMetaSchema = z.object({
  title: z.string().min(4).max(140),
  description: z.string().min(12).max(2000),
});

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function isAllowedMediaType(type: string) {
  return type.startsWith("image/") || type.startsWith("video/");
}

async function generateUniqueClassCode() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateClassCode();
    const existing = await db.classContent.findUnique({
      where: { classCode: code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Failed to generate unique class code");
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const classes = await db.classContent.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Admin classes list error", error);
    return NextResponse.json({ message: "Failed to load classes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const media = formData.get("media");

    const parsed = classMetaSchema.safeParse({
      title: typeof title === "string" ? title.trim() : title,
      description: typeof description === "string" ? description.trim() : description,
    });

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid class payload" }, { status: 400 });
    }

    if (!(media instanceof File)) {
      return NextResponse.json({ message: "Class media file is required" }, { status: 400 });
    }

    if (media.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "File must be under 50MB" }, { status: 400 });
    }

    if (!isAllowedMediaType(media.type)) {
      return NextResponse.json({ message: "Only image or video files are allowed" }, { status: 400 });
    }

    const [asset, classCode] = await Promise.all([uploadClassAsset(media), generateUniqueClassCode()]);

    const created = await db.classContent.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        classCode,
        mediaType: asset.mediaType,
        mediaUrl: asset.secureUrl,
        mediaPublicId: asset.publicId,
        mediaOriginalName: asset.originalName,
        createdById: session.sub,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json({ message: "Class uploaded successfully", class: created });
  } catch (error) {
    console.error("Admin class upload error", error);
    return NextResponse.json({ message: "Failed to upload class" }, { status: 500 });
  }
}
