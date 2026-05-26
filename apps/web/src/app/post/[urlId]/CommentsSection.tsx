import { client } from "@repo/db/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export async function CommentsSection({
  postId,
  urlId,
  replyTo,
}: {
  postId: number;
  urlId: string;
  replyTo?: string;
}) {
  const replyToId = typeof replyTo === "string" ? Number.parseInt(replyTo, 10) : NaN;
  const safeReplyToId = Number.isFinite(replyToId) ? replyToId : null;

  async function addComment(formData: FormData) {
    "use server";

    const authorNameRaw = formData.get("authorName");
    const contentRaw = formData.get("content");
    const parentIdRaw = formData.get("parentId");

    const authorName =
      typeof authorNameRaw === "string" && authorNameRaw.trim().length > 0
        ? authorNameRaw.trim().slice(0, 50)
        : "Anonymous";

    const content = typeof contentRaw === "string" ? contentRaw.trim() : "";
    if (!content) {
      redirect(`/post/${urlId}`);
    }

    let parentId: number | null = null;
    if (typeof parentIdRaw === "string" && parentIdRaw.length > 0) {
      const parsed = Number.parseInt(parentIdRaw, 10);
      if (Number.isFinite(parsed)) parentId = parsed;
    }

    if (parentId !== null) {
      const parent = await client.db.comment.findUnique({
        where: { id: parentId },
        select: { id: true, postId: true },
      });
      if (!parent || parent.postId !== postId) {
        parentId = null;
      }
    }

    await client.db.comment.create({
      data: {
        authorName,
        content,
        postId,
        parentId,
      },
    });

    redirect(`/post/${urlId}`);
  }

  const flatComments = await client.db.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      createdAt: true,
      authorName: true,
      content: true,
      parentId: true,
    },
  });

  type CommentNode = (typeof flatComments)[number] & { replies: CommentNode[] };

  const nodesById = new Map<number, CommentNode>();
  for (const c of flatComments) {
    nodesById.set(c.id, { ...c, replies: [] });
  }

  const rootComments: CommentNode[] = [];
  for (const c of flatComments) {
    const node = nodesById.get(c.id)!;
    if (c.parentId && nodesById.has(c.parentId)) {
      nodesById.get(c.parentId)!.replies.push(node);
    } else {
      rootComments.push(node);
    }
  }

  const renderComments = (comments: CommentNode[], depth = 0) => {
    return (
      <div className={depth === 0 ? "space-y-4" : "space-y-3"}>
        {comments.map((c) => (
          <div
            key={c.id}
            id={`comment-${c.id}`}
            className="border border-gray-200 dark:border-gray-800 rounded-md p-3"
            style={{ marginLeft: depth === 0 ? 0 : depth * 16 }}
            data-test-id={`comment-${c.id}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{c.authorName}</span>
                <span className="text-gray-400 dark:text-gray-500"> · </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(c.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <Link
                href={`/post/${urlId}?replyTo=${c.id}#comment-${c.id}`}
                scroll={false}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reply
              </Link>
            </div>

            <p
              className="mt-2 text-gray-900 dark:text-white whitespace-pre-wrap"
              data-test-id="comment-content"
            >
              {c.content}
            </p>

            {safeReplyToId === c.id && (
              <form action={addComment} className="mt-3 space-y-2">
                <input type="hidden" name="parentId" value={String(c.id)} />
                <div className="grid gap-2">
                  <input
                    name="authorName"
                    placeholder="Your name (optional)"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900"
                  />
                  <textarea
                    name="content"
                    placeholder="Write a reply..."
                    required
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-2"
                  >
                    Reply
                  </button>
                  <Link
                    href={`/post/${urlId}`}
                    className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            )}

            {c.replies.length > 0 && (
              <div className="mt-3">{renderComments(c.replies, depth + 1)}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="mt-12" aria-label="Comments" data-test-id="comments">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Comments</h2>

      <form action={addComment} className="mt-4 space-y-2">
        <input type="hidden" name="parentId" value="" />
        <div className="grid gap-2">
          <input
            name="authorName"
            placeholder="Your name (optional)"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900"
          />
          <textarea
            name="content"
            placeholder="Write a comment..."
            required
            rows={4}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900"
          />
        </div>
        <button
          type="submit"
          className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-2"
        >
          Comment
        </button>
      </form>

      <div className="mt-6">
        {rootComments.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No comments yet.</p>
        ) : (
          renderComments(rootComments)
        )}
      </div>
    </section>
  );
}
