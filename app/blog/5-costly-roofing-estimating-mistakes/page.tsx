import { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "5 Costly Roofing Estimating Mistakes (And How to Avoid Them)",
  description: "Learn the most common roofing estimating errors that cost contractors thousands. From missed labor burden to wrong material coverage rates — fix these before your next bid.",
  keywords: "roofing estimating mistakes, bid errors, roofing contractor tips, estimating accuracy, construction bidding",
  openGraph: {
    title: "5 Costly Roofing Estimating Mistakes (And How to Avoid Them)",
    description: "Learn the most common roofing estimating errors that cost contractors thousands.",
    type: "article",
    publishedTime: "2026-01-28",
  },
};

export default function BlogPost() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-400">5 Costly Estimating Mistakes</span>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-2 text-sm text-emerald-400 mb-4">
              <span>📊 Estimating</span>
              <span className="text-slate-600">•</span>
              <span>8 min read</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              5 Costly Roofing Estimating Mistakes (And How to Avoid Them)
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              One wrong number can turn a profitable job into a nightmare. Here are the mistakes experienced estimators still make — and the systems to prevent them.
            </p>
            <div className="flex items-center gap-4 mt-6 text-sm text-slate-500">
              <span>January 28, 2026</span>
              <span>•</span>
              <span>Updated for 2026</span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <p>
              I've reviewed hundreds of roofing estimates over my career. The pattern is clear: most estimating errors aren't from lack of knowledge — they're from lack of systems.
            </p>
            <p>
              Here are the five mistakes I see cost contractors the most money, and how to fix each one.
            </p>

            <h2>1. Forgetting Full Labor Burden</h2>
            <p>
              <strong>The mistake:</strong> Using your worker's hourly rate ($25/hr) as your labor cost.
            </p>
            <p>
              <strong>The reality:</strong> That $25/hr employee actually costs you $35-40/hr when you factor in:
            </p>
            <ul>
              <li>Workers' Compensation (15-35% for roofing)</li>
              <li>FICA/Social Security (7.65%)</li>
              <li>Unemployment insurance (3-6%)</li>
              <li>Health insurance, PTO, benefits</li>
            </ul>
            <p>
              <strong>The fix:</strong> Calculate your <em>fully burdened</em> labor rate once, then use it for every estimate. A simple formula:
            </p>
            <pre className="bg-slate-800 p-4 rounded-lg text-sm overflow-x-auto">
{`Burdened Rate = Base Wage × (1 + WC% + FICA% + UI% + Benefits%)

Example: $25 × 1.45 = $36.25/hr actual cost`}
            </pre>
            <p>
              <Link href="/resources/labor-costs" className="text-emerald-400 hover:text-emerald-300">
                → Read our full guide on labor burden calculation
              </Link>
            </p>

            <h2>2. Trusting Plan Graphics Over Equipment Schedules</h2>
            <p>
              <strong>The mistake:</strong> Measuring curb sizes from the roof plan drawings.
            </p>
            <p>
              <strong>The reality:</strong> Those little squares on the roof plan are often not to scale. The mechanical equipment schedule has the actual dimensions.
            </p>
            <p>
              I've seen estimators bid curb flashing for 30 "small" RTUs, only to find they're all 8'x10' monsters. That's a $15,000 swing on one line item.
            </p>
            <p>
              <strong>The fix:</strong> <em>Always</em> cross-reference the mechanical schedule (usually M-001 or similar) for:
            </p>
            <ul>
              <li>RTU curb dimensions</li>
              <li>Exhaust fan sizes</li>
              <li>Equipment weights (affects structural)</li>
              <li>Future equipment provisions</li>
            </ul>

            <h2>3. Wrong Material Coverage Rates</h2>
            <p>
              <strong>The mistake:</strong> Using manufacturer's "ideal" coverage rates.
            </p>
            <p>
              <strong>The reality:</strong> Manufacturers quote coverage for perfect conditions. Your job has:
            </p>
            <ul>
              <li>Odd angles requiring more cuts</li>
              <li>Waste from roll ends</li>
              <li>Field conditions (wind, damage)</li>
              <li>Overlaps and seams</li>
            </ul>
            <p>
              <strong>The fix:</strong> Build waste factors into your system:
            </p>
            <ul>
              <li>Membrane: 5-10% waste</li>
              <li>Insulation: 3-5% waste</li>
              <li>Sheet metal: 10-15% waste (complex details = higher)</li>
              <li>Fasteners: 10% overage minimum</li>
            </ul>
            <p>
              Better to return unused material than emergency-order at premium prices mid-job.
            </p>

            <h2>4. Missing Scope in Specifications</h2>
            <p>
              <strong>The mistake:</strong> Only reading Division 7 (Roofing) in the specs.
            </p>
            <p>
              <strong>The reality:</strong> Your scope is scattered across multiple divisions:
            </p>
            <ul>
              <li><strong>Division 1:</strong> General conditions, submittal requirements</li>
              <li><strong>Division 5:</strong> Metal decking coordination</li>
              <li><strong>Division 6:</strong> Wood blocking requirements</li>
              <li><strong>Division 7:</strong> Roofing (obviously)</li>
              <li><strong>Division 8:</strong> Roof hatches, skylights</li>
              <li><strong>Division 22:</strong> Plumbing — drain bodies, who supplies?</li>
              <li><strong>Division 23:</strong> HVAC — curb responsibilities</li>
            </ul>
            <p>
              <strong>The fix:</strong> Create a spec review checklist. Hit every division that might touch your work. When in doubt, clarify with an RFI before bid day.
            </p>

            <h2>5. No System for Tracking Quote Validity</h2>
            <p>
              <strong>The mistake:</strong> Using a vendor quote from 3 months ago.
            </p>
            <p>
              <strong>The reality:</strong> Material prices change. That insulation quote from October might be 15% higher now. If you win the job at the old price, you eat the difference.
            </p>
            <p>
              <strong>The fix:</strong> Track every quote with:
            </p>
            <ul>
              <li>Vendor name and contact</li>
              <li>Quote date</li>
              <li>Expiration date (usually 30 days)</li>
              <li>Products and quantities</li>
              <li>Price locks and escalation clauses</li>
            </ul>
            <p>
              Before submitting any bid, verify your material quotes are still valid. A 2-minute phone call can save thousands.
            </p>

            <h2>The Common Thread: Systems Beat Memory</h2>
            <p>
              Notice that none of these mistakes are about math skills or roofing knowledge. They're about <em>having systems</em> that catch errors before they become expensive problems.
            </p>
            <p>
              The best estimators I know aren't necessarily the smartest — they're the most systematic. They use checklists. They have templates that force them to consider every line item. They don't trust their memory.
            </p>
            <p>
              That's why we built BidShield with these systems baked in:
            </p>
            <ul>
              <li>Labor burden calculator built into every template</li>
              <li>Waste factors pre-configured by material type</li>
              <li>Spec review checklists</li>
              <li>Quote tracking with expiration alerts</li>
              <li>Proposal generation that pulls from your validated numbers</li>
            </ul>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 my-8">
              <h3 className="text-xl font-bold text-white mt-0">Ready to Estimate Smarter?</h3>
              <p className="text-slate-300 mb-4">
                MC2 templates have helped 500+ roofing estimators eliminate these mistakes and win more profitable bids.
              </p>
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors no-underline"
              >
                View Templates →
              </Link>
            </div>

            <h2>Quick Reference Checklist</h2>
            <p>Print this and tape it to your monitor:</p>
            <ul>
              <li>☐ Labor burden calculated (not just base wage)</li>
              <li>☐ Equipment sizes from mechanical schedule (not plans)</li>
              <li>☐ Waste factors applied to all materials</li>
              <li>☐ All spec divisions reviewed (not just Div 7)</li>
              <li>☐ Vendor quotes valid and not expired</li>
              <li>☐ RFIs submitted for any unclear scope</li>
              <li>☐ Final number reviewed by second set of eyes</li>
            </ul>

            <p>
              Good luck on your next bid. Estimate smart, win profitable work.
            </p>
          </div>

          {/* Author */}
          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-xl font-bold">
                M
              </div>
              <div>
                <p className="font-semibold text-white">BidShield Team</p>
                <p className="text-sm text-slate-400">Tools and templates for commercial roofing professionals</p>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          <div className="mt-12 pt-8 border-t border-slate-800">
            <h3 className="text-xl font-bold text-white mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/blog/labor-burden-calculation-guide" className="block p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                <p className="font-medium text-white">Labor Burden Calculation Guide</p>
                <p className="text-sm text-slate-400">The complete breakdown of true labor costs</p>
              </Link>
              <Link href="/blog/roofing-estimating-software-comparison" className="block p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                <p className="font-medium text-white">Roofing Estimating Software Comparison</p>
                <p className="text-sm text-slate-400">Find the right tool for your business</p>
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
