"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ValidatorRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("project") || searchParams.get("id");
  const isDemo = searchParams.get("demo") === "true";

  useEffect(() => {
    if (projectId) {
      router.replace(`/bidshield/dashboard/project?id=${projectId}${isDemo ? "&demo=true" : ""}#validator`);
    } else {
      router.replace(`/bidshield/dashboard${isDemo ? "?demo=true" : ""}`);
    }
  }, [projectId, isDemo, router]);

  return <div className="text-slate-400 text-center py-20">Redirecting...</div>;
}

export default function ValidatorPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Redirecting...</div>}>
      <ValidatorRedirect />
    </Suspense>
  );
}
