'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function FindingWorkPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/learning" className="inline-flex items-center text-blue-200 hover:text-white mb-4 text-sm">
            ← Back to Learning Center
          </Link>
          <div className="inline-block mb-4 px-4 py-2 bg-blue-700/50 rounded-full text-sm font-semibold">
            Free Learning Resource
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Where to Find Construction Leads
          </h1>
          <p className="text-xl text-blue-100">
            The complete guide to finding high-quality commercial roofing projects and building relationships with general contractors.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sticky Table of Contents - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                <a href="#intro" className="block text-sm text-gray-600 hover:text-blue-600">Introduction</a>
                <a href="#buildingconnected" className="block text-sm text-gray-600 hover:text-blue-600">BuildingConnected</a>
                <a href="#dodge" className="block text-sm text-gray-600 hover:text-blue-600">Dodge Reports</a>
                <a href="#other-platforms" className="block text-sm text-gray-600 hover:text-blue-600">Other Bid Platforms</a>
                <a href="#government" className="block text-sm text-gray-600 hover:text-blue-600">Government Projects</a>
                <a href="#gc-relationships" className="block text-sm text-gray-600 hover:text-blue-600">Building GC Relationships</a>
                <a href="#marketing" className="block text-sm text-gray-600 hover:text-blue-600">Digital Marketing</a>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Related Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/learning/proposal-writing" className="text-sm text-blue-600 hover:text-blue-700">
                      → Proposal Writing
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses/estimating-fundamentals" className="text-sm text-blue-600 hover:text-blue-700">
                      → Estimating Fundamentals
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-8 prose prose-lg max-w-none">

              {/* Introduction */}
              <section id="intro" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Finding quality leads is the lifeblood of any successful roofing contracting business. Whether you're just starting out or looking to expand into commercial work, knowing where to find projects and how to access them is critical.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Key Insight:</strong> The best contractors don't wait for work to come to them. They actively pursue opportunities across multiple channels.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* BuildingConnected */}
              <section id="buildingconnected" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">1. BuildingConnected (Autodesk Construction Cloud)</h2>

                <button
                  onClick={() => toggleSection('buildingconnected')}
                  className="w-full text-left mb-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">Click to expand/collapse section</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${activeSection === 'buildingconnected' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {(activeSection === 'buildingconnected' || activeSection === null) && (
                  <div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      BuildingConnected (now part of Autodesk Construction Cloud) is the largest network for commercial construction bidding in North America. It's where general contractors post projects and invite subcontractors to bid.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">How It Works:</h3>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                      <li>Free to join as a subcontractor</li>
                      <li>Create a detailed company profile highlighting your roofing specialties</li>
                      <li>Get notified when GCs invite you to bid on projects</li>
                      <li>Search for public projects in your area</li>
                      <li>Download plans, specs, and addenda electronically</li>
                    </ul>

                    <div className="bg-gray-100 rounded-lg p-6 my-6">
                      <h4 className="font-bold text-gray-900 mb-3">Getting Started Checklist:</h4>
                      <div className="space-y-2">
                        <label className="flex items-start gap-3">
                          <input type="checkbox" className="mt-1" />
                          <span className="text-gray-700">Create account at buildingconnected.com</span>
                        </label>
                        <label className="flex items-start gap-3">
                          <input type="checkbox" className="mt-1" />
                          <span className="text-gray-700">Complete company profile (100% completion recommended)</span>
                        </label>
                        <label className="flex items-start gap-3">
                          <input type="checkbox" className="mt-1" />
                          <span className="text-gray-700">Upload insurance certificates and license</span>
                        </label>
                        <label className="flex items-start gap-3">
                          <input type="checkbox" className="mt-1" />
                          <span className="text-gray-700">Add portfolio photos of completed projects</span>
                        </label>
                        <label className="flex items-start gap-3">
                          <input type="checkbox" className="mt-1" />
                          <span className="text-gray-700">Set up bid invite notifications</span>
                        </label>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">Pro Tips:</h3>
                    <ul className="space-y-3 mb-4">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                        <div>
                          <strong className="text-gray-900">Be Specific:</strong>
                          <p className="text-gray-700">Don't just list "roofing" - specify TPO, EPDM, metal, green roofs, etc. GCs filter by specialty.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                        <div>
                          <strong className="text-gray-900">Respond Quickly:</strong>
                          <p className="text-gray-700">When invited to bid, acknowledge within 24 hours. GCs notice response times.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
                        <div>
                          <strong className="text-gray-900">Search Regularly:</strong>
                          <p className="text-gray-700">Check for new public projects daily. Set your search radius to 50-100 miles depending on your capacity.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </section>

              {/* Dodge Reports */}
              <section id="dodge" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Dodge Construction Network</h2>

                <p className="text-gray-700 leading-relaxed mb-4">
                  Dodge (formerly McGraw-Hill Construction) is a paid subscription service that provides early-stage project intelligence. This is where you find projects before they go out to bid.
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-bold text-green-900 mb-2">Advantages:</h4>
                    <ul className="space-y-1 text-sm text-green-800">
                      <li>• Early project notification (pre-bid stage)</li>
                      <li>• Contact info for owners, architects, GCs</li>
                      <li>• Project scope and budget estimates</li>
                      <li>• Bidder lists (see who else is bidding)</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-bold text-red-900 mb-2">Disadvantages:</h4>
                    <ul className="space-y-1 text-sm text-red-800">
                      <li>• Expensive ($200-500/month depending on region)</li>
                      <li>• Requires proactive outreach to GCs</li>
                      <li>• Not all projects result in bids</li>
                      <li>• Learning curve to use effectively</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-6 my-6">
                  <h4 className="font-bold text-gray-900 mb-2">Cost-Benefit Analysis:</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Is Dodge worth it? Here's the math:
                  </p>
                  <div className="bg-white rounded p-4 font-mono text-sm space-y-1">
                    <div>Monthly cost: $300</div>
                    <div>Average roofing project value: $50,000</div>
                    <div>If you land ONE project per year from Dodge leads...</div>
                    <div className="pt-2 border-t border-gray-300 font-bold">ROI: 1,500%+</div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  <strong>Recommendation:</strong> If you're doing $500k+ in annual revenue and want to grow, Dodge is worth the investment. If you're smaller, focus on free platforms first.
                </p>
              </section>

              {/* Other Platforms */}
              <section id="other-platforms" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Other Bid Platforms</h2>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">PlanHub</h3>
                    <p className="text-gray-700 mb-3">
                      User-friendly platform popular with mid-sized GCs. Free basic account, paid plans for advanced features.
                    </p>
                    <div className="text-sm text-gray-600">
                      <strong>Best for:</strong> Regional contractors, residential-to-commercial transition
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">iSqFt</h3>
                    <p className="text-gray-700 mb-3">
                      Well-established platform with strong presence in certain regions. Subscription-based.
                    </p>
                    <div className="text-sm text-gray-600">
                      <strong>Best for:</strong> Multi-state contractors, high volume bidding
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">BidClerk</h3>
                    <p className="text-gray-700 mb-3">
                      Free and paid tiers. Good for finding public projects and smaller private work.
                    </p>
                    <div className="text-sm text-gray-600">
                      <strong>Best for:</strong> Contractors just starting with commercial work
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ConstructConnect</h3>
                    <p className="text-gray-700 mb-3">
                      Comprehensive construction data platform. Premium pricing for enterprise-level features.
                    </p>
                    <div className="text-sm text-gray-600">
                      <strong>Best for:</strong> Large contractors with dedicated estimating teams
                    </div>
                  </div>
                </div>
              </section>

              {/* Government Projects */}
              <section id="government" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Government Bid Sources</h2>

                <p className="text-gray-700 leading-relaxed mb-4">
                  Government projects (federal, state, local) are publicly advertised and must follow competitive bidding processes. These can be lucrative but require patience and understanding of public procurement rules.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Federal Projects:</h3>
                <div className="bg-gray-100 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-2">SAM.gov (System for Award Management)</h4>
                  <p className="text-gray-700 mb-3">
                    The official U.S. government system for finding federal contracting opportunities.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>100% free to use</li>
                    <li>Required registration for all federal contractors</li>
                    <li>Access to opportunities across all federal agencies</li>
                    <li>Electronic bid submission</li>
                  </ul>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">State & Local Projects:</h3>
                <p className="text-gray-700 mb-3">Each state and municipality has its own bid portal:</p>
                <ul className="space-y-2 mb-4 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">→</span>
                    <span><strong>California:</strong> Cal eProcure, PlanetBids</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">→</span>
                    <span><strong>Texas:</strong> ESBD (Electronic State Business Daily)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">→</span>
                    <span><strong>New York:</strong> NYS Contract Reporter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">→</span>
                    <span><strong>Florida:</strong> MyFloridaMarketPlace</span>
                  </li>
                </ul>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Important:</strong> Government projects often require bonding, certified payroll, and prevailing wage compliance. Make sure you understand these requirements before bidding.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Building GC Relationships */}
              <section id="gc-relationships" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Building Relationships with General Contractors</h2>

                <p className="text-gray-700 leading-relaxed mb-4">
                  The most successful roofing contractors don't just wait for bid invitations - they actively cultivate relationships with GCs who become repeat customers.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Relationship-Building Strategies:</h3>

                <div className="space-y-6">
                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">1. Cold Outreach</h4>
                    <p className="text-gray-700 mb-3">
                      Research GCs in your area who do projects in the $1M-$10M range. These are often perfect for roofing subs.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <strong>Email Template:</strong>
                      <p className="mt-2 italic text-gray-600">
                        "Hi [Name], I'm [Your Name] with [Company]. We specialize in commercial TPO and EPDM roofing in [City]. I noticed you recently completed [Project Name] and wanted to introduce our company. We'd love to be on your bid list for future roofing work. Can I send you our company profile and recent project portfolio?"
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">2. Industry Events</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>AGC (Associated General Contractors) chapter meetings</li>
                      <li>ABC (Associated Builders and Contractors) events</li>
                      <li>Local construction networking groups</li>
                      <li>Trade shows and conferences</li>
                    </ul>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">3. Be a Problem Solver</h4>
                    <p className="text-gray-700">
                      When a GC has a project with a tight deadline or tricky detail, be the contractor who says "yes" and delivers. One successful emergency project can lead to years of repeat work.
                    </p>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">4. Stay in Touch</h4>
                    <p className="text-gray-700 mb-2">
                      Even if you don't win a bid, send a follow-up:
                    </p>
                    <p className="text-sm italic text-gray-600 bg-gray-50 rounded p-3">
                      "Thanks for the opportunity to bid [Project]. We know we weren't the low bidder this time, but we'd appreciate being included on future roofing projects. Please keep us in mind."
                    </p>
                  </div>
                </div>
              </section>

              {/* Digital Marketing */}
              <section id="marketing" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Digital Marketing for Lead Generation</h2>

                <p className="text-gray-700 leading-relaxed mb-6">
                  Modern contractors use digital marketing to attract inbound leads. This takes time to build but can create a steady stream of opportunities.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-3">Website & SEO</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Professional website showcasing projects</li>
                      <li>• Target local keywords ("commercial roofing [city]")</li>
                      <li>• Case studies and portfolio</li>
                      <li>• Contact form and quote requests</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-3">LinkedIn</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Connect with local GCs and project managers</li>
                      <li>• Share project updates and expertise</li>
                      <li>• Join construction industry groups</li>
                      <li>• Post regularly about your work</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-3">Google Business Profile</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Free listing in Google Maps</li>
                      <li>• Collect reviews from satisfied clients</li>
                      <li>• Post photos of completed projects</li>
                      <li>• Respond to inquiries quickly</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-3">Email Marketing</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Quarterly newsletter to GC contacts</li>
                      <li>• Highlight recent projects</li>
                      <li>• Share industry insights</li>
                      <li>• Announce new capabilities</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Summary */}
              <section className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Takeaways</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Start with free platforms like BuildingConnected before investing in paid services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Government projects require additional compliance but offer steady work</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Building GC relationships is more valuable than chasing every bid opportunity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Diversify your lead sources - don't rely on just one platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Digital marketing builds long-term value even though results take time</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Want the Complete Lead Generation Playbook?
                </h3>
                <p className="text-gray-600 mb-6">
                  Get the full guide with email templates, tracking spreadsheets, bid platform comparison charts, and step-by-step checklists for every lead source.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">$39</div>
                  <div className="text-gray-500">One-time purchase</div>
                </div>
                <Link
                  href="/products/lead-generation-playbook"
                  className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg mb-3"
                >
                  Get the Playbook →
                </Link>
                <p className="text-sm text-gray-500">Instant download • 30-day money-back guarantee</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
