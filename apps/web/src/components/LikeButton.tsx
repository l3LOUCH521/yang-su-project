"use client";

import { useEffect, useState } from "react";

export default function LikeButton({
  postId,
  initialLikes,
  initialHasLiked,
}: {
  postId: number;
  initialLikes: number;
  initialHasLiked: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync likes count when initialLikes changes (e.g., page reload)
  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    setHasLiked(initialHasLiked);
  }, [initialHasLiked]);

  const handleLike = async () => {
    if (isProcessing) return;

    const wasLiked = hasLiked;
    setIsProcessing(true);
    try {
      if (wasLiked) {
        const res = await fetch("/api/likes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
        if (res.ok) {
          setLikes((prevLikes) => Math.max(0, prevLikes - 1));
          setHasLiked(false);
        } else {
          console.error("Failed to unlike:", res.status);
        }
      } else {
        const res = await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
        if (res.ok) {
          setLikes((prevLikes) => prevLikes + 1);
          setHasLiked(true);
        } else {
          console.error("Failed to like:", res.status);
        }
      }
    } catch (err) {
      console.error("Like action error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <span 
      data-test-id="like-button" 
      onClick={handleLike} 
      style={{ cursor: "pointer" }}
    >
      ❤️ {likes} likes
    </span>
  );
}