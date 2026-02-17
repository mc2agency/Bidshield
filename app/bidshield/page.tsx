"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BidShieldRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
      <div className="text-slate-900 text-lg">Redirecting...</div>
    </div>
  );
}
