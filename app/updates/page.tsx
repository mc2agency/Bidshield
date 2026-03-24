import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Updates',
  description: 'Latest updates to BidShield tools and templates. New features, improvements, and additions to the tool vault.',
  keywords: 'BidShield updates, estimating tools updates, template updates, changelog',
  alternates: { canonical: 'https://www.bidshield.co/updates' },
};

export default function UpdatesPage() {
  const updates = [
    {
      date: 'March 2026',
      version: '1.5',
      items: [
        { type: 'new', title: 'Alternate Pricing Support', description: 'Track and manage bid alternates — additive and deductive — directly within the project workflow' },
        { type: 'new', title: 'Pre-bid Meeting Tracker', description: 'Log pre-bid meeting notes, mandatory attendance requirements, and key clarifications in one place' },
        { type: 'improved', title: 'Bid Summary', description: 'Alternate line items now roll up cleanly in the full Bid Summary with $/SF breakdowns' },
      ]
    },
    {
      date: 'February 2026',
      version: '1.4',
      items: [
        { type: 'new', title: 'Submission Tracking', description: 'Record where, when, and how each bid was submitted — BuildingConnected, email, hand-delivered — with timestamps' },
        { type: 'new', title: 'Bid Bond Tracking', description: 'Track bid bond requirements, amounts, surety info, and submission status per project' },
        { type: 'improved', title: 'GC Bid Form Prep', description: 'AI Auto-Confirm now cross-references bid bond fields against GC requirements automatically' },
      ]
    },
    {
      date: 'January 2026',
      version: '1.3',
      items: [
        { type: 'new', title: 'AI-Powered Material Reconciliation', description: 'Upload vendor quote PDFs and AI extracts line items, quantities, and unit prices — auto-matched to your scope' },
        { type: 'improved', title: 'Labor Verification', description: 'AI scope analysis now flags labor rate mismatches against regional benchmarks' },
        { type: 'fixed', title: 'Addendum Impact Check', description: 'Fixed edge case where addenda issued after invitation were not flagged as affecting submitted scope' },
      ]
    },
    {
      date: 'December 2025',
      version: '1.2',
      items: [
        { type: 'new', title: '18-Phase Bid QA Checklist', description: 'Expanded the core checklist from 5 phases to a full 18-phase structured workflow covering every stage from plan receipt to post-submission' },
        { type: 'improved', title: 'Bid Readiness Score', description: 'Scoring now weighted by phase criticality — Phase 10 Addenda Review and Phase 15 Pre-Submission are highest weight' },
        { type: 'improved', title: 'Decision Log', description: 'Unlimited entries on Pro; improved filtering by phase and decision type' },
      ]
    },
    {
      date: 'November 2025',
      version: '1.1',
      items: [
        { type: 'new', title: 'Scope Tracker', description: 'Explicitly mark every scope item as Included, Excluded, or By Others — exportable for GC qualification letters' },
        { type: 'new', title: 'Vendor Address Book', description: 'Store supplier and sub contacts with trade type, quote history, and preferred status' },
        { type: 'improved', title: 'Project Dashboard', description: 'At-a-glance view of all active projects with bid dates, readiness scores, and outstanding items' },
      ]
    },
    {
      date: 'October 2025',
      version: '1.0',
      items: [
        { type: 'new', title: 'BidShield Launch', description: 'Initial release of the bid workflow tool for commercial roofing estimators — 134-item checklist, scope tracker, and bid readiness scoring' },
        { type: 'new', title: 'Free Plan', description: '1 active project, full checklist access, and RFI/Addenda tracking at no cost' },
        { type: 'new', title: '14-Day Free Trial', description: 'Full Pro access for 14 days, no credit card required' },
      ]
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Product
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Updates</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto">
              We continuously improve our tools based on user feedback and industry changes.
              All updates are free for existing customers.
            </p>
          </div>
        </div>
      </section>

      {/* Updates Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {updates.map((update, index) => (
              <div key={index} className="relative">
                {/* Timeline line */}
                {index < updates.length - 1 && (
                  <div className="absolute left-[19px] top-12 bottom-0 w-0.5 bg-slate-200" />
                )}

                {/* Date header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {update.version}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{update.date}</h2>
                    <p className="text-sm text-slate-500">Version {update.version}</p>
                  </div>
                </div>

                {/* Update items */}
                <div className="ml-14 space-y-4">
                  {update.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                      <div className="flex items-start gap-3">
                        <UpdateBadge type={item.type as 'new' | 'improved' | 'fixed'} />
                        <div>
                          <h3 className="font-bold text-slate-900">{item.title}</h3>
                          <p className="text-slate-600 text-sm mt-1">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notification Signup */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Get Update Notifications
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Receive an email when we release new tools or major updates.
            No spam, just product announcements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Subscribe to Updates
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Get Lifetime Updates
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            All tool purchases include free lifetime updates. Buy once, benefit forever.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-colors"
          >
            Browse Tools
          </Link>
        </div>
      </section>
    </main>
  );
}

function UpdateBadge({ type }: { type: 'new' | 'improved' | 'fixed' }) {
  const styles = {
    new: 'bg-emerald-100 text-emerald-700',
    improved: 'bg-blue-100 text-blue-700',
    fixed: 'bg-amber-100 text-amber-700',
  };

  const labels = {
    new: 'New',
    improved: 'Improved',
    fixed: 'Fixed',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}
