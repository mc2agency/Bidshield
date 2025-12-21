import Link from 'next/link';
import { Metadata } from 'next';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export const metadata: Metadata = {
  title: 'Construction Submittals Tool - Shop Drawings & RFIs | MC2 Estimating',
  description: 'Master the complete submittal process for commercial construction. Master shop drawings, product submittals, RFIs, change orders, and closeout documentation.',
  keywords: 'construction submittals, shop drawings, RFI process, product submittals, commercial construction, submittal logs, contractor submittals'
};

export default function ConstructionSubmittalsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold">
                COMMERCIAL CONSTRUCTION ESSENTIAL
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Construction Submittals
                <br />
                <span className="text-blue-300">Masterclass</span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Navigate the commercial construction submittal process with confidence. From shop drawings to closeout, master every document type.
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div>
                  <div className="text-5xl font-bold">$197</div>
                  <div className="text-blue-200">One-time payment</div>
                </div>
                <div className="h-12 w-px bg-blue-600" />
                <div className="space-y-1">
                  <div className="text-sm text-blue-200">6 Process Parts</div>
                  <div className="text-sm text-blue-200">4+ Hours of Content</div>
                  <div className="text-sm text-blue-200">Lifetime Access</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#purchase"
                  className="inline-block px-8 py-4 bg-yellow-400 text-blue-900 rounded-lg font-bold hover:bg-yellow-300 transition-colors text-lg text-center"
                >
                  Get Access - $197
                </a>
                <a
                  href="#curriculum"
                  className="inline-block px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-lg text-center"
                >
                  View Curriculum
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Proof of completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Templates & checklists</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-600">
              <h3 className="text-2xl font-bold mb-6">This Tool Includes:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Submittal Log Templates</div>
                    <div className="text-sm text-blue-200">Track every submittal from start to finish</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Cover Sheet Templates</div>
                    <div className="text-sm text-blue-200">Professional submittal package formats</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">RFI Templates & Examples</div>
                    <div className="text-sm text-blue-200">Request information professionally</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Real Submittal Packages</div>
                    <div className="text-sm text-blue-200">Approved examples from actual projects</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Closeout Checklists</div>
                    <div className="text-sm text-blue-200">O&M manuals, warranties, as-builts</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Completion Badge</div>
                    <div className="text-sm text-blue-200">Add to LinkedIn and resume</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Confused by the Submittal Process?
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Submittals getting rejected because they're incomplete or improperly formatted</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Unclear what documents are required for different submittal types</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Missing critical deadlines and delaying project starts</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Don't know how to write effective RFIs that get quick responses</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Overwhelmed by closeout documentation requirements</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Losing final payment because closeout docs are incomplete</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-6">
                Master the Complete Submittal Process
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Create complete, professional submittals that get approved first time</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Know exactly what to include for each submittal type</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Track and manage submittal deadlines with organized systems</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Write clear, effective RFIs that architects actually respond to</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Organize closeout documentation systematically</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Get final payment faster with complete, organized closeout packages</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submittal Types Overview */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            What You'll Get to Create
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Product Submittals</h3>
              <p className="text-gray-700 mb-4">
                Material data sheets, test reports, certifications, and manufacturer specifications organized for GC/architect approval.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Product data compilation</li>
                <li>• Technical specifications</li>
                <li>• Test reports & certifications</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">📐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Shop Drawings</h3>
              <p className="text-gray-700 mb-4">
                Detailed construction drawings showing how you'll install systems, coordinate with other trades, and meet specifications.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Installation drawings</li>
                <li>• Detail coordination</li>
                <li>• As-planned layouts</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">❓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">RFIs & Changes</h3>
              <p className="text-gray-700 mb-4">
                Request for Information, clarifications, change orders, and all communication documentation during construction.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• RFI writing best practices</li>
                <li>• Change order documentation</li>
                <li>• Communication logs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Curriculum Section */}
      <section id="curriculum" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete Tool Curriculum
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              6 parts covering the entire commercial construction submittal lifecycle
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Part 1 */}
            <PartCard
              number={1}
              title="Submittal Process Overview"
              duration="45 minutes"
              sections={[
                "Understanding the GC/architect submittal workflow",
                "Reading submittal requirements in specifications",
                "Submittal vs. shop drawing vs. sample",
                "Timeline and deadlines management",
                "Common rejection reasons and how to avoid them",
                "Setting up a submittal tracking system"
              ]}
            />

            {/* Part 2 */}
            <PartCard
              number={2}
              title="Product Submittals & Material Data"
              duration="55 minutes"
              sections={[
                "Gathering product data from manufacturers",
                "Organizing technical specifications and test reports",
                "ICC-ES reports and FM approvals",
                "Creating professional cover sheets",
                "Highlighting specification compliance",
                "Digital vs. physical submittal requirements",
                "Resubmittal process when revisions are needed"
              ]}
            />

            {/* Part 3 */}
            <PartCard
              number={3}
              title="Shop Drawing Creation"
              duration="65 minutes"
              sections={[
                "What information shop drawings must include",
                "Creating roofing plan layouts",
                "Detail coordination with architectural drawings",
                "Showing penetrations, drains, and accessories",
                "Edge metal and flashing details",
                "Title blocks and drawing indexes",
                "CAD vs. hand-sketched shop drawings"
              ]}
            />

            {/* Part 4 */}
            <PartCard
              number={4}
              title="RFIs & Project Communication"
              duration="50 minutes"
              sections={[
                "When to write an RFI vs. just asking a question",
                "RFI format and structure that gets responses",
                "Documenting conflicts and discrepancies",
                "Photo and sketch annotations",
                "Tracking RFI responses and resolutions",
                "Using RFIs to document scope changes",
                "Building a paper trail for change orders"
              ]}
            />

            {/* Part 5 */}
            <PartCard
              number={5}
              title="Change Orders & Modifications"
              duration="45 minutes"
              sections={[
                "Identifying scope changes vs. original contract",
                "Documenting change conditions with photos",
                "Pricing change orders fairly and competitively",
                "Change order request formats",
                "Getting change orders approved quickly",
                "Tracking approved changes vs. pending",
                "Protecting yourself from scope creep"
              ]}
            />

            {/* Part 6 */}
            <PartCard
              number={6}
              title="Closeout Documentation"
              duration="60 minutes"
              sections={[
                "Understanding closeout requirements in specs",
                "O&M manuals: what to include and how to organize",
                "Warranty documentation and registration",
                "As-built drawings vs. shop drawings",
                "Test reports and inspection certifications",
                "Lien waivers and final payment documents",
                "Creating a complete closeout package",
                "Digital delivery and organization"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Who This Tool Is For
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">New Commercial Contractors</h3>
              <p className="text-gray-700">
                Moving from residential to commercial work and need to understand the formal submittal process required by GCs and architects.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Project Coordinators</h3>
              <p className="text-gray-700">
                Responsible for managing submittals and want a systematic approach to tracking deadlines and ensuring nothing is missed.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">👨‍💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Project Managers</h3>
              <p className="text-gray-700">
                Need to onboard staff on submittal procedures or improve your company's submittal approval rate and turnaround time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            By the End of This Tool, You'll Be Able To:
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">1</span>
              <p className="text-lg">Create complete product submittals that get approved first time</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">2</span>
              <p className="text-lg">Develop professional shop drawings coordinated with all trades</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">3</span>
              <p className="text-lg">Write effective RFIs that get quick, clear responses</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">4</span>
              <p className="text-lg">Track and manage multiple submittals across different projects</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">5</span>
              <p className="text-lg">Document and price change orders professionally</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">6</span>
              <p className="text-lg">Organize complete closeout packages for final payment</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">7</span>
              <p className="text-lg">Meet submittal deadlines and avoid project delays</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">8</span>
              <p className="text-lg">Build paper trails that protect you from disputes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            What Customers Are Saying
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Real results from contractors mastering submittals
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Michael Torres"
              role="Project Coordinator"
              company="Apex Commercial Roofing"
              quote="We were getting 60% of submittals rejected on first submission. After this tool, we're at 95% approval rate. The templates alone saved us countless hours of rework."
              rating={5}
              highlight="95% approval rate now"
            />

            <TestimonialCard
              name="Jessica Park"
              role="Project Manager"
              company="Summit Construction Group"
              quote="The RFI part was a game-changer. We were writing vague questions that took weeks to get answered. Now our RFIs are clear and we get responses in days, not weeks."
              rating={5}
              highlight="Faster RFI responses"
            />

            <TestimonialCard
              name="David Rodriguez"
              role="Operations Manager"
              company="Elite Roofing Contractors"
              quote="Closeout was always a nightmare. Now we have a system. We got final payment on our last 3 projects within 2 weeks instead of the usual 2-3 months. This tool literally paid for itself on the first project."
              rating={5}
              highlight="2 weeks to final payment"
            />

            <TestimonialCard
              name="Sarah Mitchell"
              role="Estimator/PM"
              company="Coastal Commercial Roofing"
              quote="I was creating shop drawings from scratch every time. The templates and examples in this tool standardized our entire process. We're faster and more professional now."
              rating={5}
              highlight="Standardized entire process"
            />

            <TestimonialCard
              name="Robert Chen"
              role="Owner"
              company="Chen Construction LLC"
              quote="New to commercial work and submittals were intimidating. This tool broke down every step clearly. Now I confidently handle submittal requirements on $500k+ projects."
              rating={5}
              highlight="Confident on large projects"
            />

            <TestimonialCard
              name="Amanda Foster"
              role="Project Coordinator"
              company="Northwest Roofing Systems"
              quote="The submittal log template alone is worth the tool price. We're tracking 15+ projects and nothing falls through the cracks anymore. GCs comment on how organized we are."
              rating={5}
              highlight="Nothing falls through cracks"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <FAQItem
              question="Is this only for roofing contractors?"
              answer="While examples use roofing projects, the submittal process is nearly identical across all commercial construction trades. The principles, templates, and workflows apply to electrical, plumbing, HVAC, and any other specialty contractor."
            />

            <FAQItem
              question="Do I need CAD software to create shop drawings?"
              answer="Not necessarily. We show both CAD and hand-sketched shop drawings. Many successful contractors use simple sketching tools or modify architect drawings in PDF editors. For advanced shop drawings, pair this with our AutoCAD or SketchUp tools."
            />

            <FAQItem
              question="What if I've never done commercial work before?"
              answer="Perfect! This tool starts from the basics and assumes no prior submittal experience. We explain everything step-by-step, including industry terminology and GC/architect expectations."
            />

            <FAQItem
              question="Will I get actual templates I can use?"
              answer="Yes! You get submittal log templates, cover sheet templates, RFI templates, and closeout checklists - all in editable formats. Plus real examples of approved submittals from actual projects."
            />

            <FAQItem
              question="How long does it take to complete?"
              answer="The tool contains 4+ hours of video content. Most users complete it in 1-2 weeks. You have lifetime access, so work at your own pace and reference it during actual projects."
            />

            <FAQItem
              question="What about digital submittal platforms like Procore or PlanGrid?"
              answer="We cover both paper and digital submittal workflows. The process is the same - digital platforms just change how you deliver documents. Understanding the basics is critical regardless of platform."
            />

            <FAQItem
              question="Will this help me get paid faster?"
              answer="Absolutely. Part 6 on closeout documentation is specifically designed to help you organize final paperwork so you can get final payment quickly. Many users report 50-75% faster payment after implementing the closeout system."
            />

            <FAQItem
              question="Is there a money-back guarantee?"
              answer="Yes! 30-day money-back guarantee. If you're not satisfied, email us for a full refund."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="purchase" className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Master Construction Submittals?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Stop getting rejections and start getting approvals
            </p>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl p-8 lg:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Construction Submittals Masterclass - Complete Tool</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">$197</div>
              <p className="text-gray-600">One-time payment • Lifetime access • All updates included</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-bold mb-3">Tool Contents:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>6 process parts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>4+ hours of content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Real submittal walkthroughs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Proof of completion</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-3">Bonus Materials:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Submittal log templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>RFI templates & examples</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Cover sheet templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Closeout checklists</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <GumroadCheckoutButton
                productKey="constructionSubmittals"
                text="Get Access - $197"
                variant="large"
              />

              <div className="flex flex-col items-center gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  <span>Secure payment via Gumroad</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  <span>Instant access after purchase</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-blue-200 mb-4">
              Questions? Email us at support@mc2estimating.com
            </p>
            <Link href="/membership" className="text-yellow-400 hover:text-yellow-300 font-semibold">
              Or get this tool + everything else with MC2 Pro membership →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

interface PartCardProps {
  number: number;
  title: string;
  duration: string;
  sections: string[];
}

function PartCard({ number, title, duration, sections }: PartCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-blue-400 transition-colors">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{duration}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {sections.map((section, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>{section}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  highlight?: string;
}

function TestimonialCard({ name, role, company, quote, rating, highlight }: TestimonialCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
      <div className="flex gap-1 mb-3">
        {[...Array(rating)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-xl">★</span>
        ))}
      </div>
      {highlight && (
        <div className="mb-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold inline-block">
          {highlight}
        </div>
      )}
      <p className="text-gray-700 mb-4 italic">"{quote}"</p>
      <div className="border-t pt-4">
        <div className="font-bold text-gray-900">{name}</div>
        <div className="text-sm text-gray-600">{role}</div>
        <div className="text-sm text-gray-500">{company}</div>
      </div>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
