import Link from 'next/link';

export default function EstimatingBestPracticesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/resources" className="inline-flex items-center text-slate-300 hover:text-white mb-4 text-sm">
            ← Back to Resource Center
          </Link>
          <div className="inline-block mb-4 px-4 py-2 bg-emerald-500/20 rounded-full text-sm font-semibold text-emerald-300">
            Free Resource
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Estimating Best Practices
          </h1>
          <p className="text-xl text-slate-300">
            Master the techniques that separate professional estimators from the rest. Master accuracy, efficiency, and consistency.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                <a href="#accuracy" className="block text-sm text-gray-600 hover:text-emerald-600">Accuracy Principles</a>
                <a href="#workflow" className="block text-sm text-gray-600 hover:text-emerald-600">Workflow Optimization</a>
                <a href="#checklists" className="block text-sm text-gray-600 hover:text-emerald-600">Using Checklists</a>
                <a href="#common-mistakes" className="block text-sm text-gray-600 hover:text-emerald-600">Common Mistakes</a>
                <a href="#qa-process" className="block text-sm text-gray-600 hover:text-emerald-600">QA Process</a>
                <a href="#tools" className="block text-sm text-gray-600 hover:text-emerald-600">Essential Tools</a>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Related Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/tools/estimating-essentials" className="text-sm text-emerald-600 hover:text-emerald-700">
                      → Estimating Essentials Tool
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/estimating-checklist" className="text-sm text-emerald-600 hover:text-emerald-700">
                      → Estimating Checklist
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-8">

              {/* Accuracy Principles */}
              <section id="accuracy" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Accuracy Principles</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  The foundation of professional estimating is accuracy. A 5% error on a $500,000 project means $25,000 in potential losses. Here&apos;s how to maintain precision.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                    <h3 className="font-bold text-emerald-800 mb-3">Measure Twice</h3>
                    <ul className="space-y-2 text-sm text-emerald-700">
                      <li>• Always verify takeoff quantities</li>
                      <li>• Cross-reference with plan scale</li>
                      <li>• Check perimeter vs area calculations</li>
                      <li>• Verify penetration counts</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-3">Document Everything</h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li>• Save all calculation sheets</li>
                      <li>• Note assumptions made</li>
                      <li>• Record material selections</li>
                      <li>• Track spec requirements</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Pro Tip:</strong> Keep a running log of estimate accuracy. Compare your estimates to actual project costs to identify systematic errors.
                  </p>
                </div>
              </section>

              {/* Workflow Optimization */}
              <section id="workflow" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Workflow Optimization</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  A structured workflow reduces errors and speeds up the estimating process. Follow this proven sequence:
                </p>

                <div className="space-y-4">
                  {[
                    { step: 1, title: 'Bid Review', desc: 'Read specs completely, note key requirements, identify scope' },
                    { step: 2, title: 'Plan Analysis', desc: 'Review all sheets, identify roof areas, note details' },
                    { step: 3, title: 'Takeoff', desc: 'Measure quantities using Bluebeam or similar tools' },
                    { step: 4, title: 'Pricing', desc: 'Apply material costs, labor rates, equipment needs' },
                    { step: 5, title: 'General Conditions', desc: 'Add overhead, mobilization, supervision' },
                    { step: 6, title: 'Review & Submit', desc: 'Quality check, management review, submit bid' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Using Checklists */}
              <section id="checklists" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">The Power of Checklists</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Professional estimators never rely on memory alone. A comprehensive checklist ensures nothing is missed.
                </p>

                <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">Essential Checklist Categories</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        'Roof membrane & insulation',
                        'Metal flashings & edge details',
                        'Roof drains & penetrations',
                        'Walkway pads & equipment screens',
                        'Demolition & disposal',
                        'Safety equipment & fall protection',
                        'Mobilization & crane time',
                        'Warranty & inspection requirements',
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center text-emerald-600 text-sm">✓</span>
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white">
                  <h3 className="font-bold text-xl mb-2">Get the Complete Estimating Checklist</h3>
                  <p className="text-emerald-100 mb-4">Never miss a line item again with our comprehensive 100+ item checklist.</p>
                  <Link href="/products/estimating-checklist" className="inline-block px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
                    Get Checklist - $29
                  </Link>
                </div>
              </section>

              {/* Common Mistakes */}
              <section id="common-mistakes" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Mistakes to Avoid</h2>

                <div className="space-y-4">
                  {[
                    { title: 'Forgetting Labor Burden', desc: 'Always include taxes, insurance, and benefits on top of base wages. Burden typically adds 35-50% to labor costs.' },
                    { title: 'Ignoring General Conditions', desc: 'Supervision, equipment, temporary facilities, and overhead must be included. These can be 10-15% of the job.' },
                    { title: 'Underestimating Waste', desc: 'Different materials have different waste factors. TPO might be 5-8%, while shingles can be 10-15%.' },
                    { title: 'Not Reading Specs Carefully', desc: 'Specifications often contain requirements that significantly impact costs. Read every word.' },
                    { title: 'Assuming Conditions', desc: 'When information is unclear, ask questions. Never assume the cheapest scenario.' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <h4 className="font-bold text-red-800">{item.title}</h4>
                      <p className="text-sm text-red-700">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* QA Process */}
              <section id="qa-process" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Quality Assurance Process</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Every estimate should go through a structured review before submission:
                </p>

                <div className="bg-gray-50 rounded-lg p-6">
                  <ol className="space-y-4">
                    <li className="flex items-start gap-4">
                      <span className="font-bold text-emerald-600">1.</span>
                      <div>
                        <strong>Self-Review</strong> - Check all math, verify quantities against plans
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="font-bold text-emerald-600">2.</span>
                      <div>
                        <strong>Peer Review</strong> - Have another estimator spot-check key quantities
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="font-bold text-emerald-600">3.</span>
                      <div>
                        <strong>Management Review</strong> - Final approval on pricing and strategy
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="font-bold text-emerald-600">4.</span>
                      <div>
                        <strong>Post-Submit Review</strong> - After results, compare to winning bid if possible
                      </div>
                    </li>
                  </ol>
                </div>
              </section>

              {/* Essential Tools */}
              <section id="tools" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Essential Tools for Estimators</h2>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                    <div className="text-3xl mb-3">📐</div>
                    <h3 className="font-bold text-gray-900 mb-2">Bluebeam Revu</h3>
                    <p className="text-sm text-gray-600">Industry-standard for digital takeoffs and plan markup</p>
                  </div>
                  <div className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                    <div className="text-3xl mb-3">📊</div>
                    <h3 className="font-bold text-gray-900 mb-2">Excel Templates</h3>
                    <p className="text-sm text-gray-600">Structured spreadsheets for pricing and recaps</p>
                  </div>
                  <div className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                    <div className="text-3xl mb-3">🛰️</div>
                    <h3 className="font-bold text-gray-900 mb-2">Aerial Measurement</h3>
                    <p className="text-sm text-gray-600">EagleView, Pictometry for remote measurements</p>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 text-center text-white">
                <h2 className="text-2xl font-bold mb-4">Ready to Master Professional Estimating?</h2>
                <p className="text-slate-300 mb-6">
                  Take the complete Estimating Essentials tool and master everything from takeoff to proposal.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/tools/estimating-essentials" className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    View Tool - $497
                  </Link>
                  <Link href="/products/template-bundle" className="px-8 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20">
                    Get Templates - $129
                  </Link>
                </div>
              </section>

            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
