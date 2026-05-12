"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await fetch("/api/auth", { method: "DELETE" });
        router.refresh();
      }}
    >
      Logout
    </button>
  );
}
