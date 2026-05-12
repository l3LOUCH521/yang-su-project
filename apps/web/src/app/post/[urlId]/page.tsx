import { client } from "@repo/db/client";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { headers } from "next/headers";
import { AppLayout } from "@/components/Layout/AppLayout";
import LikeButton from "@/components/LikeButton";

function formatDate(date: Date) {
  // Convert the raw date string into date object
  const dateObject = new Date(date);
  // get day
  const day = dateObject.getDate();
  // display the month as a short name
  const month = dateObject.toLocaleDateString("en-US", { month: "short" });
  // get year
  const year = dateObject.getFullYear();
  return `${day} ${month} ${year}`;
}

function getClientIp(requestHeaders: Headers): string {
  const raw =
    requestHeaders.get("x-forwarded-for") ??
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("cf-connecting-ip");

  const ip = raw?.split(",")[0]?.trim();
  return ip || "127.0.0.1";
}

export default async function Page({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;
  
  let post = await client.db.post.findUnique({
    where: { urlId },
    include: { Likes: true }
  });

  if (!post || !post.active) {
    notFound();
  }

  // Increment views
  post = await client.db.post.update({
    where: { id: post.id },
    data: { views: post.views + 1 },
    include: { Likes: true }
  });

  // using , to find all tags, then using .map to store it into new array
  const tags = post.tags.split(",").map((tag) => tag.trim());
  const formattedDate = formatDate(post.date);
  const ip = getClientIp(headers() as unknown as Headers);
  const initialHasLiked = post.Likes.some((like) => like.userIP === ip);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8" data-test-id={`blog-post-${post.id}`}>
        <Link
          href="/"
          className="inline-block mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Home
        </Link>

        <header className="mb-8">
          <Link
            href={`/post/${post.urlId}`}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4 block hover:text-blue-600 dark:hover:text-blue-400"
          >
            {post.title}
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span>{formattedDate}</span>
            <LikeButton
              postId={post.id}
              initialLikes={post.Likes.length}
              initialHasLiked={initialHasLiked}
            />
            <span>{post.views} views</span>
            <span>
              <Link
                href={`/category/${post.category.toLowerCase()}`}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {post.category}
              </Link>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </header>

        {post.imageUrl && (
          <div className="mb-8">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        )}

        <article 
          className="prose prose-lg dark:prose-invert max-w-none text-gray-900 dark:text-white"
          data-test-id="content-markdown"
        >
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
      </div>
    </AppLayout>
  );
}