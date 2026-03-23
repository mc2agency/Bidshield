import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimating Essentials - Complete Construction Estimating Tool',
  description: 'Master construction estimating from specifications to final bid. 8 comprehensive parts covering blueprints, takeoff, pricing, labor costs, and real project walkthroughs. Badge included.',
  keywords: 'construction estimating tool, roofing estimation tools, reading blueprints, Bluebeam takeoff, labor burden calculation, estimating essentials'
};

export default function EstimatingEssentialsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-yellow-400 text-blue-900 rounded-full text-sm font-bold">
                FLAGSHIP TOOL
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Estimating Essentials
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                The complete foundation for professional construction estimating. Everything you need to create accurate, profitable estimates from day one.
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div>
                  <div className="text-5xl font-bold">$497</div>
                  <div className="text-blue-200">One-time payment</div>
                </div>
                <div className="h-12 w-px bg-blue-600" />
                <div className="space-y-1">
                  <div className="text-sm text-blue-200">8 Comprehensive Parts</div>
                  <div className="text-sm text-blue-200">12+ Hours of Content</div>
                  <div className="text-sm text-blue-200">Lifetime Access</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#purchase"
                  className="inline-block px-8 py-4 bg-yellow-400 text-blue-900 rounded-lg font-bold hover:bg-yellow-300 transition-colors text-lg text-center"
                >
                  Get Access - $497
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
                  <span>All templates included</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-600">
              <h3 className="text-2xl font-bold mb-6">This Tool Includes:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">All 5 Roofing System Templates</div>
                    <div className="text-sm text-blue-200">Pre-built Excel estimators ($195 value)</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Complete Estimating Checklist</div>
                    <div className="text-sm text-blue-200">Never miss a line item again ($29 value)</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Practice Drawing Sets</div>
                    <div className="text-sm text-blue-200">Real commercial projects to work with</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Bluebeam Setup Templates</div>
                    <div className="text-sm text-blue-200">Pre-configured tool sets and measurement markups</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Completion Badge</div>
                    <div className="text-sm text-blue-200">Add to LinkedIn and resume</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Lifetime Access + Updates</div>
                    <div className="text-sm text-blue-200">Watch anytime, get all future content</div>
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
                Struggling with Construction Estimating?
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Spending 4-6 hours on estimates that should take 45 minutes</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Missing critical items in specs and losing money on jobs</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Confused by multi-discipline drawings and coordination</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Unsure how to properly calculate labor burden and overhead</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Bidding too low and leaving money on the table</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Mastering estimating by trial and error, losing bids or profit</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-6">
                This Tool Will Transform Your Estimating
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Create complete, accurate estimates in under an hour</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Read specifications like a pro and catch every requirement</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Master multi-discipline coordination (Architectural, Structural, MEP)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Calculate labor, burden, and overhead accurately every time</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Use proven templates that ensure consistent profit margins</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Gain confidence from industry-tested processes, not guesswork</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Curriculum Section */}
      <section id="curriculum" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete Tool Curriculum
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              8 comprehensive parts taking you from reading plans to creating complete, winning estimates
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Part 1 */}
            <PartCard
              number={1}
              title="Reading Construction Specifications"
              duration="90 minutes"
              sections={[
                "CSI MasterFormat division system (Divisions 01-33)",
                "Finding roofing requirements in Division 07",
                "Understanding spec language and requirements",
                "Identifying submittal and warranty requirements",
                "Catching hidden costs in General Conditions",
                "Creating a specification review checklist"
              ]}
            />

            {/* Part 2 */}
            <PartCard
              number={2}
              title="Reading Construction Drawings"
              duration="100 minutes"
              sections={[
                "Understanding drawing types (A, S, M, P, E series)",
                "Reading architectural plans for scope",
                "Interpreting structural drawings (deck types)",
                "Understanding mechanical drawings (HVAC curbs)",
                "Reading plumbing plans (drains, penetrations)",
                "Title blocks, scales, and detail references"
              ]}
            />

            {/* Part 3 */}
            <PartCard
              number={3}
              title="Multi-Discipline Coordination"
              duration="75 minutes"
              sections={[
                "Overlaying multiple disciplines to find conflicts",
                "Identifying roof penetrations from MEP plans",
                "Coordinating structural requirements with roofing",
                "Finding equipment locations and access requirements",
                "Creating a complete scope from all disciplines",
                "Common coordination mistakes and how to avoid them"
              ]}
            />

            {/* Part 4 */}
            <PartCard
              number={4}
              title="Bluebeam Digital Takeoff (Basics)"
              duration="120 minutes"
              sections={[
                "Bluebeam Revu interface and setup",
                "Calibrating plans to scale",
                "Using measurement tools (area, length, count)",
                "Creating custom tool sets for roofing",
                "Generating quantity reports",
                "Best practices for accurate digital takeoff"
              ]}
            />

            {/* Part 5 */}
            <PartCard
              number={5}
              title="Material Pricing & Waste Factors"
              duration="90 minutes"
              sections={[
                "Understanding manufacturer pricing structures",
                "Getting accurate material quotes from suppliers",
                "Calculating waste factors by system type",
                "Pitch multipliers and how to apply them",
                "Volume pricing and negotiation strategies",
                "Building a reliable supplier network"
              ]}
            />

            {/* Part 6 */}
            <PartCard
              number={6}
              title="Labor Costs & Burden Calculations"
              duration="100 minutes"
              sections={[
                "Calculating base labor hours by system type",
                "Understanding labor burden (taxes, insurance, benefits)",
                "Workers compensation and EMR impact",
                "Hourly rates vs. production rates",
                "Accounting for crew size and efficiency",
                "Labor calculation templates and formulas"
              ]}
            />

            {/* Part 7 */}
            <PartCard
              number={7}
              title="General Conditions Breakdown"
              duration="85 minutes"
              sections={[
                "Understanding general conditions vs. direct costs",
                "Site safety and OSHA requirements",
                "Temporary facilities and protection",
                "Project management and supervision costs",
                "Insurance, bonds, and permits",
                "Building a complete general conditions checklist"
              ]}
            />

            {/* Part 8 */}
            <PartCard
              number={8}
              title="Complete Estimate Walkthrough"
              duration="150 minutes"
              sections={[
                "Real commercial project from start to finish",
                "Reviewing specs and identifying requirements",
                "Performing complete digital takeoff",
                "Pricing materials with supplier quotes",
                "Calculating labor and burden",
                "Building general conditions and final bid price",
                "Common mistakes and quality control process"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Who This Tool Is For
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Entry-Level Estimators</h3>
              <p className="text-gray-700">
                New to construction estimating and want to master the proper way from day one. No prior experience required.
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Contractors Scaling Up</h3>
              <p className="text-gray-700">
                Transitioning from residential to commercial work and need to understand commercial specifications and drawings.
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Experienced Estimators</h3>
              <p className="text-gray-700">
                Want to standardize processes, reduce estimate time, and ensure consistent accuracy across your team.
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
              <p className="text-lg">Read and interpret construction specifications across all CSI divisions</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">2</span>
              <p className="text-lg">Understand and coordinate multi-discipline construction drawings (A, S, M, P, E)</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">3</span>
              <p className="text-lg">Perform accurate digital takeoffs using Bluebeam Revu</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">4</span>
              <p className="text-lg">Calculate material quantities with proper waste factors and pitch multipliers</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">5</span>
              <p className="text-lg">Price labor accurately including burden, taxes, and insurance costs</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">6</span>
              <p className="text-lg">Build complete general conditions and overhead cost breakdowns</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">7</span>
              <p className="text-lg">Create professional, accurate estimates from start to finish</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">8</span>
              <p className="text-lg">Use proven templates and checklists to ensure nothing is missed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Software Requirements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Software Requirements
          </h2>

          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-blue-200">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Recommended (Not Required):</h3>
                <p className="text-gray-700 mb-4">
                  <strong>Bluebeam Revu</strong> - Digital takeoff software (approximately $349, free trial available)
                </p>
                <p className="text-gray-600">
                  While Bluebeam is the industry standard and used in Part 4, you can follow along with the free trial version. Alternative PDF takeoff tools can also be used with the same principles.
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Included with Tool:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Excel templates (works with Microsoft Excel or Google Sheets)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Practice drawing sets (PDF format)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    All checklists and templates in editable formats
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> The majority of this tool can be completed without purchasing any additional software. Bluebeam is recommended for Part 4, but a free trial is available for practice.
                </p>
              </div>
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
            Real results from estimators who took this tool
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Mike Rodriguez"
              role="Commercial Estimator"
              company="Summit Roofing, Phoenix AZ"
              quote="This tool cut my estimate time from 4 hours to 45 minutes. I've already won 3 commercial bids using the templates. The ROI was immediate - this paid for itself in the first week."
              rating={5}
              highlight="Estimate time: 4 hours → 45 minutes"
            />

            <TestimonialCard
              name="Jennifer Walsh"
              role="Junior Estimator"
              company="Coastal Contractors, FL"
              quote="As someone new to estimating, this gave me the confidence to handle commercial projects. The part on labor burden was worth the price alone. I finally understand how to price my time accurately."
              rating={5}
              highlight="From beginner to commercial-ready"
            />

            <TestimonialCard
              name="David Park"
              role="Owner/Estimator"
              company="Park Roofing, Seattle WA"
              quote="After 10 years of estimating by gut feel, this tool showed me what I was missing. I was leaving 8-12% on every estimate. The general conditions part alone saved me from costly mistakes."
              rating={5}
              highlight="Found 8-12% missing from previous estimates"
            />

            <TestimonialCard
              name="Sarah Chen"
              role="Estimating Manager"
              company="Pacific Commercial Roofing"
              quote="We get accessed our entire 3-person estimating team. The standardization has been incredible. Everyone now follows the same process, and our estimates are consistent and accurate. Best investment we've made."
              rating={5}
              highlight="Standardized entire team process"
            />

            <TestimonialCard
              name="Tom Bennett"
              role="Project Estimator"
              company="Bennett Construction Group"
              quote="The multi-discipline coordination part was a game-changer. I was missing roof drains and HVAC curbs on almost every estimate. Haven't missed one since taking this tool."
              rating={5}
              highlight="Eliminated costly missed items"
            />

            <TestimonialCard
              name="Marcus Johnson"
              role="Senior Estimator"
              company="Johnson Bros. Roofing"
              quote="The Bluebeam tools took me from manual takeoff to fully digital in 2 weeks. The templates are production-ready - I use them on every single estimate. This tool is the real deal."
              rating={5}
              highlight="Manual → Digital in 2 weeks"
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
              question="Do I need prior estimating experience?"
              answer="No! This tool is designed for complete beginners. We start with the basics and build up to advanced concepts. If you can read and use Excel, you can succeed in this tool."
            />

            <FAQItem
              question="How long will it take to complete the tool?"
              answer="The tool contains 12+ hours of video content. Most users complete it in 2-4 weeks studying a few hours per week. However, you have lifetime access, so you can work at your own pace."
            />

            <FAQItem
              question="Do I need to buy Bluebeam Revu software?"
              answer="Bluebeam is recommended for Part 4 (Digital Takeoff), but it's not required. A free trial is available that lasts long enough to complete the tool. You can also apply the same principles to other PDF takeoff software."
            />

            <FAQItem
              question="Will this work for residential estimating?"
              answer="While the tool is focused on commercial roofing projects, all the principles apply to residential work as well. The templates and checklists are valuable for any roofing estimator."
            />

            <FAQItem
              question="What's included with my purchase?"
              answer="You get lifetime access to all 8 parts (12+ hours), all 5 roofing system templates ($195 value), the complete estimating checklist, practice drawing sets, Bluebeam templates, and a proof of completion. Plus all future updates at no additional cost."
            />

            <FAQItem
              question="Is there a money-back guarantee?"
              answer="Yes! We offer a 30-day money-back guarantee. If you're not satisfied for any reason within 30 days of purchase, just email us for a full refund."
            />

            <FAQItem
              question="Can I buy this for my team?"
              answer="Absolutely! For team tools, you can purchase multiple licenses. For teams of 5+, contact us about corporate packages with volume discounts."
            />

            <FAQItem
              question="Will I get a badge?"
              answer="Yes! Upon completion of all parts, you'll receive a professional proof of completion that you can add to your LinkedIn profile and resume."
            />

            <FAQItem
              question="How is this different from free YouTube videos?"
              answer="This is a complete, structured system - not random tips. You get professional templates ($195+ value), practice drawing sets, real project walkthroughs, and a proven process used by successful estimators. Plus direct support if you have questions."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="purchase" className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Master Construction Estimating?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of estimators who have transformed their careers with this tool
            </p>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl p-8 lg:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Estimating Essentials - Complete Tool</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">$497</div>
              <p className="text-gray-600">One-time payment • Lifetime access • All updates included</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-bold mb-3">Tool Contents:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>8 comprehensive parts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>12+ hours of video guides</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Real project walkthroughs</span>
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
                    <span>All 5 roofing system templates ($195)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Complete estimating checklist ($29)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Practice drawing sets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Bluebeam templates</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-8">
              <div className="text-center">
                <p className="font-bold text-lg text-gray-900 mb-2">Total Value: $721+</p>
                <p className="text-gray-700">Today's Price: Only $497</p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/bidshield/pricing"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all"
              >
                Get Access with BidShield Pro
              </Link>

              <div className="flex flex-col items-center gap-4 mt-6 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  <span>Included with BidShield Pro — $249/month</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  <span>Cancel anytime</span>
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
