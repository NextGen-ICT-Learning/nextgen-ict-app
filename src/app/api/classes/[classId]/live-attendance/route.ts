import { LiveClassStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const attendancePayloadSchema = z.object({
  action: z.enum(["join", "heartbeat", "leave"]),
  sessionId: z.string().trim().min(1),
});

function clampSeconds(seconds: number, max = 120) {
  if (!Number.isFinite(seconds) || seconds < 0) return 0;
  return Math.min(Math.floor(seconds), max);
}

function isStudent(role: string) {
  return role === "STUDENT";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ classId: string }> },
) {
  try {
    const session = await getSession();

    if (!session || !isStudent(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await context.params;
    const parsed = attendancePayloadSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid attendance payload" }, { status: 400 });
    }

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

    const liveSession = await db.liveClassSession.findFirst({
      where: {
        id: parsed.data.sessionId,
        classId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!liveSession) {
      return NextResponse.json({ message: "Live session not found" }, { status: 404 });
    }

    const now = new Date();

    if (parsed.data.action === "join") {
      const existing = await db.liveClassAttendance.findUnique({
        where: {
          sessionId_studentId: {
            sessionId: parsed.data.sessionId,
            studentId: session.sub,
          },
        },
      });

      if (!existing) {
        const created = await db.liveClassAttendance.create({
          data: {
            sessionId: parsed.data.sessionId,
            studentId: session.sub,
            firstJoinedAt: now,
            lastSeenAt: now,
            leftAt: liveSession.status === LiveClassStatus.LIVE ? null : now,
          },
        });
        return NextResponse.json({
          message: "Attendance started",
          attendance: created,
        });
      }

      const resumed = await db.liveClassAttendance.update({
        where: {
          sessionId_studentId: {
            sessionId: parsed.data.sessionId,
            studentId: session.sub,
          },
        },
        data: {
          lastSeenAt: now,
          leftAt: liveSession.status === LiveClassStatus.LIVE ? null : now,
        },
      });

      return NextResponse.json({ message: "Attendance resumed", attendance: resumed });
    }

    const attendance = await db.liveClassAttendance.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: parsed.data.sessionId,
          studentId: session.sub,
        },
      },
    });

    if (!attendance) {
      if (parsed.data.action === "leave") {
        return NextResponse.json({ message: "No active attendance record found" }, { status: 404 });
      }

      const created = await db.liveClassAttendance.create({
        data: {
          sessionId: parsed.data.sessionId,
          studentId: session.sub,
          firstJoinedAt: now,
          lastSeenAt: now,
          leftAt: null,
        },
      });
      return NextResponse.json({ message: "Attendance started", attendance: created });
    }

    const deltaSeconds = clampSeconds((now.getTime() - attendance.lastSeenAt.getTime()) / 1000);
    const nextTotal = attendance.totalActiveSeconds + deltaSeconds;

    if (parsed.data.action === "heartbeat") {
      const updated = await db.liveClassAttendance.update({
        where: {
          sessionId_studentId: {
            sessionId: parsed.data.sessionId,
            studentId: session.sub,
          },
        },
        data: {
          totalActiveSeconds: nextTotal,
          lastSeenAt: now,
          leftAt: liveSession.status === LiveClassStatus.LIVE ? null : now,
        },
      });

      return NextResponse.json({ message: "Attendance heartbeat recorded", attendance: updated });
    }

    const updated = await db.liveClassAttendance.update({
      where: {
        sessionId_studentId: {
          sessionId: parsed.data.sessionId,
          studentId: session.sub,
        },
      },
      data: {
        totalActiveSeconds: nextTotal,
        lastSeenAt: now,
        leftAt: now,
      },
    });

    return NextResponse.json({ message: "Attendance ended", attendance: updated });
  } catch (error) {
    console.error("Live attendance POST error", error);
    return NextResponse.json({ message: "Failed to track attendance" }, { status: 500 });
  }
}

