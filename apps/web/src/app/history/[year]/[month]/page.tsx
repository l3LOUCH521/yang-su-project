import { posts, type Post } from "@repo/db/data";
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


// retrieve posts by year and month
function getPostsByYearMonth(year: string, month: string): Post[] {
  const activePosts = posts.filter((post) => post.active);

  //parse number using base 10 to prevent unexpected behavior when user input month with leading zero (e.g. 01, 02)
  const targetYear = parseInt(year, 10);
  const targetMonth = parseInt(month, 10);
  
  // validate year and month
  // preventing page crash when user try to input invalid year or month in the URL
  if (isNaN(targetYear) || isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
    return [];
  }

  return activePosts.filter((post) => {
    // Convert the raw date string from the database into a JavaScript Date object
    // so we can use math and built-in date functions
    const postDate = new Date(post.date);
    // Keep this post only if BOTH the Year AND the Month exactly match the URL
    return postDate.getFullYear() === targetYear && postDate.getMonth() + 1 === targetMonth;
  });
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
  
  // Use those URL numbers to find all the matching blog posts in our database
  const historyPosts = getPostsByYearMonth(year, month);

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