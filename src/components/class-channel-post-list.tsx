import Image from "next/image";
import { ClassPostMediaType } from "@prisma/client";

type ChannelPost = {
  id: string;
  message: string | null;
  mediaType: ClassPostMediaType;
  mediaUrl: string | null;
  mediaOriginalName: string | null;
  createdAt: Date;
  author: {
    fullName: string;
    role: string;
  };
};

function mediaLabel(mediaType: ClassPostMediaType) {
  if (mediaType === ClassPostMediaType.IMAGE) return "Image";
  if (mediaType === ClassPostMediaType.VIDEO) return "Video";
  if (mediaType === ClassPostMediaType.PDF) return "PDF";
  if (mediaType === ClassPostMediaType.FILE) return "File";
  return "Text";
}

function renderPostMedia(post: ChannelPost) {
  if (!post.mediaUrl) {
    return null;
  }

  if (post.mediaType === ClassPostMediaType.IMAGE) {
    return (
      <Image
        src={post.mediaUrl}
        alt={post.mediaOriginalName ?? "Class post image"}
        width={1280}
        height={720}
        className="mt-3 h-[240px] w-full rounded-xl border border-line object-contain"
      />
    );
  }

  if (post.mediaType === ClassPostMediaType.VIDEO) {
    return (
      <video
        controls
        preload="metadata"
        src={post.mediaUrl}
        className="mt-3 h-[240px] w-full rounded-xl border border-line bg-black object-contain"
      >
        Your browser does not support video playback.
      </video>
    );
  }

  return (
    <a
      href={post.mediaUrl}
      target="_blank"
      rel="noreferrer"
      className="mt-3 inline-flex rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-primary"
    >
      Open {mediaLabel(post.mediaType)} {post.mediaOriginalName ? `- ${post.mediaOriginalName}` : "attachment"}
    </a>
  );
}

export function ClassChannelPostList({ posts }: { posts: ChannelPost[] }) {
  if (posts.length === 0) {
    return (
      <article className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted">
        No posts yet for this class channel.
      </article>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-full bg-surface-muted px-2 py-1 font-semibold text-foreground">
              {post.author.fullName}
            </span>
            <span>{post.author.role}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleString()}</span>
            <span>•</span>
            <span>{mediaLabel(post.mediaType)}</span>
          </div>

          {post.message ? <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{post.message}</p> : null}

          {renderPostMedia(post)}
        </article>
      ))}
    </div>
  );
}
