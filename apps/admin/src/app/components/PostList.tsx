"use client";

import { useState, useTransition , useEffect} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Post } from "@repo/db/data";
import styles from "./components.module.css";
import { togglePostStatus } from "../actions";

// Defines the props for the PostList component.
// It requires an array of Post objects to be passed in from the parent component.
interface PostListProps {
  initialPosts: Post[];
}

export default function PostList({ initialPosts }: PostListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticPosts, setOptimisticPosts] = useState(initialPosts);

  useEffect(() => {
    setOptimisticPosts(initialPosts);
  }, [initialPosts]);

const handleToggle = async (id: number, currentActive: boolean) => {
  setOptimisticPosts(posts => 
    posts.map(p => p.id === id ? { ...p, active: !currentActive } : p)
  );
  await togglePostStatus(id, currentActive);
  router.refresh();
};

  const formatDate = (date: Date | string) => {
    return `Posted on ${new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  // filter by title/content
  const [search, setSearch] = useState("");

  // Filter by Tag
  const [tag, setTag] = useState("");
  // Shows both active and inactive posts by default
  const [visibility, setVisibility] = useState("all");

  // Filter by Date Created (on or after)
  const [dateFilter, setDateFilter] = useState("");  
  
  // State to manage sorting title or date and default is date
  const [sortBy, setSortBy] = useState<"title" | "date">("date");

  // State to manage sorting asc or desc and default is desc
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // filtering system
  const filteredPosts = optimisticPosts.filter((post) => {
    // filter by title or content
    const matchSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase());
    
    // filter by tag
    const cleanSearchTag = tag.toLowerCase().replace(/[#\s-]/g, "");
    const cleanPostTags = post.tags.toLowerCase().replace(/[\s-]/g, "");
    const matchTag = tag === "" || cleanPostTags.includes(cleanSearchTag);

    // show posts based on active/inactive status
    let matchVisibility = true;
    if (visibility === "active") matchVisibility = post.active === true;
    if (visibility === "inactive") matchVisibility = post.active === false;

    // filter by date created on or after
    let matchDate = true;
    if (dateFilter) {
      const postDateObj = new Date(post.date);
      const postYear = postDateObj.getFullYear();
      const postMonth = String(postDateObj.getMonth() + 1);
      const postDay = String(postDateObj.getDate());
      const formattedPostDate = `${postYear}-${postMonth}-${postDay}`;

      // 
      matchDate = formattedPostDate >= dateFilter;
    }

    // Returns true only if ALL applied filters are met (combining filters requirement)
    return matchSearch && matchTag && matchVisibility && matchDate;
  });

  // Sorting posts based on the selected criteria
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "title") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }
  });

  return (
    <div className={styles.flexColGap6}>
      {/* Filters Section */}
          <div className={styles.card}>
            <h2 className={styles.title}>Filter Posts</h2>
            <div className={styles.gridCols4}>
              <div>
                <label htmlFor="filter-content" className={styles.label}>Filter by Content:</label>
                <input
                  id="filter-content"
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div>
                <label htmlFor="filter-tag" className={styles.label}>Filter by Tag:</label>
                <input
                  id="filter-tag"
                  type="text"
                  placeholder="E.g., React"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div>
                <label htmlFor="filter-date" className={styles.label}>Filter by Date Created:</label>
                <input
                  id="filter-date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div>
                <label className={styles.label}>Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className={styles.input}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sorter & Actions Section */}
          <div className={styles.flexBetween}>
            <div className={styles.flexGap4}>
              <label htmlFor="sort-items" className={styles.label}>Sort By:</label>
              <select
                id="sort-items"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-");
                  setSortBy(newSortBy as "title" | "date");
                  setSortOrder(newSortOrder as "asc" | "desc");
                }}
                className={styles.input}
              >
                <option value="date-desc">Descending</option>
                <option value="date-asc">Ascending</option>
                <option value="title-asc">Name (A-Z)</option>
                <option value="title-desc">Name (Z-A)</option>
              </select>
            </div>

            <Link
              href="/posts/create"
              className={styles.buttonSuccess}
            >
              Create Post
            </Link>
          </div>

      {/* Post List */}
      <div className={styles.flexColGap6}>
        {sortedPosts.length === 0 ? (
          <p className={styles.emptyState}>No posts found.</p>
        ) : (
          sortedPosts.map((post) => (
            <article
              key={post.id}
              className={styles.postItem}
            >
              <div className={styles.imageContainer}>
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className={styles.image}
                />
              </div>

              <div className={styles.postContent}>
                <div>
                  <div className={styles.flexBetween}>
                    <Link href={`/post/${post.urlId}`}>
                      <h3 className={styles.postTitle} title="Modify Post">{post.title}</h3>
                    </Link>
                    <button
                      onClick={() => handleToggle(post.id, post.active)}
                      className={`${styles.statusBadge} ${
                        post.active ? styles.statusActive : styles.statusInactive
                      }`}
                      title="Click to toggle active status"
                      disabled={isPending}
                    >
                      {post.active ? "Active" : "Inactive"}
                    </button>
                  </div>
                  
                  <p className={styles.postDate}>
                    {formatDate(post.date)}
                  </p>
                </div>

                <div className={styles.postMeta}>
                  <div className={styles.categoryBadge}>
                    <span>{post.category}</span>
                  </div>
                  <div className={styles.tagsContainer}>
                    {post.tags.split(",").map((tag, i, arr) => (
                      <span key={tag}>
                        #{tag.trim()}{i < arr.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
