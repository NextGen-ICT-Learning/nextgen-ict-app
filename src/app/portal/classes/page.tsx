import Image from "next/image";
import Link from "next/link";
import { ClassMediaType, LiveClassStatus } from "@prisma/client";
import { requireStudentSession } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { JoinClassCodeForm } from "@/components/join-class-code-form";

export default async function PortalClassesPage() {
  const session = await requireStudentSession();

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

  return (
    <div className="space-y-8">
      <JoinClassCodeForm />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">My Online Classes</h2>
        <p className="text-sm text-muted">Watch uploaded classes after joining with valid class code.</p>

        <div className="grid gap-6 lg:grid-cols-2">
          {enrollments.length > 0 ? (
            enrollments.map((entry) => (
              <article key={entry.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="bg-surface-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                    Class Code: {entry.class.classCode}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{entry.class.title}</h3>
                  {entry.class.liveSessions.length > 0 ? (
                    <p className="mt-2 inline-flex rounded-full bg-success/15 px-2 py-1 text-xs font-semibold text-success">
                      Live now
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-muted">{entry.class.description}</p>
                </div>

                <div className="border-y border-line bg-black/90">
                  {entry.class.mediaType === ClassMediaType.VIDEO ? (
                    <video
                      controls
                      preload="metadata"
                      className="h-[260px] w-full bg-black object-contain"
                      src={entry.class.mediaUrl}
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : entry.class.mediaType === ClassMediaType.IMAGE ? (
                    <Image
                      src={entry.class.mediaUrl}
                      alt={entry.class.title}
                      width={1280}
                      height={720}
                      className="h-[260px] w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-[260px] items-center justify-center bg-surface px-4 text-center">
                      <a
                        href={entry.class.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg border border-line px-3 py-2 text-sm font-semibold text-foreground hover:border-primary"
                      >
                        Open PDF Document
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-4 text-sm text-muted">
                  <p>Mentor/Admin: {entry.class.createdBy.fullName}</p>
                  <p>Joined: {new Date(entry.joinedAt).toLocaleString()}</p>
                  <Link
                    href={`/portal/classes/${entry.class.id}`}
                    className="mt-3 inline-flex rounded-lg border border-line px-3 py-2 text-sm font-semibold text-foreground hover:border-primary"
                  >
                    Open Class Channel
                  </Link>
                  {entry.class.liveSessions.length > 0 ? (
                    <Link
                      href={`/portal/classes/${entry.class.id}/live`}
                      className="ml-2 mt-3 inline-flex rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-strong"
                    >
                      Join Live
                    </Link>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <article className="rounded-2xl border border-line bg-surface p-6">
              <p className="text-sm text-muted">
                You haven&apos;t joined any class yet. Enter a class code above to unlock your class content.
              </p>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
