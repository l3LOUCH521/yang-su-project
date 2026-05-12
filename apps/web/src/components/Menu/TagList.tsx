import { type Post } from "@repo/db/data";
import { LinkList } from "./LinkList";
import { SummaryItem } from "./SummaryItem";

// list of all tags to display, even if they have a count of 0
const allTags = ["Databases", "Back-End", "Front-End", "Optimisation", "Dev Tools"];

export function TagList({
  selectedTag,
  posts,
}: {
  selectedTag?: string;
  posts: Post[];
}) {
  
  const activePosts = posts.filter((post) => post.active);
  
  // track of how many times each tag appears
  const tagMap = new Map<string, number>();
  
  // loop through every single active blog post
  activePosts.forEach((post) => {
    const tags = post.tags.split(",").map((tag) => tag.trim());
    
    // For every tag found in this post, add +1 to the tally counter for that specific tag
    tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  
  const tagItems = allTags.map((tagName) => ({
    name: tagName,
    // check the total count of this tag, if not exist display 0
    count: tagMap.get(tagName) || 0,
  }));

  return (
    <LinkList title="Tags">
      {tagItems.map((item) => (
        <SummaryItem
          key={item.name}
          count={item.count}
          name={item.name}
          isSelected={selectedTag === item.name}
          link={`/tags/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
          title={`Tag / ${item.name}`}
        />
      ))}
    </LinkList>
  );
}