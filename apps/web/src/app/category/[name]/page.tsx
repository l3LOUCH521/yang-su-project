import { client } from "@repo/db/client";
import BlogList from "@/components/Blog/List";
import { AppLayout } from "@/components/Layout/AppLayout";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  // decode category name from URL and get posts by category
  const { name } = await params;
  // decodeURIComponent to handle URL-encoded category names
  const categoryName = decodeURIComponent(name);

  const rawPosts = await client.db.post.findMany({
    where: { active: true },
    orderBy: { date: "desc" },
    include: { Likes: true },
  });

  const posts = rawPosts.map((post) => ({
    ...post,
    likes: post.Likes.length,
  }));

  const normalizedSearch = categoryName.trim().toLowerCase();
  const categoryPosts = posts.filter(
    (post) => post.category.trim().toLowerCase() === normalizedSearch
  );

  // count posts in this category
  const postCount = categoryPosts.length;
  const displayCategoryName = categoryPosts[0]?.category || categoryName;

  return (
    <AppLayout selectedCategory={displayCategoryName}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Category: {displayCategoryName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {postCount} {postCount === 1 ? "Post" : "Posts"}
          </p>
        </div>

        {postCount === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No posts in this category
            </p>
          </div>
        ) : (
          <BlogList posts={categoryPosts} />
        )}
      </div>
    </AppLayout>
  );
}