import { client } from "@repo/db/client";
import { AppLayout } from "../components/Layout/AppLayout";
import { Main } from "../components/Main";
import styles from "./page.module.css";
export default async function Home() {
  const rawPosts = await client.db.post.findMany({
    where: { active: true },
    orderBy: { date: "desc" },
    include: { Likes: true }
  });

  const posts = rawPosts.map(post => ({
    ...post,
    likes: post.Likes.length
  }));

  return (
    <AppLayout>
      <Main posts={posts} className={styles.main} />
    </AppLayout>
  );
}
