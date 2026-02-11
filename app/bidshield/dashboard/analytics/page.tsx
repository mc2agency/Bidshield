"use client";

import dynamic from "next/dynamic";

const AnalyticsContent = dynamic(() => import("./AnalyticsContent"), {
  ssr: false,
  loading: () => <div className="text-slate-400">Loading analytics...</div>,
});

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
