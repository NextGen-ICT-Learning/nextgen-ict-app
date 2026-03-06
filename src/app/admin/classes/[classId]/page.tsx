import Link from "next/link";
import { notFound } from "next/navigation";
import { requireContentEditorSession } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { ClassChannelPostForm } from "@/components/class-channel-post-form";
import { ClassChannelPostList } from "@/components/class-channel-post-list";
import { AdminClassEditForm } from "@/components/admin-class-edit-form";

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
    },
  });

  if (!classInfo) {
    notFound();
  }

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

      <ClassChannelPostForm classId={classInfo.id} />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Channel Timeline</h2>
        <ClassChannelPostList posts={classInfo.posts} />
      </section>
    </div>
  );
}
