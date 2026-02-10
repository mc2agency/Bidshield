import Link from 'next/link';

export const metadata = {
  title: 'General Conditions Checklist for Construction Estimating [2025]',
  description: 'Complete guide to general conditions in construction estimates. Learn what to include, how to calculate costs, and avoid missing critical items that eat into profit.',
};

export default function GeneralConditionsArticle() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/blog" className="text-blue-300 hover:text-white transition-colors">
              ← Back to Blog
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm mb-4">
            <span className="px-3 py-1 bg-blue-700 rounded-full">Estimation</span>
            <span>December 14, 2025</span>
            <span>14 min read</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            General Conditions Checklist for Construction Estimating [2025]
          </h1>
          <p className="text-xl text-blue-100">
            Complete guide to general conditions in construction estimates. Learn what to include, how to calculate costs, and avoid missing critical items that eat into profit.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
              MC
            </div>
            <div>
              <div className="font-semibold">MC2 Estimating</div>
              <div className="text-sm text-blue-200">Professional Estimating Tools</div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Table of Contents */}
        <div className="bg-gray-50 rounded-xl p-6 mb-12 border-l-4 border-blue-600">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Table of Contents</h2>
          <ul className="space-y-2 text-gray-700">
            <li><a href="#what-are-general-conditions" className="hover:text-blue-600 transition-colors">What Are General Conditions?</a></li>
            <li><a href="#why-matter" className="hover:text-blue-600 transition-colors">Why General Conditions Matter</a></li>
            <li><a href="#complete-checklist" className="hover:text-blue-600 transition-colors">Complete General Conditions Checklist</a></li>
            <li><a href="#how-to-calculate" className="hover:text-blue-600 transition-colors">How to Calculate General Conditions Costs</a></li>
            <li><a href="#typical-percentages" className="hover:text-blue-600 transition-colors">Typical Percentages by Project Type</a></li>
            <li><a href="#common-mistakes" className="hover:text-blue-600 transition-colors">Common Mistakes to Avoid</a></li>
          </ul>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8">
            <p className="text-gray-800 font-semibold mb-2">Critical Warning:</p>
            <p className="text-gray-700">
              Missing just 2-3 general condition items can turn a profitable project into a loss. General conditions typically represent 8-15% of total project cost, yet many estimators either forget them entirely or underestimate their true cost.
            </p>
          </div>

          <h2 id="what-are-general-conditions" className="text-3xl font-bold text-gray-900 mb-4 mt-12">What Are General Conditions?</h2>
          <p className="text-gray-700 mb-6">
            <strong>General conditions</strong> are the indirect costs required to complete a construction project that aren't directly tied to installing materials. They're the "everything else" category that supports your field crews and keeps the project running smoothly.
          </p>
          <p className="text-gray-700 mb-6">
            Think of it this way: <strong>Direct costs</strong> are shingles, underlayment, and the roofers installing them. <strong>General conditions</strong> are the project manager supervising the work, the dumpster for tear-off debris, the temporary toilets, the permits, and the insurance certificates.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
            <p className="text-gray-800 font-semibold mb-2">Key Difference:</p>
            <p className="text-gray-700">
              <strong>General Conditions:</strong> Indirect project costs (supervision, permits, safety, temporary facilities)<br/>
              <strong>Overhead:</strong> Company operating costs (office rent, utilities, admin staff)<br/>
              <strong>Profit:</strong> Your compensation for risk and running the business
            </p>
          </div>

          <h2 id="why-matter" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Why General Conditions Matter</h2>
          <p className="text-gray-700 mb-6">
            General conditions can make or break a project's profitability:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>They're often 8-15% of total cost</strong> - On a $100,000 project, that's $8,000-15,000</li>
            <li><strong>They're required but easy to forget</strong> - You can't skip permits or dumpsters</li>
            <li><strong>They compound quickly</strong> - Long projects accumulate supervision, toilets, and storage costs</li>
            <li><strong>They're non-negotiable</strong> - Unlike materials, you can't value-engineer most general conditions</li>
            <li><strong>They vary by project</strong> - Commercial jobs have different requirements than residential</li>
          </ul>

          <h2 id="complete-checklist" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Complete General Conditions Checklist</h2>
          <p className="text-gray-700 mb-6">
            Use this comprehensive checklist for every estimate. Not every item applies to every project, but review each one:
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">1. Project Management & Supervision</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Project Manager Time:</strong> Hours spent managing the project (not in the field installing)</li>
            <li><strong>Superintendent/Foreman:</strong> On-site supervision and coordination</li>
            <li><strong>Pre-construction Meetings:</strong> Time spent before work begins</li>
            <li><strong>Site Visits & Inspections:</strong> Progress checks, punch list walkthroughs</li>
            <li><strong>Scheduling & Coordination:</strong> Coordinating with other trades, owner, architect</li>
            <li><strong>Submittal Preparation:</strong> Product data sheets, shop drawings, samples</li>
            <li><strong>Closeout Documentation:</strong> As-builts, warranties, O&M manuals</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 my-6">
            <p className="text-gray-800 font-semibold mb-2">Estimating Tip:</p>
            <p className="text-gray-700">
              Calculate PM/superintendent time based on project duration, not just size. A small complex project might need more supervision than a large simple one.
            </p>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">2. Permits, Fees & Bonds</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Building Permits:</strong> Municipal or county fees (typically 0.5-2% of contract value)</li>
            <li><strong>Plan Review Fees:</strong> Separate from permit in some jurisdictions</li>
            <li><strong>Performance Bond:</strong> Usually 1-3% if required (common on public work)</li>
            <li><strong>Payment Bond:</strong> Protects subs and suppliers</li>
            <li><strong>Bid Bond:</strong> If required for proposal submission</li>
            <li><strong>Special Permits:</strong> Fire department access, crane permits, street closures</li>
            <li><strong>Inspection Fees:</strong> Third-party inspections (fire marshal, structural, etc.)</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">3. Insurance & Certificates</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Project-Specific Insurance:</strong> Builder's risk, additional coverage for high-value projects</li>
            <li><strong>Certificate of Insurance (COI) Fees:</strong> Processing fees from your agent</li>
            <li><strong>Additional Insured Endorsements:</strong> Adding GC or owner to your policy</li>
            <li><strong>Increased Liability Limits:</strong> If project requires higher than your standard coverage</li>
            <li><strong>Inland Marine/Tools Insurance:</strong> For valuable equipment on site</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">4. Temporary Facilities & Utilities</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Portable Toilets:</strong> $150-300/month per unit (more for occupied buildings)</li>
            <li><strong>Dumpsters:</strong> $300-800+ depending on size and haul frequency</li>
            <li><strong>Temporary Fencing:</strong> Job site security and safety barriers</li>
            <li><strong>Temporary Power:</strong> Generator rental or temporary service drop</li>
            <li><strong>Temporary Water:</strong> Hose bibs, water tanks, or taps</li>
            <li><strong>Job Site Trailer/Office:</strong> For large commercial projects</li>
            <li><strong>Storage Containers:</strong> Secure tool and material storage</li>
            <li><strong>Temporary Heat/AC:</strong> For working in extreme conditions or occupied buildings</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">5. Safety & Protection</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Fall Protection Systems:</strong> Guardrails, harnesses, lifelines, anchors</li>
            <li><strong>Scaffolding Rental:</strong> By week or month depending on project duration</li>
            <li><strong>Safety Netting:</strong> Debris nets, personnel nets</li>
            <li><strong>Signage:</strong> Safety signs, project signs, no trespassing</li>
            <li><strong>Barricades & Caution Tape:</strong> Protecting public areas</li>
            <li><strong>First Aid Supplies:</strong> OSHA-required kits</li>
            <li><strong>Safety Equipment:</strong> Hard hats, vests, safety glasses for visitors</li>
            <li><strong>Fire Extinguishers:</strong> Required on most job sites</li>
            <li><strong>OSHA Compliance:</strong> Training, documentation, inspections</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">6. Site Protection & Cleaning</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Floor Protection:</strong> Ram board, plywood, carpet protection</li>
            <li><strong>Wall Protection:</strong> Corner guards in occupied buildings</li>
            <li><strong>Window/Door Protection:</strong> Covering during work</li>
            <li><strong>Dust Control:</strong> Tarps, plastic barriers, zipper walls</li>
            <li><strong>Daily Cleanup:</strong> Labor hours for end-of-day cleaning</li>
            <li><strong>Final Cleanup:</strong> Detailed cleaning before owner occupancy</li>
            <li><strong>Landscape Protection:</strong> Protecting existing plants, grass, hardscape</li>
            <li><strong>Driveway Protection:</strong> Plywood paths for equipment</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">7. Equipment & Tools</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Lift Rental:</strong> Scissor lifts, boom lifts, bucket trucks</li>
            <li><strong>Crane Service:</strong> For heavy material lifts</li>
            <li><strong>Dumpster/Conveyor Belt:</strong> Tear-off material removal</li>
            <li><strong>Generator Rental:</strong> If no site power available</li>
            <li><strong>Compressor/Nailer Rental:</strong> If not using your own equipment</li>
            <li><strong>Small Tools:</strong> Consumable blades, bits, supplies</li>
            <li><strong>Equipment Delivery/Pickup:</strong> Transport fees for rentals</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">8. Materials Handling & Logistics</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Material Deliveries:</strong> Delivery fees not included in supplier quotes</li>
            <li><strong>Crane/Boom Truck:</strong> Getting materials to roof</li>
            <li><strong>Material Hoisting:</strong> Elevator use fees in high-rises</li>
            <li><strong>Staging Area Rental:</strong> Off-site if no on-site storage</li>
            <li><strong>Fuel Surcharges:</strong> For remote projects</li>
            <li><strong>Small Quantity Charges:</strong> Multiple trips for phased work</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">9. Testing & Quality Control</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Flood Testing:</strong> Before roofing warranty activation</li>
            <li><strong>Infrared Scanning:</strong> Moisture detection on existing roofs</li>
            <li><strong>Core Samples:</strong> Testing existing roof assemblies</li>
            <li><strong>Third-Party Inspections:</strong> Required by some manufacturers</li>
            <li><strong>Warranty Registration:</strong> Manufacturer inspection fees</li>
            <li><strong>Documentation/Photos:</strong> Time for progress photos, reports</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">10. Miscellaneous</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Shop Drawings:</strong> CAD work for custom details</li>
            <li><strong>As-Built Drawings:</strong> Documenting changes from original plans</li>
            <li><strong>Cutting & Patching:</strong> Coordination with other trades</li>
            <li><strong>Winter Conditions:</strong> Snow removal, heating, weather protection</li>
            <li><strong>Overtime Premium:</strong> If tight schedule requires OT</li>
            <li><strong>Small Tools Allowance:</strong> Consumables, wear items</li>
            <li><strong>Communication:</strong> Job phone, two-way radios</li>
            <li><strong>Copies & Printing:</strong> Plan sets, submittals, RFIs</li>
          </ul>

          <h2 id="how-to-calculate" className="text-3xl font-bold text-gray-900 mb-4 mt-12">How to Calculate General Conditions Costs</h2>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Method 1: Line Item Breakdown (Most Accurate)</h3>
          <p className="text-gray-700 mb-6">
            Estimate each item individually based on project specifics:
          </p>

          <div className="bg-gray-50 rounded-xl p-8 mb-8 border-2 border-gray-300">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Example: 3-Week Commercial Roof Project</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="text-gray-700">
                  <tr className="border-b">
                    <td className="py-2">Project Manager (30 hrs @ $75/hr)</td>
                    <td className="py-2 text-right font-mono">$2,250</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Superintendent (3 weeks @ $1,200/week)</td>
                    <td className="py-2 text-right font-mono">$3,600</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Building Permit</td>
                    <td className="py-2 text-right font-mono">$850</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Performance Bond (2% of $100k)</td>
                    <td className="py-2 text-right font-mono">$2,000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Portable Toilet (3 weeks @ $200/week)</td>
                    <td className="py-2 text-right font-mono">$600</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Dumpster (40-yard, 3 hauls @ $500)</td>
                    <td className="py-2 text-right font-mono">$1,500</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Scaffolding Rental (3 weeks @ $800/week)</td>
                    <td className="py-2 text-right font-mono">$2,400</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Safety Equipment & Signage</td>
                    <td className="py-2 text-right font-mono">$400</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Floor/Wall Protection</td>
                    <td className="py-2 text-right font-mono">$300</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Final Cleanup (16 hrs @ $25/hr)</td>
                    <td className="py-2 text-right font-mono">$400</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Submittal Preparation (8 hrs @ $60/hr)</td>
                    <td className="py-2 text-right font-mono">$480</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Miscellaneous (copies, photos, etc.)</td>
                    <td className="py-2 text-right font-mono">$200</td>
                  </tr>
                  <tr className="border-b-2 border-gray-900">
                    <td className="py-2 font-bold">Total General Conditions</td>
                    <td className="py-2 text-right font-mono font-bold">$14,980</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-sm italic">Direct Costs</td>
                    <td className="py-2 text-right font-mono text-sm">$85,020</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-sm italic">Total Project Cost</td>
                    <td className="py-2 text-right font-mono text-sm">$100,000</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="py-2 font-semibold">GCs as % of Total</td>
                    <td className="py-2 text-right font-mono font-bold text-blue-600">15.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Method 2: Percentage of Direct Costs (Quick Estimate)</h3>
          <p className="text-gray-700 mb-6">
            For preliminary estimates, apply a percentage based on project type. Use this only for rough budgets, then refine with line items:
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 my-6">
            <p className="text-gray-800 font-semibold mb-2">Warning:</p>
            <p className="text-gray-700">
              Percentage methods are quick but less accurate. Always use line-item breakdown for final proposals.
            </p>
          </div>

          <h2 id="typical-percentages" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Typical Percentages by Project Type</h2>

          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Project Type</th>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">GC Range</th>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Notes</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">Small Residential ($5k-20k)</td>
                  <td className="px-6 py-3 border-b font-semibold">3-6%</td>
                  <td className="px-6 py-3 border-b">Simple permit, minimal supervision</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">Large Residential ($20k-100k)</td>
                  <td className="px-6 py-3 border-b font-semibold">5-8%</td>
                  <td className="px-6 py-3 border-b">More coordination, protection needed</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-yellow-50">
                  <td className="px-6 py-3 border-b">Small Commercial ($50k-200k)</td>
                  <td className="px-6 py-3 border-b font-semibold">8-12%</td>
                  <td className="px-6 py-3 border-b">Bonds, submittals, coordination</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-yellow-50">
                  <td className="px-6 py-3 border-b">Large Commercial ($200k+)</td>
                  <td className="px-6 py-3 border-b font-semibold">10-15%</td>
                  <td className="px-6 py-3 border-b">Full project management required</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">Occupied Buildings</td>
                  <td className="px-6 py-3 border-b font-semibold">12-18%</td>
                  <td className="px-6 py-3 border-b">Heavy protection, coordination, phasing</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">Government/Public Work</td>
                  <td className="px-6 py-3 border-b font-semibold">15-20%</td>
                  <td className="px-6 py-3 border-b">Bonds, prevailing wage, compliance</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">Remote/Difficult Access</td>
                  <td className="px-6 py-3 border-b font-semibold">10-15%</td>
                  <td className="px-6 py-3 border-b">Extra logistics, travel time</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 id="common-mistakes" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Common Mistakes to Avoid</h2>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">1. Using the Same Percentage for Every Project</h3>
          <p className="text-gray-700 mb-6">
            A 1-week residential project has vastly different GCs than a 3-month commercial project. Always adjust based on duration, complexity, and project type.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">2. Forgetting Duration-Based Costs</h3>
          <p className="text-gray-700 mb-6">
            Toilets, dumpsters, scaffolding, and supervision are <strong>time-based costs</strong>. If the project takes 4 weeks instead of 2, these costs double. Always calculate based on realistic schedule.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">3. Not Reading Division 01 Specifications</h3>
          <p className="text-gray-700 mb-6">
            Division 01 of the specifications spells out general requirements: who provides temporary facilities, safety requirements, testing, submittals, and closeout procedures. Read it carefully for every commercial project.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">4. Assuming GC Provides Everything</h3>
          <p className="text-gray-700 mb-6">
            On subcontractor work, verify what the GC provides vs. what you must provide. Don't assume they're providing toilets, dumpsters, or scaffolding. Get clarification in writing.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">5. Underestimating Submittal Time</h3>
          <p className="text-gray-700 mb-6">
            Commercial projects require submittals: product data sheets, shop drawings, samples, and coordination. This takes real time from qualified staff. Budget 8-20 hours minimum for typical roofing submittals.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">6. Not Planning for Weather Delays</h3>
          <p className="text-gray-700 mb-6">
            If weather extends your project, time-based GCs continue accruing. Consider a contingency for winter projects or rainy seasons.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
            <p className="text-gray-800 font-semibold mb-2">Pro Tip:</p>
            <p className="text-gray-700">
              Create a master general conditions spreadsheet with typical costs for your area. Update it quarterly with current rental rates, permit fees, and hourly costs. This makes estimating faster and more accurate.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-8 mt-12 mb-12">
          <h3 className="text-2xl font-bold mb-3">Get the Complete Estimating Checklist</h3>
          <p className="text-blue-100 mb-6 text-lg">
            Never miss another general condition item. Our professional estimating checklist includes a complete general conditions template with typical costs, a customizable Excel calculator, and project-specific checklists for residential and commercial work.
          </p>
          <Link
            href="/products/estimating-checklist"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Estimating Checklist - $29 →
          </Link>
          <p className="text-sm text-blue-200 mt-3">Includes general conditions calculator, labor burden worksheet, and 25+ reference sheets</p>
        </div>

        {/* Related Posts */}
        <div className="border-t border-gray-200 pt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/blog/labor-burden-calculation-guide" className="group block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Labor Burden Calculation for Contractors
              </h4>
              <p className="text-gray-600 text-sm">Learn how to calculate true labor costs including all burden and overhead.</p>
            </Link>
            <Link href="/blog/common-estimating-mistakes" className="group block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Common Estimating Mistakes That Cost You Money
              </h4>
              <p className="text-gray-600 text-sm">Avoid the 10 most expensive mistakes contractors make when estimating.</p>
            </Link>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-semibold">Share this article:</span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Twitter
            </button>
            <button className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors">
              LinkedIn
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Email
            </button>
          </div>
        </div>

        {/* Comments Placeholder */}
        <div className="border-t border-gray-200 pt-12 mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments</h3>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">Comments are coming soon! For now, share your questions in our community.</p>
            <Link href="/membership" className="inline-block mt-4 text-blue-600 font-semibold hover:text-blue-700">
              Join MC2 Pro Community →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
