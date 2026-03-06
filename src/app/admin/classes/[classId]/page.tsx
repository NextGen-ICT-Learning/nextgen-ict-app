import Link from "next/link";
import { LiveClassStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { requireContentEditorSession } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { buildWhiteboardUrl } from "@/lib/live-class";
import { ClassChannelPostForm } from "@/components/class-channel-post-form";
import { ClassChannelPostList } from "@/components/class-channel-post-list";
import { AdminClassEditForm } from "@/components/admin-class-edit-form";
import { AdminLiveClassControls } from "@/components/admin-live-class-controls";

export default async function AdminClassChannelPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  await requireContentEditorSession();
  const { classId } = await params;

  const classInfo = await db.classContent.findUnique({
    where: { id: classId },
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
  });

  if (!classInfo) {
    notFound();
  }

  const activeSession = classInfo.liveSessions[0]
    ? {
        id: classInfo.liveSessions[0].id,
        title: classInfo.liveSessions[0].title,
        meetingRoom: classInfo.liveSessions[0].meetingRoom,
        status: classInfo.liveSessions[0].status,
        startedAt: classInfo.liveSessions[0].startedAt,
        whiteboardUrl: buildWhiteboardUrl(
          classInfo.liveSessions[0].whiteboardRoom,
          classInfo.liveSessions[0].whiteboardKey,
        ),
      }
    : null;

  const attendanceSessions = await db.liveClassSession.findMany({
    where: { classId },
    include: {
      attendances: {
        include: {
          student: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          firstJoinedAt: "desc",
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
    take: 8,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Class Channel</p>
        <h1 className="mt-2 text-3xl font-bold">{classInfo.title}</h1>
        <p className="mt-2 text-sm text-muted">{classInfo.description}</p>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
          <span>Code: {classInfo.classCode}</span>
          <span>Creator: {classInfo.createdBy.fullName}</span>
          <Link href="/admin/classes" className="font-semibold text-primary underline">
            Back to class list
          </Link>
        </div>
      </section>

      <AdminClassEditForm
        classId={classInfo.id}
        initialTitle={classInfo.title}
        initialDescription={classInfo.description}
        initialClassCode={classInfo.classCode}
      />

      <AdminLiveClassControls classId={classInfo.id} activeSession={activeSession} />

      <ClassChannelPostForm classId={classInfo.id} />

      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h2 className="text-2xl font-bold">Live Attendance History</h2>
        <p className="mt-1 text-sm text-muted">Track who attended each session and for how long.</p>

        <div className="mt-4 space-y-4">
          {attendanceSessions.length > 0 ? (
            attendanceSessions.map((entry) => {
              const attendeeCount = entry.attendances.filter((row) => row.totalActiveSeconds >= 60).length;
              const totalMinutes = Math.round(
                entry.attendances.reduce((sum, row) => sum + row.totalActiveSeconds, 0) / 60,
              );

              return (
                <article key={entry.id} className="rounded-xl border border-line bg-surface-muted p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold">{entry.title}</p>
                      <p className="text-xs text-muted">
                        Started: {entry.startedAt ? new Date(entry.startedAt).toLocaleString() : "Not started"}
                      </p>
                    </div>
                    <div className="text-sm text-muted">
                      <p>Attendees: {attendeeCount}</p>
                      <p>Total minutes: {totalMinutes}</p>
                    </div>
                  </div>

                  {entry.attendances.length > 0 ? (
                    <div className="mt-3 overflow-x-auto rounded-lg border border-line bg-surface">
                      <table className="min-w-full text-left text-xs">
                        <thead className="bg-surface-muted uppercase tracking-[0.08em] text-muted">
                          <tr>
                            <th className="px-3 py-2">Student</th>
                            <th className="px-3 py-2">Join</th>
                            <th className="px-3 py-2">Leave</th>
                            <th className="px-3 py-2">Minutes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.attendances.map((row) => (
                            <tr key={row.id} className="border-t border-line">
                              <td className="px-3 py-2">
                                <p className="font-semibold text-foreground">{row.student.fullName}</p>
                                <p className="text-muted">{row.student.email}</p>
                              </td>
                              <td className="px-3 py-2">{new Date(row.firstJoinedAt).toLocaleString()}</td>
                              <td className="px-3 py-2">
                                {row.leftAt ? new Date(row.leftAt).toLocaleString() : "Live"}
                              </td>
                              <td className="px-3 py-2 font-semibold">{Math.round(row.totalActiveSeconds / 60)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted">No attendance records for this session.</p>
                  )}
                </article>
              );
            })
          ) : (
            <p className="text-sm text-muted">No live sessions have been started for this class yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Channel Timeline</h2>
        <ClassChannelPostList posts={classInfo.posts} />
      </section>
    </div>
  );
}
