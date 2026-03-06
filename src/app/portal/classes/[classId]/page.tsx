import Image from "next/image";
import Link from "next/link";
import { ClassMediaType } from "@prisma/client";
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
        },
      },
    },
  });

  if (!enrollment) {
    notFound();
  }

  const classInfo = enrollment.class;

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

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Class Broadcast Channel</h2>
        <ClassChannelPostList posts={classInfo.posts} />
      </section>
    </div>
  );
}
