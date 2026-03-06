import { ClassMediaType } from "@prisma/client";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { AdminClassUploadForm } from "@/components/admin-class-upload-form";

function mediaLabel(mediaType: ClassMediaType) {
  if (mediaType === ClassMediaType.PDF) return "PDF";
  return mediaType === ClassMediaType.VIDEO ? "Video" : "Image";
}

export default async function AdminClassesPage() {
  await requireAdminSession();

  const classes = await db.classContent.findMany({
    include: {
      createdBy: {
        select: {
          fullName: true,
          email: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <AdminClassUploadForm />

      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h1 className="text-2xl font-bold">Uploaded Classes</h1>
        <p className="mt-1 text-sm text-muted">
          Share class code with students so they can join and watch online from portal.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {classes.length > 0 ? (
            classes.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-line bg-surface-muted p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Code</p>
                <p className="mt-1 text-lg font-bold">{entry.classCode}</p>

                <h2 className="mt-3 text-lg font-bold">{entry.title}</h2>
                <p className="mt-2 text-sm text-muted">{entry.description}</p>

                <div className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
                  <p>Type: {mediaLabel(entry.mediaType)}</p>
                  <p>Joined: {entry._count.enrollments} students</p>
                  <p>Uploaded by: {entry.createdBy.fullName}</p>
                  <p>{new Date(entry.createdAt).toLocaleString()}</p>
                </div>

                <a
                  href={entry.mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-primary"
                >
                  Open Uploaded Media
                </a>
                <Link
                  href={`/admin/classes/${entry.id}`}
                  className="ml-2 mt-4 inline-flex rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-primary"
                >
                  Open Channel
                </Link>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted">No classes uploaded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
