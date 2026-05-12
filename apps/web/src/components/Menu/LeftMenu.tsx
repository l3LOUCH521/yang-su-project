import { client } from "@repo/db/client";
import { CategoryList } from "./CategoryList";
import { HistoryList } from "./HistoryList";
import { TagList } from "./TagList";

export async function LeftMenu({
  //attribute to indicate which category is currently selected, 
  // used to highlight the selected category in the menu
  selectedCategory,
  selectedTag,
  selectedYear,
  selectedMonth,
}: {
  selectedCategory?: string; 
  selectedTag?: string; 
  selectedYear?: string; 
  selectedMonth?: string; 
}) {
  const rawPosts = await client.db.post.findMany({ 
    where: { active: true },
    include: { Likes: true }
  });

  const posts = rawPosts.map(post => ({
    ...post,
    likes: post.Likes.length
  }));

  // Filter out all inactive posts, only active posts should be shown in the category list,
  // history list and tag list
  const activePosts = posts.filter((post) => post.active);

  return (
    <div className="w-70 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-800 p-4">
      <div className="mb-4 flex items-center gap-3">
        <img src="/wsulogo.png" alt="WSU Logo" className="w-10 h-auto" />
        <a href="/" className="text-xl font-bold dark:text-white">
          Full-Stack Blog
        </a>
      </div>
      <nav>
        <ul role="list" className="flex flex-1 flex-col gap-y-5">
          <li>
            <CategoryList posts={activePosts} selectedCategory={selectedCategory} />
          </li>
          <li>
            <HistoryList
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              posts={activePosts}
            />
          </li>
          <li>
            <TagList selectedTag={selectedTag} posts={activePosts} />
          </li>
          <li className="pt-4">
            <a
              href="/admin"
              className="block px-3 py-2 text-sm dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Admin
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}