"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Loader2, Sparkles } from "lucide-react";

type ExtractedData = {
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
};

export default function EmailImportDialog({ onClose }: { onClose: () => void }) {
  const extractFromEmail = useAction(api.bidInvites.extractFromEmail);
  const createFromExtraction = useMutation(api.bidInvites.createFromExtraction);
  
  const [step, setStep] = useState<"paste" | "review">("paste");
  const [emailBody, setEmailBody] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [editedData, setEditedData] = useState<ExtractedData | null>(null);

  const handleExtract = async () => {
    if (!emailBody.trim()) {
      alert("Please paste email content");
      return;
    }

    setExtracting(true);
    try {
      const extracted = await extractFromEmail({ emailBody });
      setExtractedData(extracted);
      setEditedData(extracted);
      setStep("review");
    } catch (error) {
      console.error("Extraction failed:", error);
      alert(`Failed to extract bid details: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!editedData) return;

    setSaving(true);
    try {
      await createFromExtraction({
        extractedData: editedData,
        rawEmailBody: emailBody,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save bid invite");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {step === "paste" ? "Import from Email" : "Review Extracted Data"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "paste" ? (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paste Email Content
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-mono text-sm text-slate-900 bg-white placeholder:text-slate-400"
                placeholder="Paste the full email content here...

Example:
Project: Roosevelt High School Reroof
GC: Turner Construction
Bid Due: June 15, 2026 at 2:00 PM
Contact: John Smith (john@turner.com, 555-1234)
Prebid Meeting: June 8, 2026 at 10:00 AM - Job site
Plans: https://..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">AI will extract:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                    <li>Project name & general contractor</li>
                    <li>Bid date & time</li>
                    <li>Contact information</li>
                    <li>Prebid meeting details</li>
                    <li>Plans link & notes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExtract}
                disabled={extracting || !emailBody.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extract with AI
                  </>
                )}
              </button>
            </div>
          </div>
        ) : editedData ? (
          <div className="p-6 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800">
              ✓ AI extracted the following data. Review and edit if needed before saving.
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
              <input
                type="text"
                value={editedData.projectName}
                onChange={(e) => setEditedData({ ...editedData, projectName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
              />
            </div>

            {/* GC */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">General Contractor</label>
              <input
                type="text"
                value={editedData.gc}
                onChange={(e) => setEditedData({ ...editedData, gc: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
              />
            </div>

            {/* Bid DateTime */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bid Date</label>
                <input
                  type="date"
                  value={new Date(editedData.bidDateTime).toISOString().split("T")[0]}
                  onChange={(e) => {
                    const time = new Date(editedData.bidDateTime).toISOString().split("T")[1].slice(0, 5);
                    setEditedData({
                      ...editedData,
                      bidDateTime: new Date(`${e.target.value}T${time}`).getTime(),
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bid Time</label>
                <input
                  type="time"
                  value={new Date(editedData.bidDateTime).toISOString().split("T")[1].slice(0, 5)}
                  onChange={(e) => {
                    const date = new Date(editedData.bidDateTime).toISOString().split("T")[0];
                    setEditedData({
                      ...editedData,
                      bidDateTime: new Date(`${date}T${e.target.value}`).getTime(),
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                <input
                  type="text"
                  value={editedData.contactName || ""}
                  onChange={(e) => setEditedData({ ...editedData, contactName: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editedData.contactEmail || ""}
                  onChange={(e) => setEditedData({ ...editedData, contactEmail: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editedData.contactPhone || ""}
                  onChange={(e) => setEditedData({ ...editedData, contactPhone: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Plans Link */}
            {editedData.plansLink && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plans Link</label>
                <input
                  type="url"
                  value={editedData.plansLink}
                  onChange={(e) => setEditedData({ ...editedData, plansLink: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Notes */}
            {editedData.notes && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={editedData.notes}
                  onChange={(e) => setEditedData({ ...editedData, notes: e.target.value || undefined })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-slate-900 bg-white"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep("paste")}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Bid Invite"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
