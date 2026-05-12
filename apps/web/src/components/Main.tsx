"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Post } from "@repo/db/data";
import BlogList from "./Blog/List";

export function Main({
  posts,
  className,
}: {
  posts: Post[];
  className?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <main className={className}>
      <BlogList posts={posts} />
    </main>
  );
}