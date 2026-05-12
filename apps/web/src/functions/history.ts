export function history(posts: { date: Date | string; active: boolean }[]) {
  // A map to store the aggregated counts using "YYYY-MM" as the key
  const historyMap = new Map<
    string,
    { count: number; year: number; month: number }
  >();

  // Only process posts that are marked as active
  posts
    .filter((post) => post.active)
    .forEach((post) => {
      // Parse the date string or object into a proper Date
      const date = new Date(post.date);
      const year = date.getFullYear();
      
      // getMonth() is 0-indexed (0-11), adding 1 makes it 1-indexed (1-12)
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;

      // Increment count if the month configuration exists, otherwise initialize it
      if (historyMap.has(key)) {
        historyMap.get(key)!.count++;
      } else {
        historyMap.set(key, { count: 1, year, month });
      }
    });

  // Convert the aggregated map values back into an array and sort them
  return Array.from(historyMap.values()).sort((a, b) => {
    // Sort primarily by year (descending: newest years first)
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    // If years match, sort secondarily by month (descending: newest months first)
    return b.month - a.month;
  });
}
