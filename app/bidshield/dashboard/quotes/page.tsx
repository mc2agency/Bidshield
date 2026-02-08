"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function QuotesRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("project");
  const isDemo = searchParams.get("demo") === "true";

  useEffect(() => {
    const params = projectId ? `?id=${projectId}${isDemo ? "&demo=true" : ""}` : isDemo ? "?demo=true" : "";
    router.replace(`/bidshield/dashboard/project${params}#quotes`);
  }, [projectId, isDemo, router]);

  return <div className="text-slate-400 text-center py-20">Redirecting...</div>;
}

export default function QuotesPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Redirecting...</div>}>
      <QuotesRedirect />
    </Suspense>
  );
}
