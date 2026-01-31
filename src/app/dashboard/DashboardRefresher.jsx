"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRefresher() {
  const router = useRouter();
  useEffect(() => {
    // Always refresh the data when this component mounts
    router.refresh();
  }, [router]);
  return null;
}
