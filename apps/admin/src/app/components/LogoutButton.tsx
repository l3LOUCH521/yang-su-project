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
        setTimeout(() => {
          window.location.replace("/");
        }, 50);
      }}
    >
      Logout
    </button>
  );
}
