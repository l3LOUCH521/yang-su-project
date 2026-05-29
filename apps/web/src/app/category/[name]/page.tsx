import { client } from "@repo/db/client";
import BlogList from "@/components/Blog/List";
import { AppLayout } from "@/components/Layout/AppLayout";
import { redirect } from "next/navigation";

function coercePositiveInt(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
}) {
  // decode category name from URL and get posts by category
  const { name } = await params;
  // decodeURIComponent to handle URL-encoded category names
  const categoryName = decodeURIComponent(name);

  const searchPara = (await searchParams) ?? {};
  const requestedPage = coercePositiveInt(searchPara.page);
  const page = requestedPage ?? 1;
  const pageSize = Math.min(coercePositiveInt(searchPara.pageSize) ?? 3);

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

  const totalPages = Math.max(1, Math.ceil(postCount / pageSize));

  const queryForPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    return `/category/${encodeURIComponent(categoryName)}?${params.toString()}`;
  };

  if (requestedPage && requestedPage > totalPages) {
    redirect(queryForPage(totalPages));
  }

  const safePage = Math.min(page, totalPages);
  const pageStartIndex = (safePage - 1) * pageSize;
  const pagePosts = categoryPosts.slice(pageStartIndex, pageStartIndex + pageSize);

  const prevPage = safePage > 1 ? safePage - 1 : null;
  const nextPage = safePage < totalPages ? safePage + 1 : null;

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
          <>
            <BlogList posts={pagePosts} />
            <nav
              className="max-w-4xl mx-auto px-4 pb-8 flex items-center justify-between"
              aria-label="Pagination"
              data-test-id="pagination"
            >
              {prevPage ? (
                <a
                  href={queryForPage(prevPage)}
                  className="text-sm text-gray-600 dark:text-gray-300"
                  data-test-id="pagination-prev"
                >
                  Previous
                </a>
              ) : (
                <span
                  className="text-sm text-gray-400 dark:text-gray-500"
                  aria-disabled="true"
                  data-test-id="pagination-prev"
                >
                  Previous
                </span>
              )}

              <span
                className="text-sm text-gray-600 dark:text-gray-300"
                data-test-id="pagination-status"
              >
                Page {safePage} of {totalPages}
              </span>

              {nextPage ? (
                <a
                  href={queryForPage(nextPage)}
                  className="text-sm text-gray-600 dark:text-gray-300"
                  data-test-id="pagination-next"
                >
                  Next
                </a>
              ) : (
                <span
                  className="text-sm text-gray-400 dark:text-gray-500"
                  aria-disabled="true"
                  data-test-id="pagination-next"
                >
                  Next
                </span>
              )}
            </nav>
          </>
        )}
      </div>
    </AppLayout>
  );
}