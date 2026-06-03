"use server";

import { client } from "@repo/db/client";
import { revalidatePath } from "next/cache";


export async function togglePostStatus(id: number, currentStatus: boolean) {
  try {
    await client.db.post.update({
      where: { id },
      data: { active: !currentStatus },
    });
    revalidatePath("/");
    return true;
  } catch (error) {
    console.error("Failed to toggle status", error);
    return false;
  }
}

export async function createPost(data: any) {
  const {id, ...rest} = data;
  const urlId = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  await client.db.post.create({
    data: {
      ...rest,
      urlId,
      active: true,
      views: 0
    }
  });
  revalidatePath("/");
  return { success: true };
}

export async function updatePost(data: any) {
  const { id, urlId, ...rest } = data;
  
  try {
    const existing = await client.db.post.findUnique({
      where: { id }
    });
    
    if (!existing) {
      throw new Error("Post not found");
    }
    
    await client.db.post.update({
      where: { id },
      data: rest
    });
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update error:", error);
    throw error;
  }
}
