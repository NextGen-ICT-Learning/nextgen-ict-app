"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ className = "" }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
