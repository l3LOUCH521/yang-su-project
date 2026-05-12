import { isLoggedIn } from "../../../utils/auth";
import { redirect } from "next/navigation";
import PostForm from "../../components/PostForm";
import Link from "next/link";
import styles from "./page.module.css";
import { createPost } from "../../actions";

export default async function CreatePostPage() {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    redirect("/");
  }

  async function handleCreate(data: any) {
    "use server";
    await createPost(data);
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            Back to Dashboard
          </Link>
          <h1 className={styles.pageTitle}>Create New Post</h1>
          <div className={styles.spacer}></div>
        </header>

        <PostForm onSubmit={handleCreate} />
      </div>
    </main>
  );
}