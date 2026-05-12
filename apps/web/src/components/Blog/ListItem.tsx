import type { Post } from "@repo/db/data";
import Link from "next/link";

export function BlogListItem({ post }: { post: Post }) {
  const formatDate = (date: Date) => {
    // convert date string to Date object
    const dateObject = new Date(date);
    // display day as number (e.g. 1, 2, ..., 31)
    const day = dateObject.getDate();
    //display month as short name, e.g. Jan, Feb, Mar
    const month = dateObject.toLocaleDateString("en-US", { month: "short" });
    const year = dateObject.getFullYear();
    // Template literals automatically convert numbers to strings!
    return `${day} ${month} ${year}`;
  };

  const tags = post.tags.split(",").map((tag) => tag.trim());

  return (
    <article
      data-test-id={`blog-post-${post.id}`}
      className="flex flex-col md:flex-row gap-6 border-b border-gray-200 dark:border-gray-800 pb-8 mb-8"
    >
      {post.imageUrl && (
        <div className="md:w-1/4">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-40 object-cover rounded-lg"
          />
        </div>
      )}
      
      <div className="flex-1">
        <Link
          href={`/post/${post.urlId}`}
          className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2 block"
        >
          {post.title}
        </Link>
        
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          {post.description}
        </p>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span>{formatDate(post.date)}</span>
          <span>❤️ {post.likes} likes</span>
          <span>{post.views} views</span>
        </div>
        
        
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
            {post.category}
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
      </div>
    </article>
  );
}