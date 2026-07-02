"use client";

import { Suspense, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/nextjs";
import { Plus, Mail } from "lucide-react";
import BidInvitesList from "./BidInvitesList";
import ManualBidInviteForm from "./ManualBidInviteForm";
import EmailImportDialog from "./EmailImportDialog";

function BidInvitesContent() {
  const { user } = useUser();
  const [showManualForm, setShowManualForm] = useState(false);
  const [showEmailImport, setShowEmailImport] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "pursuing" | "pass" | "converted">("all");

  const queryArgs = user?.id 
    ? (statusFilter === "all" ? {} : { status: statusFilter })
    : "skip";
  
  const allInvites = useQuery(api.bidInvites.list, queryArgs as any);
  const upcomingInvites = useQuery(api.bidInvites.upcoming, user?.id ? {} : "skip");

  // Show loading state while queries are undefined
  const isLoading = allInvites === undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bid Invites</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track incoming bid opportunities before creating projects
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEmailImport(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 rounded-lg font-medium text-sm transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Import
          </button>
          <button
            onClick={() => setShowManualForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Bid Invite
          </button>
        </div>
      </div>

      {/* Upcoming deadline alert */}
      {upcomingInvites && upcomingInvites.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 text-amber-600">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {upcomingInvites.length} {upcomingInvites.length === 1 ? "bid" : "bids"} due in the next 7 days
              </p>
              <p className="text-sm text-amber-700 mt-1">
                {upcomingInvites.filter((inv) => !inv.projectId).length} not converted to projects yet
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { value: "all", label: "All" },
          { value: "new", label: "New" },
          { value: "pursuing", label: "Pursuing" },
          { value: "pass", label: "Pass" },
          { value: "converted", label: "Converted" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value as typeof statusFilter)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === tab.value
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bid invites list */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : allInvites.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium mb-2">No bid invites yet</p>
          <p className="text-sm text-slate-500">
            Add your first bid invite manually or import from email
          </p>
        </div>
      ) : (
        <BidInvitesList invites={allInvites} />
      )}

      {/* Modals */}
      {showManualForm && (
        <ManualBidInviteForm onClose={() => setShowManualForm(false)} />
      )}
      {showEmailImport && (
        <EmailImportDialog onClose={() => setShowEmailImport(false)} />
      )}
    </div>
  );
}

export default function BidInvitesPage() {
  const { isLoaded, isSignedIn } = useAuth();

  // Wait for auth to load
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  // Auth handled by layout redirect, but double-check
  if (!isSignedIn) {
    return null;
  }

  return (
    <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
      <BidInvitesContent />
    </Suspense>
  );
}
