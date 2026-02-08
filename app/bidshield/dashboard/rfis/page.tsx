"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function RFIsRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("project");
  const isDemo = searchParams.get("demo") === "true";

  useEffect(() => {
    const params = projectId ? `?id=${projectId}${isDemo ? "&demo=true" : ""}` : isDemo ? "?demo=true" : "";
    router.replace(`/bidshield/dashboard/project${params}#rfis`);
  }, [projectId, isDemo, router]);

  return <div className="text-slate-400 text-center py-20">Redirecting...</div>;
}

export default function RFIsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Redirecting...</div>}>
      <RFIsRedirect />
    </Suspense>
  );
}
