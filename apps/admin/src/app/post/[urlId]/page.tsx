import { isLoggedIn } from "../../../utils/auth";
import { redirect } from "next/navigation";
import PostForm from "../../components/PostForm";
import { client } from "@repo/db/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { updatePost } from "../../actions";

export default async function ModifyPostPage({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const resolvedParams = await params;
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    redirect("/");
  }

  const post = await client.db.post.findUnique({
    where: { urlId: resolvedParams.urlId }
  });

  if (!post) {
    notFound();
  }

  async function handleUpdate(data: any) {
    "use server";
    await updatePost(post!.id, data);
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            &larr; Back to Dashboard
          </Link>
          <h1 className={styles.title}>Modify Post #{post.id}</h1>
          <div className={styles.spacer}></div>
        </header>

        <PostForm
          initialData={{
            title: post.title,
            description: post.description,
            content: post.content,
            tags: post.tags,
            imageUrl: post.imageUrl,
            category: post.category,
          }}
          onSubmit={handleUpdate}
        />
      </div>
    </main>
  );
}