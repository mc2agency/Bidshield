import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Construction Submittals & Shop Drawings for Roofers | BidShield',
  description: 'Master the roofing submittal process from reading requirements to creating shop drawings. Learn organization, tracking, and how to avoid delays that cost you money.',
  keywords: 'roofing submittals, shop drawings, construction submittals, submittal log, roofing product data, material submittals',
  alternates: { canonical: 'https://www.bidshield.co/resources/submittals' },
};

export default function SubmittalsPage() {
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
            Construction Submittals & Shop Drawings
          </h1>
          <p className="text-xl text-slate-300">
            Master the submittal process from reading requirements to creating shop drawings. Master organization, tracking, and common pitfalls that delay projects.
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
                <a href="#what-are-submittals" className="block text-sm text-gray-600 hover:text-emerald-600">What Are Submittals?</a>
                <a href="#types" className="block text-sm text-gray-600 hover:text-emerald-600">Types of Submittals</a>
                <a href="#reading-requirements" className="block text-sm text-gray-600 hover:text-emerald-600">Reading Requirements</a>
                <a href="#organizing-packages" className="block text-sm text-gray-600 hover:text-emerald-600">Organizing Packages</a>
                <a href="#shop-drawings" className="block text-sm text-gray-600 hover:text-emerald-600">Creating Shop Drawings</a>
                <a href="#tracking" className="block text-sm text-gray-600 hover:text-emerald-600">Submittal Log & Tracking</a>
                <a href="#common-mistakes" className="block text-sm text-gray-600 hover:text-emerald-600">Common Mistakes</a>
                <a href="#tools" className="block text-sm text-gray-600 hover:text-emerald-600">Tools & Software</a>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Related Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/tools/construction-submittals" className="text-sm text-emerald-600 hover:text-emerald-700">
                      → Submittals Tool
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources/plans-and-specs" className="text-sm text-emerald-600 hover:text-emerald-700">
                      → Reading Plans & Specs
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-8">

              {/* Introduction */}
              <div className="mb-12">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Submittals are one of the most critical yet often misunderstood parts of construction project management. Delays in submittal approval can cascade through your entire schedule, costing time and money. Understanding how to read submittal requirements, create compliant packages, and track approvals is essential for any roofing contractor.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  This comprehensive guide covers everything from basic submittal types to advanced shop drawing creation, helping you streamline your submittal process and avoid the common mistakes that plague contractors.
                </p>
              </div>

              {/* What Are Submittals? */}
              <section id="what-are-submittals" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What Are Submittals?</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Submittals are documents and samples that contractors provide to architects and engineers for review and approval before procuring or installing materials. They demonstrate that the materials and methods you plan to use comply with the contract documents (plans and specifications).
                </p>

                <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200 mb-6">
                  <h3 className="font-bold text-emerald-800 mb-3">Purpose of Submittals</h3>
                  <ul className="space-y-2 text-sm text-emerald-700">
                    <li>• Verify proposed materials meet specification requirements</li>
                    <li>• Demonstrate understanding of design intent</li>
                    <li>• Allow coordination between trades</li>
                    <li>• Create record of approved materials for warranty</li>
                    <li>• Protect contractor from non-compliant material claims</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> Submittal approval does NOT relieve the contractor of responsibility to comply with contract documents. The architect&apos;s review is for general conformance only.
                  </p>
                </div>
              </section>

              {/* Types of Submittals */}
              <section id="types" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Types of Submittals</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Different submittals serve different purposes. Understanding what&apos;s required for your project is the first step to successful submittal management.
                </p>

                <div className="space-y-6">
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                      <h3 className="font-bold text-white text-lg">1. Product Data Submittals</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 mb-4">
                        Manufacturer&apos;s printed literature showing technical specifications, performance data, and installation instructions.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Common Roofing Product Data:</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• Membrane specifications (TPO, EPDM, PVC)</li>
                          <li>• Insulation board technical data sheets</li>
                          <li>• Fastener and plate specifications</li>
                          <li>• Sealant and adhesive product data</li>
                          <li>• Metal flashing specifications</li>
                          <li>• Roof drain and scupper cut sheets</li>
                        </ul>
                      </div>
                      <div className="mt-4 p-3 bg-emerald-50 rounded border border-emerald-200">
                        <p className="text-sm text-emerald-800">
                          <strong>Pro Tip:</strong> Highlight specific features that demonstrate compliance with specs. Don&apos;t submit the entire 50-page catalog.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                      <h3 className="font-bold text-white text-lg">2. Shop Drawings</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 mb-4">
                        Custom drawings prepared by the contractor showing how work will be fabricated and installed. These are YOUR drawings, not the architect&apos;s.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Typical Shop Drawings for Roofing:</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• Roof plan showing seam layout and drainage</li>
                          <li>• Edge metal profiles and termination details</li>
                          <li>• Penetration flashing details</li>
                          <li>• Parapet cap and counterflashing details</li>
                          <li>• Expansion joint details</li>
                          <li>• Equipment curb and screen details</li>
                        </ul>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Key Point:</strong> Shop drawings show HOW you&apos;ll execute the design. They must include dimensions, materials, and installation methods.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                      <h3 className="font-bold text-white text-lg">3. Samples</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 mb-4">
                        Physical samples of materials for architect review of color, texture, and quality.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Common Roofing Samples:</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• Membrane color chips (if color options available)</li>
                          <li>• Metal flashing samples showing finish and gauge</li>
                          <li>• Coping cap profiles and finishes</li>
                          <li>• Walkway pad samples</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                      <h3 className="font-bold text-white text-lg">4. Other Submittal Types</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-3 text-gray-700">
                        <li>
                          <strong className="text-gray-900">Mock-ups:</strong> Full-scale sections showing installation quality and appearance
                        </li>
                        <li>
                          <strong className="text-gray-900">Certificates:</strong> Fire ratings, FM approvals, warranty certificates
                        </li>
                        <li>
                          <strong className="text-gray-900">Test Reports:</strong> Wind uplift ratings, fire test results, ASTM compliance
                        </li>
                        <li>
                          <strong className="text-gray-900">Manufacturer Instructions:</strong> Installation manuals and application guides
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Reading Submittal Requirements */}
              <section id="reading-requirements" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Reading Submittal Requirements in Specs</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Every specification section contains submittal requirements. Missing them means rejection and delay. Here&apos;s how to identify what&apos;s required:
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Where to Look in Specifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Division 01 - General Requirements</h4>
                        <p className="text-sm text-gray-600">Section 01 33 00 defines general submittal procedures, review times, and format requirements</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Part 1 - Submittals (in each section)</h4>
                        <p className="text-sm text-gray-600">Look for article 1.6 or 1.7 titled &quot;Submittals&quot; in your specific section (e.g., 07 50 00 Membrane Roofing)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Part 2 - Products</h4>
                        <p className="text-sm text-gray-600">May specify submittal requirements for specific products or systems</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Common Submittal Language in Specs</h3>
                  <div className="space-y-4 text-sm">
                    <div className="border-l-4 border-emerald-500 pl-4">
                      <p className="font-mono text-gray-800 mb-2">&quot;Submit product data for all roofing membrane and accessories&quot;</p>
                      <p className="text-gray-600">Means: Product data sheets required for membrane, adhesives, fasteners, plates, etc.</p>
                    </div>
                    <div className="border-l-4 border-emerald-500 pl-4">
                      <p className="font-mono text-gray-800 mb-2">&quot;Submit shop drawings showing roof plan and all penetration details&quot;</p>
                      <p className="text-gray-600">Means: You must create custom drawings - manufacturer standard details may not be sufficient</p>
                    </div>
                    <div className="border-l-4 border-emerald-500 pl-4">
                      <p className="font-mono text-gray-800 mb-2">&quot;Submit manufacturer&apos;s warranty and FM approval certificate&quot;</p>
                      <p className="text-gray-600">Means: Specific certificates required - product data alone is not enough</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Organizing Submittal Packages */}
              <section id="organizing-packages" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Organizing Submittal Packages</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  A well-organized submittal package speeds review and demonstrates professionalism. Follow this proven structure:
                </p>

                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-xl mb-4">Professional Submittal Package Format</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="font-bold">1.</span>
                      <div>
                        <strong>Transmittal Letter</strong> - Cover sheet with project name, spec section, submittal number, and item list
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold">2.</span>
                      <div>
                        <strong>Table of Contents</strong> - List all enclosed items with page numbers
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold">3.</span>
                      <div>
                        <strong>Shop Drawings</strong> - Custom drawings first (if applicable)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold">4.</span>
                      <div>
                        <strong>Product Data</strong> - Organized by system component (membrane, insulation, flashings)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold">5.</span>
                      <div>
                        <strong>Certificates & Test Reports</strong> - FM approvals, fire ratings, warranty forms
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h3 className="font-bold text-green-800 mb-3">✓ Best Practices</h3>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li>• Use highlighting to call out compliance features</li>
                      <li>• Include spec section reference on each page</li>
                      <li>• Number all pages sequentially</li>
                      <li>• Include full product names and model numbers</li>
                      <li>• Submit PDF format unless physical samples required</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <h3 className="font-bold text-red-800 mb-3">✗ Avoid These Mistakes</h3>
                    <ul className="space-y-2 text-sm text-red-700">
                      <li>• Submitting entire manufacturer catalogs</li>
                      <li>• No highlighting or organization</li>
                      <li>• Missing required certificates</li>
                      <li>• Illegible copied pages</li>
                      <li>• No transmittal letter or tracking number</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Creating Shop Drawings */}
              <section id="shop-drawings" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Creating Shop Drawings Basics</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Shop drawings are YOUR interpretation of how to execute the design. They require more effort than product data but demonstrate understanding and build confidence.
                </p>

                <div className="bg-gray-100 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Essential Elements of Shop Drawings</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: 'Title Block', desc: 'Project name, drawing number, date, revision, contractor info' },
                      { title: 'Scale', desc: 'Clearly indicated scale (typically 1/4&quot; = 1&apos;-0&quot; for details)' },
                      { title: 'Dimensions', desc: 'All critical dimensions called out, not just scaled' },
                      { title: 'Materials', desc: 'All materials labeled with specifications' },
                      { title: 'Notes', desc: 'Installation notes and special requirements' },
                      { title: 'References', desc: 'Reference to spec sections and plan sheets' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Common Shop Drawing Types for Roofing</h3>

                    <div className="space-y-4">
                      <div className="bg-white border-l-4 border-emerald-500 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Roof Layout Plan</h4>
                        <p className="text-sm text-gray-700 mb-2">Shows membrane seam layout, drainage patterns, and all roof-mounted equipment</p>
                        <ul className="text-xs text-gray-600 ml-4 space-y-1">
                          <li>• Membrane roll direction and seam spacing</li>
                          <li>• Drain locations and slope arrows</li>
                          <li>• Penetration locations</li>
                          <li>• Control joint locations</li>
                        </ul>
                      </div>

                      <div className="bg-white border-l-4 border-emerald-500 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Edge Metal Details</h4>
                        <p className="text-sm text-gray-700 mb-2">Profile details for gravel stop, fascia, coping caps, counterflashing</p>
                        <ul className="text-xs text-gray-600 ml-4 space-y-1">
                          <li>• Material gauge and finish</li>
                          <li>• Fastener spacing and type</li>
                          <li>• Cleat and splice details</li>
                          <li>• Corner and end treatments</li>
                        </ul>
                      </div>

                      <div className="bg-white border-l-4 border-emerald-500 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Penetration Flashings</h4>
                        <p className="text-sm text-gray-700 mb-2">Details for pipes, conduits, HVAC curbs, equipment supports</p>
                        <ul className="text-xs text-gray-600 ml-4 space-y-1">
                          <li>• Base flashing height and attachment</li>
                          <li>• Counterflashing details</li>
                          <li>• Sealant locations</li>
                          <li>• Pitch pan details (if unavoidable)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Pro Tip:</strong> Start with manufacturer standard details and modify them to match your specific project conditions. Don&apos;t reinvent the wheel.
                  </p>
                </div>
              </section>

              {/* Submittal Log & Tracking */}
              <section id="tracking" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Submittal Log & Tracking</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Managing multiple submittals across a project requires systematic tracking. A submittal log is essential for staying organized and meeting schedule requirements.
                </p>

                <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold">Sub #</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold">Spec Section</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold">Submit Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold">Return Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        <tr>
                          <td className="px-4 py-3">07-001</td>
                          <td className="px-4 py-3">07 50 00</td>
                          <td className="px-4 py-3">TPO Membrane & Accessories</td>
                          <td className="px-4 py-3">02/15/25</td>
                          <td className="px-4 py-3">03/01/25</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Approved</span></td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3">07-002</td>
                          <td className="px-4 py-3">07 21 00</td>
                          <td className="px-4 py-3">Roof Insulation</td>
                          <td className="px-4 py-3">02/15/25</td>
                          <td className="px-4 py-3">-</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">In Review</span></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">07-003</td>
                          <td className="px-4 py-3">07 62 00</td>
                          <td className="px-4 py-3">Sheet Metal Flashings</td>
                          <td className="px-4 py-3">02/20/25</td>
                          <td className="px-4 py-3">03/05/25</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Revise & Resubmit</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Understanding Submittal Response Codes</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-semibold text-xs">APPROVED</span>
                        <p className="text-gray-700">Proceed with work. No resubmittal required.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-semibold text-xs">APPROVED AS NOTED</span>
                        <p className="text-gray-700">Proceed, but comply with architect&apos;s notes. May require resubmittal.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded font-semibold text-xs">REVISE & RESUBMIT</span>
                        <p className="text-gray-700">Make corrections and resubmit. Do NOT proceed with work.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded font-semibold text-xs">REJECTED</span>
                        <p className="text-gray-700">Not acceptable. Major revisions required before resubmittal.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4">
                    <h4 className="font-semibold text-emerald-800 mb-2">Tracking Tips</h4>
                    <ul className="space-y-1 text-sm text-emerald-700">
                      <li>• Build submittal schedule early - work backward from install dates</li>
                      <li>• Allow 2-4 weeks for architect review (check contract)</li>
                      <li>• Track lead times for material procurement after approval</li>
                      <li>• Follow up on submittals approaching review deadline</li>
                      <li>• Keep master log updated and share with project team</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Common Mistakes */}
              <section id="common-mistakes" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Submittal Mistakes</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Avoid the mistakes that plague contractors and delay projects. Avoid these pitfalls:
                </p>

                <div className="space-y-4">
                  {[
                    {
                      title: 'Submitting Too Late',
                      problem: 'Waiting until you need to order materials to submit. Review takes time.',
                      solution: 'Create submittal schedule at project start. Submit immediately after contract award.'
                    },
                    {
                      title: 'Incomplete Packages',
                      problem: 'Missing required certificates, test reports, or product data. Results in rejection.',
                      solution: 'Create checklist from specs before compiling submittal. Verify all items included.'
                    },
                    {
                      title: 'Generic Product Data',
                      problem: 'Submitting 50-page catalogs without highlighting compliance features.',
                      solution: 'Extract relevant pages only. Highlight and annotate to show spec compliance.'
                    },
                    {
                      title: 'Wrong Product Submitted',
                      problem: 'Submitting product that doesn&apos;t meet minimum spec requirements.',
                      solution: 'Read specs carefully. Compare product specs line by line before submitting.'
                    },
                    {
                      title: 'No Shop Drawings When Required',
                      problem: 'Thinking manufacturer standard details are sufficient when custom drawings required.',
                      solution: 'If specs say &quot;submit shop drawings,&quot; you must create project-specific drawings.'
                    },
                    {
                      title: 'Poor Shop Drawing Quality',
                      problem: 'Hand sketches, missing dimensions, unclear notes, no title block.',
                      solution: 'Use CAD software. Include all required elements. Make drawings professional quality.'
                    },
                    {
                      title: 'Not Reading Architect Comments',
                      problem: 'Receiving &quot;Approved as Noted&quot; and ignoring the notes.',
                      solution: 'Carefully read all architect comments. Comply with notes or risk warranty issues.'
                    },
                    {
                      title: 'No Submittal Tracking',
                      problem: 'Losing track of what&apos;s been submitted, what&apos;s approved, what needs resubmittal.',
                      solution: 'Maintain detailed submittal log. Update immediately when submittals returned.'
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-bold text-gray-900 mb-3">{item.title}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-red-50 rounded p-4 border-l-4 border-red-500">
                          <h4 className="font-semibold text-red-800 text-sm mb-2">Problem:</h4>
                          <p className="text-sm text-red-700">{item.problem}</p>
                        </div>
                        <div className="bg-green-50 rounded p-4 border-l-4 border-green-500">
                          <h4 className="font-semibold text-green-800 text-sm mb-2">Solution:</h4>
                          <p className="text-sm text-green-700">{item.solution}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tools & Software */}
              <section id="tools" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Tools & Software</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Professional tools make submittal creation and tracking more efficient. Here are the industry standards:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-500 hover:shadow-lg transition-all">
                    <div className="text-4xl mb-4">🔷</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AutoCAD</h3>
                    <p className="text-gray-700 mb-4">
                      Industry-standard CAD software for creating professional shop drawings. Full 2D and 3D capabilities.
                    </p>
                    <div className="bg-gray-50 rounded p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Best For:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Complex detail drawings</li>
                        <li>• Sheet metal fabrication drawings</li>
                        <li>• Roof layout plans</li>
                        <li>• Professional presentation</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-500 hover:shadow-lg transition-all">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">SketchUp</h3>
                    <p className="text-gray-700 mb-4">
                      User-friendly 3D modeling software. Easier setup time than AutoCAD for basic shop drawings.
                    </p>
                    <div className="bg-gray-50 rounded p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Best For:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 3D visualization of details</li>
                        <li>• Quick concept drawings</li>
                        <li>• Smaller contractors just starting</li>
                        <li>• Free version available</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-500 hover:shadow-lg transition-all">
                    <div className="text-4xl mb-4">📐</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Bluebeam Revu</h3>
                    <p className="text-gray-700 mb-4">
                      Essential for compiling, marking up, and organizing PDF submittal packages.
                    </p>
                    <div className="bg-gray-50 rounded p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Best For:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Highlighting product data sheets</li>
                        <li>• Combining multiple PDFs</li>
                        <li>• Adding notes and callouts</li>
                        <li>• Creating transmittal sheets</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-500 hover:shadow-lg transition-all">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Excel / Google Sheets</h3>
                    <p className="text-gray-700 mb-4">
                      Critical for maintaining submittal logs and tracking review status.
                    </p>
                    <div className="bg-gray-50 rounded p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Best For:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Submittal log maintenance</li>
                        <li>• Tracking approval status</li>
                        <li>• Schedule coordination</li>
                        <li>• Team collaboration</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
                  <h3 className="font-bold text-xl mb-3">Project Management Software</h3>
                  <p className="text-slate-300 mb-4">
                    Many contractors use dedicated construction management platforms with built-in submittal tracking:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/10 rounded p-4">
                      <h4 className="font-semibold mb-2">Procore</h4>
                      <p className="text-slate-400">Full-featured construction management with submittal part</p>
                    </div>
                    <div className="bg-white/10 rounded p-4">
                      <h4 className="font-semibold mb-2">PlanGrid</h4>
                      <p className="text-slate-400">Document management with submittal workflow</p>
                    </div>
                    <div className="bg-white/10 rounded p-4">
                      <h4 className="font-semibold mb-2">Buildertrend</h4>
                      <p className="text-slate-400">Great for smaller contractors, includes submittal tracking</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Master the Complete Submittal Process</h2>
                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                  Take the full Construction Submittals tool and master creating professional shop drawings, organize compliant packages, and manage submittal schedules like a pro. Includes AutoCAD templates, submittal checklists, and real-world examples.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                  <div className="text-4xl font-bold text-emerald-400">$197</div>
                  <div className="text-slate-400">Complete tool with templates & examples</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/tools/construction-submittals"
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-lg"
                  >
                    Get Access to Tool - $197 →
                  </Link>
                  <Link
                    href="/membership"
                    className="px-8 py-4 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20 text-lg"
                  >
                    Get BidShield Pro Membership
                  </Link>
                </div>
                <p className="text-sm text-slate-400 mt-4">
                  Or get access to this + all tools with BidShield Pro Membership
                </p>
              </section>

            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
