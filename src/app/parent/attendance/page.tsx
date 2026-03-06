import { Role } from "@prisma/client";
import Link from "next/link";
import { db } from "@/lib/db";

function formatMinutes(totalSeconds: number) {
  return Math.round(totalSeconds / 60);
}

export default async function ParentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const trimmedCode = code?.trim() ?? "";

  if (!trimmedCode) {
    return (
      <main className="mx-auto mt-8 w-[min(980px,calc(100%-2rem))] rounded-3xl border border-line bg-surface p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Parent Attendance</p>
        <h1 className="mt-3 text-3xl font-bold">Track your child&apos;s live class attendance</h1>
        <p className="mt-2 text-sm text-muted">
          Use the parent access link provided by the student profile page.
        </p>
      </main>
    );
  }

  const student = await db.user.findFirst({
    where: {
      parentAccessCode: trimmedCode,
      role: Role.STUDENT,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      guardianName: true,
      guardianPhone: true,
      classEnrollments: {
        include: {
          class: {
            select: {
              id: true,
              title: true,
              classCode: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    return (
      <main className="mx-auto mt-8 w-[min(980px,calc(100%-2rem))] rounded-3xl border border-danger/30 bg-surface p-6 md:p-8">
        <h1 className="text-2xl font-bold">Invalid Parent Access Link</h1>
        <p className="mt-2 text-sm text-muted">Please ask the student to share a valid updated parent link.</p>
      </main>
    );
  }

  const classRows = await Promise.all(
    student.classEnrollments.map(async (enrollment) => {
      const attendanceRows = await db.liveClassAttendance.findMany({
        where: {
          studentId: student.id,
          session: {
            classId: enrollment.class.id,
          },
        },
        include: {
          session: {
            select: {
              title: true,
              startedAt: true,
              endedAt: true,
              status: true,
            },
          },
        },
        orderBy: {
          firstJoinedAt: "desc",
        },
      });

      const totalSeconds = attendanceRows.reduce((sum, row) => sum + row.totalActiveSeconds, 0);
      const totalSessions = attendanceRows.filter((row) => row.totalActiveSeconds >= 60).length;

      return {
        classId: enrollment.class.id,
        classTitle: enrollment.class.title,
        classCode: enrollment.class.classCode,
        totalSeconds,
        totalSessions,
        rows: attendanceRows.slice(0, 8),
      };
    }),
  );

  const overallSeconds = classRows.reduce((sum, row) => sum + row.totalSeconds, 0);
  const overallSessions = classRows.reduce((sum, row) => sum + row.totalSessions, 0);

  return (
    <main className="mx-auto mt-8 w-[min(1080px,calc(100%-2rem))] space-y-6 pb-10">
      <section className="rounded-3xl border border-line bg-surface p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Parent Attendance Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold">{student.fullName}</h1>
        <p className="mt-1 text-sm text-muted">Student email: {student.email}</p>
        <p className="mt-1 text-sm text-muted">
          Guardian: {student.guardianName ?? "N/A"} {student.guardianPhone ? `(${student.guardianPhone})` : ""}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-line bg-surface-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Enrolled classes</p>
            <p className="mt-2 text-2xl font-bold">{classRows.length}</p>
          </article>
          <article className="rounded-2xl border border-line bg-surface-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Attended live sessions</p>
            <p className="mt-2 text-2xl font-bold">{overallSessions}</p>
          </article>
          <article className="rounded-2xl border border-line bg-surface-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Total live minutes</p>
            <p className="mt-2 text-2xl font-bold">{formatMinutes(overallSeconds)}</p>
          </article>
          <article className="rounded-2xl border border-line bg-surface-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Avg minutes/session</p>
            <p className="mt-2 text-2xl font-bold">
              {overallSessions > 0 ? Math.round(formatMinutes(overallSeconds) / overallSessions) : 0}
            </p>
          </article>
        </div>
      </section>

      {classRows.length > 0 ? (
        classRows.map((row) => (
          <section key={row.classId} className="rounded-3xl border border-line bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">{row.classTitle}</h2>
                <p className="text-sm text-muted">Class code: {row.classCode}</p>
              </div>
              <div className="text-right text-sm text-muted">
                <p>Sessions attended: {row.totalSessions}</p>
                <p>Total live minutes: {formatMinutes(row.totalSeconds)}</p>
              </div>
            </div>

            {row.rows.length > 0 ? (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-surface-muted text-xs uppercase tracking-[0.08em] text-muted">
                    <tr>
                      <th className="px-4 py-3">Session</th>
                      <th className="px-4 py-3">Join Time</th>
                      <th className="px-4 py-3">Leave Time</th>
                      <th className="px-4 py-3">Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {row.rows.map((entry) => (
                      <tr key={entry.id} className="border-t border-line">
                        <td className="px-4 py-3">
                          <p className="font-semibold">{entry.session.title}</p>
                          <p className="text-xs text-muted">
                            {entry.session.startedAt
                              ? new Date(entry.session.startedAt).toLocaleString()
                              : "Schedule pending"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {entry.firstJoinedAt ? new Date(entry.firstJoinedAt).toLocaleString() : "N/A"}
                        </td>
                        <td className="px-4 py-3">{entry.leftAt ? new Date(entry.leftAt).toLocaleString() : "Live"}</td>
                        <td className="px-4 py-3 font-semibold">{formatMinutes(entry.totalActiveSeconds)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">No attendance records yet for this class.</p>
            )}
          </section>
        ))
      ) : (
        <section className="rounded-3xl border border-line bg-surface p-6">
          <p className="text-sm text-muted">No class enrollment found for this student yet.</p>
        </section>
      )}

      <div className="text-center">
        <Link href="/" className="inline-flex rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-primary">
          Back to Homepage
        </Link>
      </div>
    </main>
  );
}
