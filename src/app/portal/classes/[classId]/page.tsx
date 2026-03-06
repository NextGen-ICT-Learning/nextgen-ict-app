import Image from "next/image";
import Link from "next/link";
import { ClassMediaType, LiveClassStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { requireStudentSession } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { ClassChannelPostList } from "@/components/class-channel-post-list";

export default async function StudentClassChannelPage({
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
          createdBy: {
            select: {
              fullName: true,
              email: true,
            },
          },
          posts: {
            include: {
              author: {
                select: {
                  fullName: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
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
  });

  if (!enrollment) {
    notFound();
  }

  const classInfo = enrollment.class;
  const activeSession = classInfo.liveSessions[0] ?? null;
  const attendanceRows = await db.liveClassAttendance.findMany({
    where: {
      studentId: session.sub,
      session: {
        classId: classInfo.id,
      },
    },
    include: {
      session: {
        select: {
          title: true,
          startedAt: true,
        },
      },
    },
    orderBy: {
      firstJoinedAt: "desc",
    },
    take: 8,
  });
  const totalActiveSeconds = attendanceRows.reduce((sum, row) => sum + row.totalActiveSeconds, 0);
  const attendedSessions = attendanceRows.filter((row) => row.totalActiveSeconds >= 60).length;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Enrolled Class</p>
        <h1 className="mt-2 text-3xl font-bold">{classInfo.title}</h1>
        <p className="mt-2 text-sm text-muted">{classInfo.description}</p>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
          <span>Code: {classInfo.classCode}</span>
          <span>Mentor/Admin: {classInfo.createdBy.fullName}</span>
          <Link href="/portal/classes" className="font-semibold text-primary underline">
            Back to my classes
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h2 className="text-xl font-bold">Main Class Media</h2>

        {classInfo.mediaType === ClassMediaType.VIDEO ? (
          <video
            controls
            preload="metadata"
            src={classInfo.mediaUrl}
            className="mt-4 h-[360px] w-full rounded-xl border border-line bg-black object-contain"
          >
            Your browser does not support video playback.
          </video>
        ) : classInfo.mediaType === ClassMediaType.IMAGE ? (
          <Image
            src={classInfo.mediaUrl}
            alt={classInfo.title}
            width={1280}
            height={720}
            className="mt-4 h-[360px] w-full rounded-xl border border-line object-contain"
          />
        ) : (
          <div className="mt-4 rounded-xl border border-line p-4">
            <a
              href={classInfo.mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-primary"
            >
              Open PDF Material
            </a>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h2 className="text-xl font-bold">Live Class</h2>
        {activeSession ? (
          <div className="mt-3 space-y-3 rounded-xl border border-success/40 bg-success/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-success">Live now</p>
            <p className="text-lg font-bold">{activeSession.title}</p>
            <p className="text-sm text-muted">
              Started: {activeSession.startedAt ? new Date(activeSession.startedAt).toLocaleString() : "Just now"}
            </p>
            <Link
              href={`/portal/classes/${classInfo.id}/live`}
              className="inline-flex rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-strong"
            >
              Join Live Class
            </Link>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">
            No live class is active at the moment. You will see the join button here when mentor starts a session.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h2 className="text-xl font-bold">Attendance Summary</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-line bg-surface-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Sessions attended</p>
            <p className="mt-2 text-2xl font-bold">{attendedSessions}</p>
          </article>
          <article className="rounded-xl border border-line bg-surface-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Total live minutes</p>
            <p className="mt-2 text-2xl font-bold">{Math.round(totalActiveSeconds / 60)}</p>
          </article>
          <article className="rounded-xl border border-line bg-surface-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Avg minutes/session</p>
            <p className="mt-2 text-2xl font-bold">
              {attendedSessions > 0 ? Math.round(totalActiveSeconds / 60 / attendedSessions) : 0}
            </p>
          </article>
        </div>

        {attendanceRows.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Join</th>
                  <th className="px-4 py-3">Leave</th>
                  <th className="px-4 py-3">Minutes</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{row.session.title}</p>
                      <p className="text-xs text-muted">
                        {row.session.startedAt ? new Date(row.session.startedAt).toLocaleString() : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 py-3">{new Date(row.firstJoinedAt).toLocaleString()}</td>
                    <td className="px-4 py-3">{row.leftAt ? new Date(row.leftAt).toLocaleString() : "Live"}</td>
                    <td className="px-4 py-3 font-semibold">{Math.round(row.totalActiveSeconds / 60)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No attendance data yet. Join a live class to begin tracking.</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Class Broadcast Channel</h2>
        <ClassChannelPostList posts={classInfo.posts} />
      </section>
    </div>
  );
}
