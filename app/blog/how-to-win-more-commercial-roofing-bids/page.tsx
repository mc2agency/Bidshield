import Link from 'next/link';

export const metadata = {
  title: 'How to Win More Commercial Roofing Bids: 6 Strategies That Work [2026]',
  description: 'Proven strategies to improve your commercial roofing bid win rate — from tracking cost per SF by GC to the pre-submission review that catches errors before they cost you the job.',
};

export default function HowToWinMoreCommercialRoofingBidsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/blog" className="text-blue-300 hover:text-white transition-colors">
              ← Back to Blog
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm mb-4">
            <span className="px-3 py-1 bg-blue-700 rounded-full">Business</span>
            <span>March 2, 2026</span>
            <span>10 min read</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            How to Win More Commercial Roofing Bids: 6 Strategies That Work
          </h1>
          <p className="text-xl text-blue-100">
            Practical strategies to improve your win rate — from tracking cost per SF to the pre-submission review that separates the contractors GCs call back from the ones they forget.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center font-bold text-lg">MC</div>
            <div>
              <div className="font-semibold">MC2 Estimating</div>
              <div className="text-sm text-blue-200">Professional Estimating Tools</div>
            </div>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-50 rounded-xl p-6 mb-12 border-l-4 border-blue-600">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Table of Contents</h2>
          <ul className="space-y-2 text-gray-700">
            <li><a href="#know-your-win-rate" className="hover:text-blue-600 transition-colors">Strategy 1: Know Your Win Rate by GC</a></li>
            <li><a href="#cost-per-sf" className="hover:text-blue-600 transition-colors">Strategy 2: Use $/SF for Go/No-Go Decisions</a></li>
            <li><a href="#pre-submission" className="hover:text-blue-600 transition-colors">Strategy 3: The Pre-Submission Review Advantage</a></li>
            <li><a href="#relationships" className="hover:text-blue-600 transition-colors">Strategy 4: Build Relationships With Project Managers</a></li>
            <li><a href="#on-time" className="hover:text-blue-600 transition-colors">Strategy 5: Submit on Time, Every Time</a></li>
            <li><a href="#lose-right" className="hover:text-blue-600 transition-colors">Strategy 6: Lose the Right Way</a></li>
          </ul>
        </div>

        <div className="prose prose-lg max-w-none">

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
            <p className="text-gray-800 font-semibold mb-2">The honest truth about winning commercial roofing bids:</p>
            <p className="text-gray-700">Most roofing contractors win 20–35% of the bids they submit. The contractors who win 45–55% are not smarter — they are more systematic. They track more data, review more carefully, and manage relationships more deliberately. This guide covers the six habits that drive the difference.</p>
          </div>

          <div id="know-your-win-rate" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy 1: Know Your Win Rate by GC</h2>
            <p className="text-gray-700 mb-4">
              Your overall win rate is a lagging indicator. Your win rate by GC is actionable intelligence. Most roofing contractors who track their bids carefully discover that 20% of the GCs they bid for generate 80% of their wins — and there are GCs they have never once been awarded work from despite bidding repeatedly.
            </p>
            <p className="text-gray-700 mb-4">
              Build a simple bid log: date, GC name, project name, system type, bid amount, $/SF, result (win/loss/no award), and if possible, the winning bid amount. After 50 bids, you will see patterns clearly.
            </p>
            <div className="bg-gray-50 rounded-xl p-5 mb-4">
              <p className="font-semibold text-gray-900 mb-3">What the data typically reveals:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> 2–3 GCs where you win 50%+ of bids</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> 2–3 GCs where you win under 10% despite consistent bidding</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> A $/SF range where you are consistently competitive</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> A $/SF range where you consistently lose</li>
              </ul>
            </div>
            <p className="text-gray-700">
              The strategic decision: shift bid volume toward GCs where your win rate is high and your margins are acceptable. Stop wasting estimating hours on GCs who have never awarded you work.
            </p>
          </div>

          <div id="cost-per-sf" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy 2: Use $/SF for Go/No-Go Decisions</h2>
            <p className="text-gray-700 mb-4">
              Before you spend 8 hours on a takeoff, do a 10-minute go/no-go check. Calculate the rough $/SF based on the system type and complexity. Compare it to your historical win range for that GC and system combination. If the budget number you are hearing from the market is below your cost floor, you have a decision to make before you invest the time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { system: 'TPO/EPDM Reroof', range: '$12–$22/SF', note: 'Varies by thickness, attachment method, and complexity' },
                { system: 'SBS Modified Reroof', range: '$14–$26/SF', note: 'Depends on number of plies and flashing scope' },
                { system: 'Metal Standing Seam', range: '$22–$45/SF', note: 'Highly variable based on panel profile and clip system' },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 text-sm">{item.system}</p>
                  <p className="text-2xl font-bold text-blue-600 my-2">{item.range}</p>
                  <p className="text-xs text-gray-500">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-700">
              These are market ranges, not your cost floor — your cost floor depends on your overhead, labor rates, and location. The point is to have your own $/SF benchmarks built from your bid history, and to use them before you commit to the full estimating process.
            </p>
          </div>

          <div id="pre-submission" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy 3: The Pre-Submission Review Advantage</h2>
            <p className="text-gray-700 mb-4">
              This is the single highest-leverage thing most roofing estimators are not doing. Before your bid goes out, run it through a structured review checklist. Not a glance — a systematic check of every category: takeoff quantities, material costs, labor hours, subcontractor quotes, general conditions, exclusions, and the final number against your $/SF range.
            </p>
            <p className="text-gray-700 mb-4">
              The pre-submission review catches two kinds of errors. The first kind costs you the job: a transposition error that makes your bid $80,000 too high. The second kind costs you the project: a missed scope item that makes your bid $80,000 too low and you win it at a loss.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
              <p className="font-semibold text-amber-900 mb-2">⚠ The error you cannot afford</p>
              <p className="text-amber-800 text-sm">
                Winning a bid with an error in it is worse than losing. A bid you lose costs you a few hours of estimating time. A bid you win with a significant error can eliminate the margin on your next 3–5 jobs. Always review before you submit.
              </p>
            </div>
            <p className="text-gray-700">
              The contractors who do formal pre-submission reviews consistently report fewer post-award surprises, cleaner job starts, and better margin on completed work. It is not glamorous, but it is one of the highest-return habits in the estimating process.
            </p>
          </div>

          <div id="relationships" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy 4: Build Relationships With Project Managers</h2>
            <p className="text-gray-700 mb-4">
              Commercial construction runs on relationships. The GC estimator who invites you to bid has some influence — but the project manager who runs the job has more. If the PM has worked with you before and trusts your crew, they will advocate for you when the GC is deciding between two close bids.
            </p>
            <p className="text-gray-700 mb-4">
              Simple relationship-building habits: call after every awarded job to introduce yourself to the PM, respond to RFIs within 24 hours on active projects, send a brief &quot;job complete&quot; note after close-out with a photo of the finished roof. These are not complicated — they are just consistent.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-blue-800 text-sm">
                <strong>The referral network:</strong> GC project managers move between companies. A PM you built a relationship with at one GC will often bring you to bid lists at their next company. Two or three solid PM relationships can dramatically expand your bid volume over 3–5 years.
              </p>
            </div>
          </div>

          <div id="on-time" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy 5: Submit on Time, Every Time</h2>
            <p className="text-gray-700 mb-4">
              Late bids are frequently not accepted in commercial construction. Even when they are technically accepted, a late submission signals to the GC that your operations may be unreliable. If you cannot manage a deadline in the bidding phase, the PM reasonably wonders what your schedule discipline will be on the job.
            </p>
            <p className="text-gray-700 mb-4">
              Build your estimating schedule backwards from the bid deadline. If the bid is due Friday at 2pm, your number needs to be finished by Thursday noon — leaving time for review, formatting, and submission. Missing a deadline because &quot;the sub quote came in late&quot; is a process problem, not a sub problem. Build buffer into your process.
            </p>
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4">
              <p className="text-emerald-800 text-sm">
                <strong>Competitive edge:</strong> In many commercial roofing markets, 15–25% of submitted bids arrive within the last 30 minutes before deadline or late. Simply submitting 24 hours early, with a clean and complete package, puts you in the top tier of responsiveness before the GC reads a single number.
              </p>
            </div>
          </div>

          <div id="lose-right" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy 6: Lose the Right Way</h2>
            <p className="text-gray-700 mb-4">
              You will lose most of the bids you submit. The question is what you do with a loss. Most contractors do nothing — they move on to the next bid. The contractors with improving win rates treat every loss as data.
            </p>
            <p className="text-gray-700 mb-4">
              When you lose a bid, call the GC estimator and ask two questions: What was the winning number? And was there anything about our bid package that made it harder to evaluate? The first gives you competitive intelligence. The second gives you process feedback you cannot get any other way.
            </p>
            <div className="bg-gray-50 rounded-xl p-5 mb-4">
              <p className="font-semibold text-gray-900 mb-3">What to track on every lost bid:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                {['Your bid amount and $/SF', 'Winning bid amount (if shared)', 'Bid spread: were bids clustered or wide?', 'Was price the deciding factor, or something else?', 'Any feedback from the GC on your submission'].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-500">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-gray-700">
              After 20–30 tracked losses, you will see patterns in where and why you are losing. That is the data that drives strategy — not intuition, not anecdote.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-center text-white">
          <div className="text-3xl mb-3">🛡️</div>
          <h3 className="text-2xl font-bold mb-3">Ready to Win More Bids?</h3>
          <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
            BidShield gives you the 18-phase review process that catches errors before submission — and helps you build the consistent estimating habits that raise your win rate over time.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Start Your Free BidShield Trial
          </Link>
        </div>
      </article>
    </main>
  );
}
