import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const joinSchema = z.object({
  classCode: z.string().min(4).max(32),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = joinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid class code" }, { status: 400 });
    }

    const classCode = parsed.data.classCode.trim().toUpperCase();

    const classInfo = await db.classContent.findUnique({
      where: { classCode },
      select: {
        id: true,
        title: true,
        classCode: true,
      },
    });

    if (!classInfo) {
      return NextResponse.json({ message: "Class code not found" }, { status: 404 });
    }

    const existing = await db.classEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId: classInfo.id,
          studentId: session.sub,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ message: "You already joined this class" }, { status: 400 });
    }

    await db.classEnrollment.create({
      data: {
        classId: classInfo.id,
        studentId: session.sub,
      },
    });

    return NextResponse.json({
      message: `Joined class: ${classInfo.title}`,
      class: classInfo,
    });
  } catch (error) {
    console.error("Join class error", error);
    return NextResponse.json({ message: "Failed to join class" }, { status: 500 });
  }
}
