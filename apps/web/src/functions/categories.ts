export function categories<T>(
  // Input: Array of posts 
  posts: { category: string; active: boolean }[],
): { name: string; count: number }[] { // Output: Array of categories with their post counts
  return posts
    // Keep only active posts
    .filter((p) => p.active)
    
    // Sort categories alphabetically (A-Z)
    .sort((a, b) => a.category.localeCompare(b.category))
    
    // Group and count the posts by category
    .reduce(
      (acc, post) => {
        // Check if the category is already in the accumulator array
        const category = acc.find((c) => c.name === post.category);
        
        if (category) {
          // Increment the count if the category exists
          category.count++;
        } else {
          // Add the new category with an initial count of 1
          acc.push({ name: post.category, count: 1 });
        }
        
        return acc;
      },
      // Initialize the accumulator as an empty array
      [] as { name: string; count: number }[],
    );
}
