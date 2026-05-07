"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X } from "lucide-react";

export default function ManualBidInviteForm({ onClose }: { onClose: () => void }) {
  const createManual = useMutation(api.bidInvites.createManual);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    gc: "",
    bidDate: "",
    bidTime: "14:00",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    prebidDate: "",
    prebidTime: "",
    prebidLocation: "",
    plansLink: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bidDateTime = new Date(`${formData.bidDate}T${formData.bidTime}`).getTime();
      
      const prebidMeeting = formData.prebidDate && formData.prebidTime ? {
        dateTime: new Date(`${formData.prebidDate}T${formData.prebidTime}`).getTime(),
        location: formData.prebidLocation || "TBD",
      } : undefined;

      await createManual({
        projectName: formData.projectName,
        gc: formData.gc,
        bidDateTime,
        contactName: formData.contactName || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        prebidMeeting,
        plansLink: formData.plansLink || undefined,
        notes: formData.notes || undefined,
      });

      onClose();
    } catch (error) {
      console.error("Failed to create bid invite:", error);
      alert("Failed to create bid invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Add Bid Invite</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
              placeholder="Roosevelt High School Reroof"
            />
          </div>

          {/* General Contractor */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              General Contractor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.gc}
              onChange={(e) => setFormData({ ...formData, gc: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
              placeholder="Turner Construction"
            />
          </div>

          {/* Bid Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bid Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.bidDate}
                onChange={(e) => setFormData({ ...formData, bidDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bid Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.bidTime}
                onChange={(e) => setFormData({ ...formData, bidTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                placeholder="555-1234"
              />
            </div>
          </div>

          {/* Prebid Meeting */}
          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm font-medium text-slate-700 mb-3">Prebid Meeting (optional)</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.prebidDate}
                  onChange={(e) => setFormData({ ...formData, prebidDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Time</label>
                <input
                  type="time"
                  value={formData.prebidTime}
                  onChange={(e) => setFormData({ ...formData, prebidTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.prebidLocation}
                  onChange={(e) => setFormData({ ...formData, prebidLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                  placeholder="Job site"
                />
              </div>
            </div>
          </div>

          {/* Plans Link */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Plans Link
            </label>
            <input
              type="url"
              value={formData.plansLink}
              onChange={(e) => setFormData({ ...formData, plansLink: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
              placeholder="https://..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-slate-900 bg-white placeholder:text-slate-400"
              placeholder="Additional details..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Bid Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
