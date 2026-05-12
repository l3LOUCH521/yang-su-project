import { client } from "@repo/db/client";
import BlogList from "@/components/Blog/List";
import { AppLayout } from "@/components/Layout/AppLayout";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const rawPosts = await client.db.post.findMany({
    where: { active: true },
    include: { Likes: true },
  });

  const postsWithLikes = rawPosts.map((post) => ({
    ...post,
    likes: post.Likes.length,
  }));

  const searchTerm = query.toLowerCase();
  const filteredPosts = postsWithLikes.filter((post) => {
    return (
      post.title.toLowerCase().includes(searchTerm) ||
      post.description.toLowerCase().includes(searchTerm)
    );
  });

  const postCount = filteredPosts.length;

  return (
    <AppLayout query={query}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Search Results
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Showing results for "{query}"
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {postCount} {postCount === 1 ? "Post" : "Posts"} found
          </p>
        </div>

        {postCount === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No posts found for "{query}"
            </p>
          </div>
        ) : (
          <BlogList posts={filteredPosts} />
        )}
      </div>
    </AppLayout>
  );
}