export function toUrlPath(path: string) {
  // Guard clause: immediately return an empty string if nothing or an empty string is provided
  if (!path) return "";
  
  return path
    .toLowerCase() // Convert everything to lowercase first
    .replace(/[^a-z0-9\s-]/g, "") // Remove all special characters (keep only letters, numbers, spaces, and hyphens)
    .replace(/\s+/g, "-") // Replace one or more consecutive spaces with a single hyphen
    .replace(/-+/g, "-") // Collapse multiple consecutive hyphens into a single hyphen
    .replace(/^-+|-+$/g, ""); // Trim off any hyphens that might be dangling at the very start or end
}
