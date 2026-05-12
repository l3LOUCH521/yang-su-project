import { client } from "@repo/db/client";
import { isLoggedIn } from "../utils/auth";
import styles from "./page.module.css";
import PostList from "./components/PostList";
import { LogoutButton } from "./components/LogoutButton";

export default async function Home() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return (
      <main className={styles.loginScreen}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>Sign in to your account</h1>
          <form action="/api/auth" method="POST" className={styles.loginForm}>
            <div>
              <label htmlFor="password" className={styles.inputLabel}>
                Password
              </label>
              <input 
                type="password" 
                id="password"
                name="password" 
                placeholder="Enter password" 
                required 
                className={styles.inputField}
              />
            </div>
            <button 
              type="submit"
              className={styles.submitButton}
            >
              Sign In
            </button>
          </form>
        </div>
      </main>
    );
  }

  //query post with orders and likes count
  const rawPosts = await client.db.post.findMany({
    orderBy: { date: "desc" },
    include: { Likes: true },
  });

  //map the posts to include the likes count
  const posts = rawPosts.map(({ Likes, ...post }) => ({
    ...post,
    likes: Likes.length,
  }));

  return (
    <main className={styles.adminScreen}>
      <div className={styles.adminContainer}>
        <header className={styles.adminHeader}>
          <h1 className={styles.adminTitle}>Admin of Full Stack Blog</h1>
          <LogoutButton className={styles.logoutButton} />
        </header>
        <PostList initialPosts={posts} />
      </div>
    </main>
  );
}
