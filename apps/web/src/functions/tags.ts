// import { posts, type Post } from "../components/data";

export async function tags(posts: { tags: string; active: boolean }[]) {
  // A map to store and count each unique tag
  const map = new Map<string, number>();

  // Filter out inactive posts before processing
  posts
    .filter((post) => post.active)
    .forEach((post) => {
      // Skip if the post doesn't have any tags
      if (!post.tags) return;
      
      // The tags arrive as a single comma-separated string (e.g. "React, Node, Typescript").
      // Split it into an array and trim any leading/trailing whitespace.
      const tList = post.tags.split(",").map((t) => t.trim());
      
      tList.forEach((tag) => {
        // Skip empty strings
        if (!tag) return;
        
        // Update the tag count in the map (initialize with 1 if it doesn't exist yet)
        map.set(tag, (map.get(tag) || 0) + 1);
      });
    });

  // Convert the Map to an array of objects structured as { name, count }
  const result = Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    // Sort the resulting array alphabetically by tag name
    .sort((a, b) => a.name.localeCompare(b.name));

  return result;
}
