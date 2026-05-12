export function cx(
  ...classes: Array<
    string | Record<string, boolean | null | undefined> | null | undefined
  >
): string {
  return classes
    .flatMap(arg => {
      // If the argument is a simple string, return it directly
      if (typeof arg === "string") return arg;
      
      // If the argument is completely empty/nullish, ignore it by returning an empty array
      if (arg === null || arg === undefined) return [];
      
      // If the argument is an object, filter for keys that have explicitly `true` values
      if (typeof arg === "object") {
        return Object.entries(arg)
          .filter(([, value]) => value === true)
          .map(([key]) => key);
      }
      
      return [];
    })
    // Remove any accidental falsy values (like empty strings) resulting from the flatMap
    .filter(Boolean)
    // Combine all valid class names with a single space
    .join(" ");
}

export default cx;
