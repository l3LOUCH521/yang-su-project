import { client } from "@repo/db/client";
import BlogList from "@/components/Blog/List";
import { AppLayout } from "@/components/Layout/AppLayout";
import { redirect } from "next/navigation";

const months: { [key: string]: string } = {
  "1": "January",
  "2": "February",
  "3": "March",
  "4": "April",
  "5": "May",
  "6": "June",
  "7": "July",
  "8": "August",
  "9": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};


function coerceYearMonth(year: string, month: string) {
  const y = Number.parseInt(year, 10);
  const m = Number.parseInt(month, 10);

  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    return null;
  }

  return { year: y, month: m };
}

// format the display name for the month and year
function formatMonthYear(year: string, month: string): string {
  const monthName = months[month] || month;
  return `${monthName}, ${year}`;
}

function coercePositiveInt(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default async function HistoryPage({
  params,
  searchParams,
}: {
  // TypeScript rule: Expect the URL to give us a 'year' and 'month' (e.g., /2026/04)
  params: Promise<{ year: string; month: string }>;
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
}) {
  // Wait for Next.js to grab the year and month from the URL
  const { year, month } = await params;

  const searchPara = (await searchParams) ?? {};
  const requestedPage = coercePositiveInt(searchPara.page);
  const page = requestedPage ?? 1;
  const pageSize = Math.min(coercePositiveInt(searchPara.pageSize) ?? 3);

  const coerced = coerceYearMonth(year, month);

  const startDate = coerced
    ? new Date(coerced.year, coerced.month - 1, 1, 0, 0, 0, 0)
    : null;
  const endDate = coerced
    ? new Date(coerced.year, coerced.month, 1, 0, 0, 0, 0)
    : null;

  const whereClause = coerced
    ? {
        active: true,
        date: {
          gte: startDate!,
          lt: endDate!,
        },
      }
    : { active: true, id: -1 };

  const totalCount = coerced ? await client.db.post.count({ where: whereClause }) : 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const queryForPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    return `/history/${encodeURIComponent(year)}/${encodeURIComponent(month)}?${params.toString()}`;
  };

  if (requestedPage && requestedPage > totalPages) {
    redirect(queryForPage(totalPages));
  }

  const safePage = Math.min(page, totalPages);

  const rawPosts = coerced
    ? await client.db.post.findMany({
        where: whereClause,
        orderBy: { date: "desc" },
        include: { Likes: true },
        skip: (safePage - 1) * pageSize,
        take: pageSize,
      })
    : [];

  const historyPosts = rawPosts.map((post) => ({
    ...post,
    likes: post.Likes.length,
  }));

  // Count how many posts we actually found
  const postCount = totalCount;
  
  // Turn the numbers into text for the screen
  const displayName = formatMonthYear(year, month);

  const prevPage = safePage > 1 ? safePage - 1 : null;
  const nextPage = safePage < totalPages ? safePage + 1 : null;

  return (
    // AppLayout draws our sidebar menu and header. We pass it the current year and month
    // so it knows exactly which menu link to highlight in blue!
    <AppLayout selectedYear={year} selectedMonth={months[month] || month}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Draw the large Title at the top of the page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Posts from {displayName}
          </h1>
        </div>

        {/* Decide what to show based on how many posts we found */}
        {postCount === 0 ? (
          // If we found 0 posts, show this empty gray message
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">0 Posts</p>
          </div>
        ) : (
          // If find posts, show the exact count and draw the list of articles
          <>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {postCount} {postCount === 1 ? "Post" : "Posts"}
            </p>
            {/* filtered post and display it on the screen */}
            <BlogList posts={historyPosts} />

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