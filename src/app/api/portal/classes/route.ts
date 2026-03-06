import { LiveClassStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await db.classEnrollment.findMany({
      where: {
        studentId: session.sub,
      },
      include: {
        class: {
          include: {
          createdBy: {
            select: {
              fullName: true,
              email: true,
            },
          },
          liveSessions: {
            where: {
              status: LiveClassStatus.LIVE,
            },
            orderBy: {
              startedAt: "desc",
            },
            take: 1,
          },
        },
      },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    return NextResponse.json({
      classes: enrollments.map((entry) => ({
        enrollmentId: entry.id,
        joinedAt: entry.joinedAt,
        class: entry.class,
      })),
    });
  } catch (error) {
    console.error("Student classes list error", error);
    return NextResponse.json({ message: "Failed to load classes" }, { status: 500 });
  }
}
