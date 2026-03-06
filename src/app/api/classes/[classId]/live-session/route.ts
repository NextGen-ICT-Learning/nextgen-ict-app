import { LiveClassStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildWhiteboardUrl, getJitsiDomain } from "@/lib/live-class";

function canManageLiveClass(role: string) {
  return role === "ADMIN" || role === "CONTENT_EDITOR";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ classId: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await context.params;

    if (!canManageLiveClass(session.role)) {
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

    const liveSession = await db.liveClassSession.findFirst({
      where: {
        classId,
        status: LiveClassStatus.LIVE,
      },
      include: {
        createdBy: {
          select: {
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return NextResponse.json({
      liveSession: liveSession
        ? {
            ...liveSession,
            jitsiDomain: getJitsiDomain(),
            whiteboardUrl: buildWhiteboardUrl(liveSession.whiteboardRoom, liveSession.whiteboardKey),
          }
        : null,
    });
  } catch (error) {
    console.error("Student live session GET error", error);
    return NextResponse.json({ message: "Failed to load live session" }, { status: 500 });
  }
}
