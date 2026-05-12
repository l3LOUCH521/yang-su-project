import { client } from "@repo/db/client";
import BlogList from "@/components/Blog/List";
import { AppLayout } from "@/components/Layout/AppLayout";

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

export default async function HistoryPage({
  params,
}: {
  // TypeScript rule: Expect the URL to give us a 'year' and 'month' (e.g., /2026/04)
  params: Promise<{ year: string; month: string }>;
}) {
  // Wait for Next.js to grab the year and month from the URL
  const { year, month } = await params;

  const coerced = coerceYearMonth(year, month);
  const historyPosts = coerced
    ? await (async () => {
        const startDate = new Date(coerced.year, coerced.month - 1, 1, 0, 0, 0, 0);
        const endDate = new Date(coerced.year, coerced.month, 1, 0, 0, 0, 0);

        const rawPosts = await client.db.post.findMany({
          where: {
            active: true,
            date: {
              gte: startDate,
              lt: endDate,
            },
          },
          orderBy: { date: "desc" },
          include: { Likes: true },
        });

        return rawPosts.map((post) => ({
          ...post,
          likes: post.Likes.length,
        }));
      })()
    : [];

  // Count how many posts we actually found
  const postCount = historyPosts.length;
  
  // Turn the numbers into text for the screen
  const displayName = formatMonthYear(year, month);

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
          </>
        )}
      </div>
    </AppLayout>
  );
}