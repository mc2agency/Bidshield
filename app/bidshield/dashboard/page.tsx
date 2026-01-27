"use client";

import { demoProjects, getRFICount } from "@/lib/bidshield/demo-data";
import { useRouter } from "next/navigation";

export default function BidShieldDashboardPage() {
  const router = useRouter();
  const rfiCount = getRFICount();

  return (
    <div className="flex flex-col gap-6">
      {/* Active Bids */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-5">Active Bids</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push("/bidshield/dashboard/checklist")}
              className="bg-slate-800 rounded-xl p-5 border border-slate-700 cursor-pointer hover:border-slate-600 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[17px] font-semibold text-white">{project.name}</h3>
                <span
                  className={`text-[11px] font-medium px-2.5 py-1 rounded text-white ${
                    project.status === "In Progress" ? "bg-emerald-600" : "bg-amber-600"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-3">{project.location}</p>
              <div className="flex justify-between text-[13px] text-slate-500 mb-2">
                <span>GC: {project.gc}</span>
                <span>{project.sqft.toLocaleString()} SF</span>
              </div>
              <div className="text-[13px] text-slate-500 mb-3">
                Bid Date: {project.bid_date}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="text-[13px] font-semibold text-emerald-500">
                  {project.progress}%
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.assemblies.map((assembly, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-slate-700 text-slate-400 px-2 py-1 rounded"
                  >
                    {assembly}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* New Bid Card */}
          <div className="rounded-xl p-5 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:border-slate-600 hover:text-slate-400 transition-all min-h-[200px]">
            <span className="text-4xl mb-2">+</span>
            <span>New Bid</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: "2", label: "Active Bids", color: "text-white" },
          { value: "3", label: "Quotes Expiring", color: "text-red-500" },
          { value: String(rfiCount), label: "Open RFIs", color: "text-amber-500" },
          { value: "$2.4M", label: "Pipeline Value", color: "text-emerald-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800 rounded-xl p-6 text-center border border-slate-700"
          >
            <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[13px] text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-5">⚠️ Alerts</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-lg border-l-4 border-red-500 text-sm">
            <span>🔴</span>
            <div>
              <strong>AquaGuard quote expired</strong> - Last quote 6/3/24. Request new
              waterproofing pricing for Harbor Point Tower.
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-lg border-l-4 border-amber-500 text-sm">
            <span>🟡</span>
            <div>
              <strong>SealRight/Northeast quote expires 12/21</strong> - Verify air barrier
              pricing before bid submission.
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-lg border-l-4 border-amber-500 text-sm">
            <span>🟡</span>
            <div>
              <strong>{rfiCount} RFIs pending response</strong> - Including drain schedule and
              sidewalk bridge requirement.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
