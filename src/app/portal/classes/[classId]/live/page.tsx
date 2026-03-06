import { LiveClassStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudentSession } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { buildWhiteboardUrl, getJitsiDomain } from "@/lib/live-class";
import { LiveClassRoom } from "@/components/live-class-room";

export default async function StudentLiveClassPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const session = await requireStudentSession();
  const { classId } = await params;

  const enrollment = await db.classEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId: session.sub,
      },
    },
    include: {
      class: {
        include: {
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
  });

  if (!enrollment) {
    notFound();
  }

  const classInfo = enrollment.class;
  const activeSession = classInfo.liveSessions[0];

  if (!activeSession) {
    return (
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-6">
        <h1 className="text-2xl font-bold">No Live Session Right Now</h1>
        <p className="text-sm text-muted">Mentor has not started a live session yet for this class.</p>
        <Link
          href={`/portal/classes/${classId}`}
          className="inline-flex rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-primary"
        >
          Back to Class Channel
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/portal/classes/${classId}`}
        className="inline-flex rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-primary"
      >
        Back to Class Channel
      </Link>

      <LiveClassRoom
        classTitle={classInfo.title}
        sessionTitle={activeSession.title}
        meetingRoom={activeSession.meetingRoom}
        whiteboardUrl={buildWhiteboardUrl(activeSession.whiteboardRoom, activeSession.whiteboardKey)}
        displayName={session.fullName}
        email={session.email}
        jitsiDomain={getJitsiDomain()}
      />
    </div>
  );
}
