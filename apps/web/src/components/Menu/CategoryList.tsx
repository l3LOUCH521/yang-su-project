import { categories } from "@/functions/categories";
import type { Post } from "@repo/db/data";
import { SummaryItem } from "./SummaryItem";
import { LinkList } from "./LinkList";

//create categorys array
const allCategories = ["React", "Node", "Mongo", "DevOps"];

export function CategoryList({ posts, selectedCategory }: { posts: Post[]; selectedCategory?: string }) {
  const activePosts = posts.filter((post) => post.active);
  const existingCategories = categories(activePosts);
  
  //create a list of all categories, also those without posts, and count the number of posts in each category
  const categoryItems = allCategories.map((categoryName) => {

    //find the category in the existing categories, if it exists, get the count, otherwise set it to 0
    const existing = existingCategories.find((c) => c.name === categoryName);
    return {
      name: categoryName,
      
      //if the category exists, use the count, otherwise set it to 0
      count: existing ? existing.count : 0,
    };
  });

  return (
    <LinkList title="Categories">
      {categoryItems.map((item) => (
        <SummaryItem
          key={item.name}
          count={item.count}
          name={item.name}
          isSelected={selectedCategory === item.name}
          link={`/category/${item.name.toLowerCase()}`}
          title={`Category / ${item.name}`}
        />
      ))}
    </LinkList>
  );
}