import Image from "next/image";
import { ClassMediaType } from "@prisma/client";
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
                  ) : (
                    <Image
                      src={entry.class.mediaUrl}
                      alt={entry.class.title}
                      width={1280}
                      height={720}
                      className="h-[260px] w-full object-contain"
                    />
                  )}
                </div>

                <div className="p-4 text-sm text-muted">
                  <p>Mentor/Admin: {entry.class.createdBy.fullName}</p>
                  <p>Joined: {new Date(entry.joinedAt).toLocaleString()}</p>
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
