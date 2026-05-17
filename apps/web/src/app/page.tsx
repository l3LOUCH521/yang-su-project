import { client } from "@repo/db/client";
import { AppLayout } from "../components/Layout/AppLayout";
import { Main } from "../components/Main";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

// Helper function to coerce a string to a positive integer, or return null if invalid
function coercePositiveInt(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
}) {
  // Coerce and validate pagination parameters from the URL query string
  const searchPara = (await searchParams) ?? {};
  // null if no valid page param, otherwise the requested page number
  const requestedPage = coercePositiveInt(searchPara.page);
  // Default to page 1 if no valid page parameter is provided
  const page = requestedPage ?? 1;
  // Default to 3 posts per page
  const pageSize = Math.min(coercePositiveInt(searchPara.pageSize) ?? 3);

  // Count total active posts to calculate total pages for pagination
  const totalActive = await client.db.post.count({ where: { active: true } });
  // Ensure at least 1 page exists even if there are no active posts
  const totalPages = Math.max(1, Math.ceil(totalActive / pageSize));

  // build pagination URLs with the correct query parameters
  const queryForPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    return `/?${params.toString()}`;
  };

  // If the user requested a page beyond the last page (e.g. after a post is hidden),
  // redirect back to the last valid page.
  if (requestedPage && requestedPage > totalPages) {
    redirect(queryForPage(totalPages));
  }

  // Ensure the current page is not greater than the total pages (e.g. if posts were hidden)
  const safePage = Math.min(page, totalPages);

  const rawPosts = await client.db.post.findMany({
    where: { active: true },
    orderBy: { date: "desc" },
    include: { Likes: true },
    skip: (safePage - 1) * pageSize, // Calculate how many posts to skip based on the current page and page size
    take: pageSize, // Limit the number of posts returned to the page size
  });

  const posts = rawPosts.map((post) => ({
    ...post,
    likes: post.Likes.length,
  }));

  // Determine if there are previous or next pages for pagination controls
  const prevPage = safePage > 1 ? safePage - 1 : null;
  const nextPage = safePage < totalPages ? safePage + 1 : null;

  return (
    <AppLayout>
      <Main posts={posts} className={styles.main} />

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

        <span className="text-sm text-gray-600 dark:text-gray-300" data-test-id="pagination-status">
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
    </AppLayout>
  );
}
