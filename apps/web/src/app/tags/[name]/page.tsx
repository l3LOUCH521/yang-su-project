import { client } from "@repo/db/client";
import BlogList from "@/components/Blog/List";
import { AppLayout } from "@/components/Layout/AppLayout";

function normalizeTag(value: string) {
  return value.toLowerCase().replace(/-/g, " ").trim();
}

export default async function TagPage({
  params,
}: {
  // TypeScript rule: The URL dynamic route [name] will pass us a 'name' string
  params: Promise<{ name: string }>;
}) {
  // Wait for Next.js to pull the '{name}' variable out of the URL
  const { name } = await params;
  
  // Browsers encode special characters in URLs (e.g. spaces become %20).
  // decodeURIComponent turns those ugly codes back into regular text.
  const tagName = decodeURIComponent(name);

  const rawPosts = await client.db.post.findMany({
    where: { active: true },
    orderBy: { date: "desc" },
    include: { Likes: true },
  });

  const posts = rawPosts.map((post) => ({
    ...post,
    likes: post.Likes.length,
  }));

  const normalizedSearch = normalizeTag(tagName);
  const tagPosts = posts.filter((post) => {
    const tags = post.tags.split(",").map((tag) => tag.trim());
    return tags.some((tag) => normalizeTag(tag) === normalizedSearch);
  });
  
  // Format the text specifically for the visual Title "Tag: web design" on the screen.
  // We replace hyphens with spaces because it looks prettier for the user to read!
  const displayTagName = tagName.replace(/-/g, ' ');

  // Count exactly how many matches the database returned
  const postCount = tagPosts.length;

  return (
    <AppLayout selectedTag={displayTagName}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tag: {displayTagName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {postCount} {postCount === 1 ? "Post" : "Posts"}
          </p>
        </div>

        {postCount === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">0 Posts</p>
          </div>
        ) : (
          <BlogList posts={tagPosts} />
        )}
      </div>
    </AppLayout>
  );
}