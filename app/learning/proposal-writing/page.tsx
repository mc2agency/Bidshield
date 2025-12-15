'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ProposalWritingPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/learning" className="inline-flex items-center text-slate-300 hover:text-white mb-4 text-sm">
            ← Back to Learning Center
          </Link>
          <div className="inline-block mb-4 px-4 py-2 bg-emerald-500/20 rounded-full text-sm font-semibold text-emerald-300">
            Free Learning Resource
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Writing Professional Construction Proposals
          </h1>
          <p className="text-xl text-slate-300">
            Master the art of crafting compelling proposals that win projects and communicate professionalism, value, and expertise.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sticky Table of Contents - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                <a href="#intro" className="block text-sm text-gray-600 hover:text-emerald-600">Introduction</a>
                <a href="#components" className="block text-sm text-gray-600 hover:text-emerald-600">Essential Components</a>
                <a href="#cover-letter" className="block text-sm text-gray-600 hover:text-emerald-600">Cover Letter</a>
                <a href="#scope-of-work" className="block text-sm text-gray-600 hover:text-emerald-600">Scope of Work</a>
                <a href="#pricing" className="block text-sm text-gray-600 hover:text-emerald-600">Pricing Presentation</a>
                <a href="#timeline" className="block text-sm text-gray-600 hover:text-emerald-600">Project Timeline</a>
                <a href="#differentiation" className="block text-sm text-gray-600 hover:text-emerald-600">Stand Out from Competition</a>
                <a href="#mistakes" className="block text-sm text-gray-600 hover:text-emerald-600">Common Mistakes</a>
                <a href="#templates" className="block text-sm text-gray-600 hover:text-emerald-600">Templates & Tools</a>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Related Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/learning/finding-work" className="text-sm text-emerald-600 hover:text-emerald-700">
                      → Finding Work
                    </Link>
                  </li>
                  <li>
                    <Link href="/learning/estimating-best-practices" className="text-sm text-emerald-600 hover:text-emerald-700">
                      → Estimating Best Practices
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-8 prose prose-lg max-w-none">

              {/* Introduction */}
              <section id="intro" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction: The Power of a Great Proposal</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Your proposal is often the first professional impression a general contractor or building owner gets of your company. It&apos;s not just about price—it&apos;s about demonstrating competence, professionalism, and understanding of the project.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  A well-crafted proposal can make the difference between winning at a fair price versus losing to a low-baller, or worse, winning a project you shouldn&apos;t have bid because you missed critical scope items.
                </p>
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 my-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-emerald-800">
                        <strong>Key Insight:</strong> GCs and owners read dozens of proposals. The ones that are clear, thorough, and professional stand out immediately. Make it easy for them to choose you.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Essential Components */}
              <section id="components" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Essential Proposal Components</h2>

                <p className="text-gray-700 leading-relaxed mb-6">
                  Every professional construction proposal should include these core elements:
                </p>

                <div className="space-y-4">
                  {[
                    {
                      title: 'Cover Letter',
                      desc: 'Personal introduction and project understanding',
                      icon: '✉️'
                    },
                    {
                      title: 'Company Overview',
                      desc: 'Brief background, credentials, and relevant experience',
                      icon: '🏢'
                    },
                    {
                      title: 'Scope of Work',
                      desc: 'Detailed description of what will be done (and not done)',
                      icon: '📋'
                    },
                    {
                      title: 'Pricing Breakdown',
                      desc: 'Clear presentation of costs and value',
                      icon: '💰'
                    },
                    {
                      title: 'Project Timeline',
                      desc: 'Schedule with key milestones and completion date',
                      icon: '📅'
                    },
                    {
                      title: 'Terms & Conditions',
                      desc: 'Payment terms, warranties, exclusions, and legal protection',
                      icon: '📄'
                    },
                    {
                      title: 'References & Portfolio',
                      desc: 'Past projects and client testimonials',
                      icon: '⭐'
                    },
                    {
                      title: 'Insurance & Licensing',
                      desc: 'Proof of coverage and credentials',
                      icon: '🛡️'
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Cover Letter */}
              <section id="cover-letter" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Writing an Effective Cover Letter</h2>

                <button
                  onClick={() => toggleSection('cover-letter')}
                  className="w-full text-left mb-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">Click to expand/collapse section</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${activeSection === 'cover-letter' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {(activeSection === 'cover-letter' || activeSection === null) && (
                  <div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Your cover letter is the handshake before the meeting. It should be warm, professional, and demonstrate that you understand the project.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">What to Include:</h3>
                    <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                      <li>Personalized greeting (research the decision-maker&apos;s name)</li>
                      <li>Reference to the specific project by name and location</li>
                      <li>Brief statement of your company&apos;s qualifications</li>
                      <li>Highlight of relevant experience on similar projects</li>
                      <li>Expression of enthusiasm for the opportunity</li>
                      <li>Clear next steps and contact information</li>
                    </ul>

                    <div className="bg-white border-2 border-emerald-500 rounded-lg p-6 my-6">
                      <h4 className="font-bold text-gray-900 mb-3">Example Cover Letter Opening:</h4>
                      <div className="bg-gray-50 rounded p-4 text-sm text-gray-700 italic leading-relaxed">
                        <p className="mb-3">
                          Dear Mr. Johnson,
                        </p>
                        <p className="mb-3">
                          Thank you for the opportunity to submit our proposal for the roof replacement at Oakwood Elementary School. We understand the importance of completing this work during the summer break to minimize disruption to students and staff.
                        </p>
                        <p className="mb-3">
                          ABC Roofing has completed over 40 school roofing projects in the past five years, including similar TPO installations at Lincoln Middle School and Roosevelt High School. We specialize in institutional roofing and understand the unique scheduling, safety, and coordination requirements these projects demand.
                        </p>
                        <p>
                          We are confident our approach will deliver a quality roof on time and within budget...
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                      <p className="text-sm text-amber-800">
                        <strong>Pro Tip:</strong> Avoid generic language like &quot;We are the best roofing company.&quot; Instead, demonstrate your understanding with specifics: &quot;We noticed the roof has 14 HVAC units that will need to be coordinated with mechanical trades.&quot;
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Scope of Work */}
              <section id="scope-of-work" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Writing a Compelling Scope of Work</h2>

                <p className="text-gray-700 leading-relaxed mb-6">
                  The scope of work is the heart of your proposal. It protects you legally and demonstrates to the client that you understand exactly what needs to be done.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Best Practices for Scope Writing:</h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                    <h4 className="font-bold text-emerald-900 mb-3">DO Include:</h4>
                    <ul className="space-y-2 text-sm text-emerald-800">
                      <li>✓ Specific materials and manufacturers</li>
                      <li>✓ Quantities where applicable</li>
                      <li>✓ Installation methods and standards</li>
                      <li>✓ Quality control procedures</li>
                      <li>✓ Cleanup and disposal requirements</li>
                      <li>✓ Warranty details</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <h4 className="font-bold text-red-900 mb-3">DON&apos;T Include:</h4>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li>✗ Vague terms like &quot;as needed&quot;</li>
                      <li>✗ Assumptions without clarification</li>
                      <li>✗ Responsibilities of other trades</li>
                      <li>✗ Items you&apos;re excluding (put these separate)</li>
                      <li>✗ Overly technical jargon</li>
                      <li>✗ Contradictory statements</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white border-2 border-teal-600 rounded-lg overflow-hidden my-6">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3">
                    <h4 className="font-bold text-white">Sample Scope of Work Section:</h4>
                  </div>
                  <div className="p-6">
                    <div className="bg-gray-50 rounded p-4 text-sm text-gray-700 font-mono">
                      <p className="font-bold mb-2">ROOFING SCOPE:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Remove existing 4-ply built-up roof system (approx. 12,500 SF)</li>
                        <li>• Dispose of all roofing debris off-site in accordance with local regulations</li>
                        <li>• Install new tapered polyiso insulation system (R-value 30 minimum)</li>
                        <li>• Install 60-mil Firestone UltraPly TPO membrane, fully adhered</li>
                        <li>• Install new aluminum coping and counterflashing</li>
                        <li>• Install (14) new roof drains with overflow scuppers</li>
                        <li>• Install walkway pads at all rooftop equipment</li>
                        <li>• Provide 20-year NDL manufacturer warranty</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">The Power of Exclusions:</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Always include a clear &quot;Exclusions&quot; or &quot;Not Included&quot; section. This prevents scope creep and protects you from assumptions.
                </p>

                <div className="bg-gray-100 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Common Exclusions to List:</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Structural repairs to roof deck',
                      'HVAC equipment relocation',
                      'Interior ceiling repairs',
                      'Permits and inspections',
                      'Asbestos abatement',
                      'Electrical work',
                      'Security or access badging',
                      'Work outside normal business hours',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-red-600">⊘</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Pricing Presentation */}
              <section id="pricing" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Pricing Presentation Strategies</h2>

                <p className="text-gray-700 leading-relaxed mb-6">
                  How you present your price is just as important as the price itself. The goal is to communicate value, not just cost.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Pricing Format Options:</h3>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">1. Lump Sum (Most Common)</h4>
                    <p className="text-gray-700 mb-3">
                      A single total price for the complete scope of work.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <strong className="text-emerald-600">Best for:</strong> Most commercial projects, private work<br/>
                      <strong className="text-emerald-600">Example:</strong> &quot;Total Project Cost: $127,500&quot;
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">2. Itemized Breakdown</h4>
                    <p className="text-gray-700 mb-3">
                      Separate line items for major scope components.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm font-mono">
                      Tear-off and disposal: $12,500<br/>
                      Insulation: $31,250<br/>
                      TPO membrane: $56,000<br/>
                      Metal work: $18,750<br/>
                      Accessories: $9,000<br/>
                      <div className="border-t border-gray-300 mt-2 pt-2 font-bold">
                        Total: $127,500
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">3. Unit Pricing</h4>
                    <p className="text-gray-700 mb-3">
                      Price per square foot or unit (useful for repairs or phased work).
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <strong className="text-emerald-600">Best for:</strong> Service contracts, repair work, on-call services<br/>
                      <strong className="text-emerald-600">Example:</strong> &quot;$10.20 per square foot installed&quot;
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white mt-6">
                  <h3 className="font-bold text-xl mb-2">Value-Added Pricing Strategy</h3>
                  <p className="text-emerald-100 mb-4">
                    Instead of leading with price, present value first. Show what they&apos;re getting, then the investment required.
                  </p>
                  <div className="bg-white/10 rounded-lg p-4 text-sm">
                    <strong>Example:</strong> &quot;This proposal includes a 20-year NDL warranty, certified installers, 24/7 emergency service for the first year, and a dedicated project manager. Total investment: $127,500.&quot;
                  </div>
                </div>
              </section>

              {/* Project Timeline */}
              <section id="timeline" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Creating a Realistic Project Timeline</h2>

                <p className="text-gray-700 leading-relaxed mb-6">
                  A clear timeline demonstrates planning and professionalism. It also sets expectations and protects you from unrealistic demands.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Timeline Components:</h3>

                <div className="space-y-3 mb-6">
                  {[
                    { phase: 'Pre-Construction', duration: '2-3 weeks', tasks: 'Permits, submittals, material procurement' },
                    { phase: 'Mobilization', duration: '1-2 days', tasks: 'Equipment delivery, safety setup, site protection' },
                    { phase: 'Demolition', duration: '3-5 days', tasks: 'Tear-off existing roof, haul debris' },
                    { phase: 'Installation', duration: '10-15 days', tasks: 'Insulation, membrane, flashings, accessories' },
                    { phase: 'Inspection & Closeout', duration: '1 week', tasks: 'Final inspection, warranty processing, documentation' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-900">{item.phase}</h4>
                          <span className="text-sm text-emerald-600 font-semibold">{item.duration}</span>
                        </div>
                        <p className="text-sm text-gray-600">{item.tasks}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Always include weather contingencies and note that the timeline assumes normal weather conditions and timely client approvals. This protects you from delays outside your control.
                  </p>
                </div>
              </section>

              {/* Differentiation */}
              <section id="differentiation" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Standing Out from the Competition</h2>

                <p className="text-gray-700 leading-relaxed mb-6">
                  In competitive bidding, you&apos;re rarely the only option. Here&apos;s how to differentiate your proposal when you&apos;re not the lowest price.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-emerald-500 rounded-lg p-6">
                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      Demonstrate Understanding
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Show that you&apos;ve thoroughly reviewed the project and understand its unique challenges.
                    </p>
                    <div className="text-xs text-gray-600 italic">
                      &quot;We noticed the roof is directly above the data center. Our crew will implement extra protection measures to prevent any water intrusion during installation.&quot;
                    </div>
                  </div>

                  <div className="bg-white border-2 border-teal-600 rounded-lg p-6">
                    <h3 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">⚡</span>
                      Highlight Expertise
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Showcase relevant certifications, specialized training, or manufacturer partnerships.
                    </p>
                    <div className="text-xs text-gray-600">
                      • Firestone Master Contractor<br/>
                      • OSHA 30-Hour Certified Crew<br/>
                      • 15+ Healthcare Facility Projects
                    </div>
                  </div>

                  <div className="bg-white border-2 border-emerald-500 rounded-lg p-6">
                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🛡️</span>
                      Provide Assurance
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Reduce perceived risk with guarantees, insurance details, and solid references.
                    </p>
                    <div className="text-xs text-gray-600">
                      • $5M General Liability Insurance<br/>
                      • 20-Year NDL Warranty<br/>
                      • 5 Recent School District References
                    </div>
                  </div>

                  <div className="bg-white border-2 border-teal-600 rounded-lg p-6">
                    <h3 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">📸</span>
                      Use Visuals
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Include photos of similar completed projects, especially in similar buildings or conditions.
                    </p>
                    <div className="text-xs text-gray-600 italic">
                      A well-designed proposal with professional photos stands out in a stack of text-only bids.
                    </div>
                  </div>
                </div>
              </section>

              {/* Common Mistakes */}
              <section id="mistakes" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Proposal Mistakes to Avoid</h2>

                <div className="space-y-4">
                  {[
                    {
                      title: 'Generic, Copy-Paste Proposals',
                      desc: 'Every proposal should be customized to the specific project. At minimum, use the correct project name, location, and client name throughout.',
                      impact: 'High - Shows lack of attention to detail'
                    },
                    {
                      title: 'Typos and Formatting Errors',
                      desc: 'Spelling mistakes, inconsistent fonts, and poor formatting make you look unprofessional. Always proofread.',
                      impact: 'High - Questions your attention to quality'
                    },
                    {
                      title: 'Vague Scope Descriptions',
                      desc: 'Terms like &quot;install roofing as needed&quot; create disputes later. Be specific about quantities, methods, and materials.',
                      impact: 'Critical - Legal and financial risk'
                    },
                    {
                      title: 'Missing Exclusions',
                      desc: 'Failing to clearly state what&apos;s NOT included leads to scope creep and client disappointment.',
                      impact: 'High - Potential for disputes'
                    },
                    {
                      title: 'Unclear Payment Terms',
                      desc: 'State your payment schedule clearly: deposit amount, progress billing, retention, and final payment.',
                      impact: 'Medium - Cash flow issues'
                    },
                    {
                      title: 'Too Much Technical Jargon',
                      desc: 'While you want to sound knowledgeable, remember that non-technical clients need to understand your proposal.',
                      impact: 'Low - Communication barrier'
                    },
                    {
                      title: 'No Follow-Up Plan',
                      desc: 'Don&apos;t just submit and wait. State when you&apos;ll follow up: &quot;I will call you on Thursday to discuss any questions.&quot;',
                      impact: 'Medium - Missed opportunities'
                    },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-red-900">{item.title}</h4>
                          <p className="text-sm text-red-700 mt-1">{item.desc}</p>
                        </div>
                        <span className="flex-shrink-0 text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
                          {item.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Templates & Tools */}
              <section id="templates" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Templates & Tools for Faster Proposals</h2>

                <p className="text-gray-700 leading-relaxed mb-6">
                  Professional contractors don&apos;t start from scratch every time. They use templates and tools to create consistent, high-quality proposals quickly.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Essential Templates You Need:</h3>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all">
                    <div className="text-3xl mb-3">📝</div>
                    <h3 className="font-bold text-gray-900 mb-2">Cover Letter Template</h3>
                    <p className="text-sm text-gray-600">Customizable introduction with proven language</p>
                  </div>
                  <div className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all">
                    <div className="text-3xl mb-3">📋</div>
                    <h3 className="font-bold text-gray-900 mb-2">Scope of Work Library</h3>
                    <p className="text-sm text-gray-600">Pre-written scope sections by roof type</p>
                  </div>
                  <div className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all">
                    <div className="text-3xl mb-3">💼</div>
                    <h3 className="font-bold text-gray-900 mb-2">Terms & Conditions</h3>
                    <p className="text-sm text-gray-600">Legal protection and payment terms</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Software Tools Worth Considering:</h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Microsoft Word or Google Docs</h4>
                      <p className="text-sm text-gray-600">For small operations, well-designed Word templates work great and are easy to customize.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Proposal Software (Proposify, PandaDoc)</h4>
                      <p className="text-sm text-gray-600">Professional tools with e-signature, tracking, and beautiful templates. Best for $1M+ annual volume.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Canva or Adobe InDesign</h4>
                      <p className="text-sm text-gray-600">For adding visual polish with custom graphics, project photos, and branded design elements.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Summary */}
              <section className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-8 mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Takeaways</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Your proposal is a marketing document, not just a price quote—it should sell your value</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Be specific in your scope of work to avoid scope creep and protect yourself legally</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Clearly state exclusions—what you&apos;re NOT doing is as important as what you are</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Demonstrate understanding of the project&apos;s unique challenges to stand out</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Use templates and systems to create consistent, professional proposals efficiently</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl p-8 mt-8 border border-slate-700">
              <div className="text-center">
                <div className="inline-block mb-4 px-4 py-2 bg-emerald-500/20 rounded-full">
                  <span className="text-emerald-300 text-sm font-semibold">Professional Templates</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Get Professional Proposal Templates
                </h3>
                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                  Stop starting from scratch. Get our complete set of professional proposal templates including cover letters, scope of work libraries, terms & conditions, and pricing presentation formats. Fully customizable for your business.
                </p>
                <div className="bg-white/10 rounded-lg p-6 mb-6 max-w-xl mx-auto">
                  <div className="text-sm text-slate-300 mb-2">Includes:</div>
                  <ul className="text-left space-y-2 text-sm text-white">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>5 Cover Letter Templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Scope of Work Library (TPO, EPDM, Metal, Tile)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Pricing Presentation Formats</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Terms & Conditions Template</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Project Timeline Template</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Company Profile Template</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    $79
                  </div>
                  <div className="text-slate-400">One-time purchase • Instant download</div>
                </div>
                <Link
                  href="/products/proposal-templates"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl text-lg mb-3"
                >
                  Get Templates Now →
                </Link>
                <p className="text-sm text-slate-400">Microsoft Word & Google Docs formats • Fully customizable • 30-day money-back guarantee</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
