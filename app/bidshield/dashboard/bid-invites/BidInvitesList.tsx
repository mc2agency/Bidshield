"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { Calendar, User, Mail, Phone, ExternalLink, Building2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type BidInvite = {
  _id: Id<"bidInvites">;
  projectName: string;
  gc: string;
  bidDateTime: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  prebidMeeting?: {
    dateTime: number;
    location: string;
  };
  plansLink?: string;
  notes?: string;
  status: "new" | "pursuing" | "pass" | "converted";
  projectId?: Id<"bidshield_projects">;
  createdAt: number;
};

export default function BidInvitesList({ invites }: { invites: BidInvite[] }) {
  const router = useRouter();
  const updateStatus = useMutation(api.bidInvites.updateStatus);
  const [expandedId, setExpandedId] = useState<Id<"bidInvites"> | null>(null);

  const handleStatusChange = async (inviteId: Id<"bidInvites">, newStatus: BidInvite["status"]) => {
    try {
      await updateStatus({ id: inviteId, status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  const handleCreateProject = (invite: BidInvite) => {
    // Navigate to create project page with pre-filled data
    const params = new URLSearchParams({
      fromInvite: invite._id,
      name: invite.projectName,
      gc: invite.gc || "",
      bidDate: new Date(invite.bidDateTime).toISOString().split("T")[0],
      bidTime: new Date(invite.bidDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    });
    router.push(`/bidshield/dashboard?${params.toString()}`);
  };

  const getStatusColor = (status: BidInvite["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pursuing":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pass":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "converted":
        return "bg-purple-100 text-purple-700 border-purple-200";
    }
  };

  const getDaysUntilBid = (bidDateTime: number) => {
    const now = Date.now();
    const diff = bidDateTime - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: "Past due", urgent: true };
    if (days === 0) return { text: "Due today", urgent: true };
    if (days === 1) return { text: "Due tomorrow", urgent: true };
    if (days <= 3) return { text: `${days} days`, urgent: true };
    return { text: `${days} days`, urgent: false };
  };

  return (
    <div className="space-y-3">
      {invites.map((invite) => {
        const daysUntil = getDaysUntilBid(invite.bidDateTime);
        const isExpanded = expandedId === invite._id;

        return (
          <div
            key={invite._id}
            className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors"
          >
            {/* Main row */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-slate-900 truncate">
                      {invite.projectName}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(invite.status)}`}>
                      {invite.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {invite.gc}
                    </div>
                    <div className={`flex items-center gap-1.5 ${daysUntil.urgent ? "text-red-600 font-medium" : ""}`}>
                      <Calendar className="w-4 h-4" />
                      {new Date(invite.bidDateTime).toLocaleDateString()} · {daysUntil.text}
                    </div>
                    {invite.contactName && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        {invite.contactName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {invite.status === "converted" && invite.projectId ? (
                    <button
                      onClick={() => router.push(`/bidshield/dashboard/project/${invite.projectId}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      View Project
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      {invite.status !== "pursuing" && (
                        <button
                          onClick={() => handleStatusChange(invite._id, "pursuing")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Pursue
                        </button>
                      )}
                      {invite.status !== "pass" && (
                        <button
                          onClick={() => handleStatusChange(invite._id, "pass")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Pass
                        </button>
                      )}
                      {(invite.status === "new" || invite.status === "pursuing") && (
                        <button
                          onClick={() => handleCreateProject(invite)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Create Project
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : invite._id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {invite.contactEmail && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a href={`mailto:${invite.contactEmail}`} className="hover:text-emerald-600 underline">
                        {invite.contactEmail}
                      </a>
                    </div>
                  )}
                  {invite.contactPhone && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a href={`tel:${invite.contactPhone}`} className="hover:text-emerald-600">
                        {invite.contactPhone}
                      </a>
                    </div>
                  )}
                  {invite.prebidMeeting && (
                    <div className="md:col-span-2 p-3 bg-white border border-slate-200 rounded">
                      <p className="font-medium text-slate-900 mb-1">Prebid Meeting</p>
                      <p className="text-slate-600">
                        {new Date(invite.prebidMeeting.dateTime).toLocaleString()} · {invite.prebidMeeting.location}
                      </p>
                    </div>
                  )}
                  {invite.plansLink && (
                    <div className="md:col-span-2">
                      <a
                        href={invite.plansLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Plans
                      </a>
                    </div>
                  )}
                  {invite.notes && (
                    <div className="md:col-span-2 p-3 bg-white border border-slate-200 rounded">
                      <p className="font-medium text-slate-900 mb-1">Notes</p>
                      <p className="text-slate-600 whitespace-pre-wrap">{invite.notes}</p>
                    </div>
                  )}
                  <div className="md:col-span-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                    Added {formatDistanceToNow(invite.createdAt, { addSuffix: true })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
