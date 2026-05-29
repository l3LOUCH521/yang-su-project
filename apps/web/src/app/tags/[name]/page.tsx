import { client } from "@repo/db/client";
import BlogList from "@/components/Blog/List";
import { AppLayout } from "@/components/Layout/AppLayout";
import { redirect } from "next/navigation";

function coercePositiveInt(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeTag(value: string) {
  return value.toLowerCase().replace(/-/g, " ").trim();
}

export default async function TagPage({
  params,
  searchParams,
}: {
  // TypeScript rule: The URL dynamic route [name] will pass us a 'name' string
  params: Promise<{ name: string }>;
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
}) {
  // Wait for Next.js to pull the '{name}' variable out of the URL
  const { name } = await params;
  
  // Browsers encode special characters in URLs (e.g. spaces become %20).
  // decodeURIComponent turns those ugly codes back into regular text.
  const tagName = decodeURIComponent(name);

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

  const totalPages = Math.max(1, Math.ceil(postCount / pageSize));

  const queryForPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    return `/tags/${encodeURIComponent(tagName)}?${params.toString()}`;
  };

  if (requestedPage && requestedPage > totalPages) {
    redirect(queryForPage(totalPages));
  }

  const safePage = Math.min(page, totalPages);
  const pageStartIndex = (safePage - 1) * pageSize;
  const pagePosts = tagPosts.slice(pageStartIndex, pageStartIndex + pageSize);

  const prevPage = safePage > 1 ? safePage - 1 : null;
  const nextPage = safePage < totalPages ? safePage + 1 : null;

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