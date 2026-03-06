import { ClassPostMediaType, LiveClassStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buildWhiteboardUrl,
  generateMeetingRoom,
  generateWhiteboardKey,
  generateWhiteboardRoom,
  getJitsiDomain,
} from "@/lib/live-class";

export const runtime = "nodejs";

const startPayloadSchema = z.object({
  action: z.literal("start"),
  title: z.string().trim().min(4).max(120).optional(),
});

const endPayloadSchema = z.object({
  action: z.literal("end"),
  sessionId: z.string().trim().min(1).optional(),
});

const payloadSchema = z.union([startPayloadSchema, endPayloadSchema]);

function canManageLiveClass(role: string) {
  return role === "ADMIN" || role === "CONTENT_EDITOR";
}

function clampSeconds(seconds: number, max = 300) {
  if (!Number.isFinite(seconds) || seconds < 0) return 0;
  return Math.min(Math.floor(seconds), max);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ classId: string }> },
) {
  try {
    const session = await getSession();

    if (!session || !canManageLiveClass(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await context.params;

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
    console.error("Live session GET error", error);
    return NextResponse.json({ message: "Failed to load live session info" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ classId: string }> },
) {
  try {
    const session = await getSession();

    if (!session || !canManageLiveClass(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await context.params;
    const payload = payloadSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json({ message: "Invalid live session action payload" }, { status: 400 });
    }

    const classInfo = await db.classContent.findUnique({
      where: { id: classId },
      select: { id: true, title: true, classCode: true },
    });

    if (!classInfo) {
      return NextResponse.json({ message: "Class not found" }, { status: 404 });
    }

    if (payload.data.action === "start") {
      const existingLive = await db.liveClassSession.findFirst({
        where: {
          classId,
          status: LiveClassStatus.LIVE,
        },
      });

      if (existingLive) {
        return NextResponse.json(
          {
            message: "A live class is already running",
            liveSession: {
              ...existingLive,
              jitsiDomain: getJitsiDomain(),
              whiteboardUrl: buildWhiteboardUrl(existingLive.whiteboardRoom, existingLive.whiteboardKey),
            },
          },
          { status: 409 },
        );
      }

      const now = new Date();
      const liveTitle = payload.data.title || `${classInfo.title} - Live Session`;

      const created = await db.liveClassSession.create({
        data: {
          classId,
          title: liveTitle,
          meetingRoom: generateMeetingRoom(classInfo.classCode),
          whiteboardRoom: generateWhiteboardRoom(classInfo.classCode),
          whiteboardKey: generateWhiteboardKey(),
          status: LiveClassStatus.LIVE,
          startedAt: now,
          createdById: session.sub,
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
      });

      await db.classPost.create({
        data: {
          classId,
          authorId: session.sub,
          mediaType: ClassPostMediaType.TEXT,
          message: `Live class started: ${liveTitle}\nJoin now from the Live Class panel.`,
        },
      });

      return NextResponse.json({
        message: "Live class started",
        liveSession: {
          ...created,
          jitsiDomain: getJitsiDomain(),
          whiteboardUrl: buildWhiteboardUrl(created.whiteboardRoom, created.whiteboardKey),
        },
      });
    }

    const liveToEnd = payload.data.sessionId
      ? await db.liveClassSession.findFirst({
          where: {
            id: payload.data.sessionId,
            classId,
            status: LiveClassStatus.LIVE,
          },
        })
      : await db.liveClassSession.findFirst({
          where: {
            classId,
            status: LiveClassStatus.LIVE,
          },
          orderBy: {
            startedAt: "desc",
          },
        });

    if (!liveToEnd) {
      return NextResponse.json({ message: "No active live class found" }, { status: 404 });
    }

    const endedAt = new Date();

    const openAttendances = await db.liveClassAttendance.findMany({
      where: {
        sessionId: liveToEnd.id,
        leftAt: null,
      },
      select: {
        sessionId: true,
        studentId: true,
        lastSeenAt: true,
        totalActiveSeconds: true,
      },
    });

    if (openAttendances.length > 0) {
      await db.$transaction(
        openAttendances.map((entry) =>
          db.liveClassAttendance.update({
            where: {
              sessionId_studentId: {
                sessionId: entry.sessionId,
                studentId: entry.studentId,
              },
            },
            data: {
              totalActiveSeconds:
                entry.totalActiveSeconds +
                clampSeconds((endedAt.getTime() - entry.lastSeenAt.getTime()) / 1000),
              lastSeenAt: endedAt,
              leftAt: endedAt,
            },
          }),
        ),
      );
    }

    const ended = await db.liveClassSession.update({
      where: { id: liveToEnd.id },
      data: {
        status: LiveClassStatus.ENDED,
        endedAt,
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
    });

    await db.classPost.create({
      data: {
        classId,
        authorId: session.sub,
        mediaType: ClassPostMediaType.TEXT,
        message: `Live class ended: ${ended.title}`,
      },
    });

    return NextResponse.json({ message: "Live class ended", liveSession: ended });
  } catch (error) {
    console.error("Live session POST error", error);
    return NextResponse.json({ message: "Failed to update live session" }, { status: 500 });
  }
}
