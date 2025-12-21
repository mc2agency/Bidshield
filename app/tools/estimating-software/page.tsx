import Link from 'next/link';
import { Metadata } from 'next';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export const metadata: Metadata = {
  title: 'Estimating Software & AI Tools Tool - Modern Construction Tech | MC2 Estimating',
  description: 'Master construction estimating software, AI tools, and automation. Master AccuLynx, JobNimbus, AI assistants, and workflow optimization for faster, more accurate estimates.',
  keywords: 'construction estimating software, roofing software, AccuLynx, JobNimbus, AI estimating tools, construction automation, estimating technology'
};

export default function EstimatingSoftwarePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-bold">
                FUTURE OF ESTIMATING
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Estimating Software
                <br />
                <span className="text-blue-300">& AI Tools</span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Master modern estimating technology and AI automation. Work smarter, not harder with the latest software and artificial intelligence tools.
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div>
                  <div className="text-5xl font-bold">$297</div>
                  <div className="text-blue-200">One-time payment</div>
                </div>
                <div className="h-12 w-px bg-blue-600" />
                <div className="space-y-1">
                  <div className="text-sm text-blue-200">8 Software Parts</div>
                  <div className="text-sm text-blue-200">6+ Hours of Content</div>
                  <div className="text-sm text-blue-200">Lifetime Access</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#purchase"
                  className="inline-block px-8 py-4 bg-yellow-400 text-blue-900 rounded-lg font-bold hover:bg-yellow-300 transition-colors text-lg text-center"
                >
                  Get Access - $297
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
                  <span>AI prompts & workflows</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-600">
              <h3 className="text-2xl font-bold mb-6">This Tool Includes:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Software Comparison Guide</div>
                    <div className="text-sm text-blue-200">AccuLynx, JobNimbus, Leap, and more</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">AI Estimating Workflows</div>
                    <div className="text-sm text-blue-200">ChatGPT, Claude, and automation tools</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Integration Tutorials</div>
                    <div className="text-sm text-blue-200">Connect tools for seamless workflows</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Automation Templates</div>
                    <div className="text-sm text-blue-200">Zapier, Make, and custom automations</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">AI Prompt Library</div>
                    <div className="text-sm text-blue-200">Ready-to-use prompts for estimating</div>
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
                Overwhelmed by Software Options?
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Confused by dozens of estimating software options and which to choose</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Using disconnected tools and manually transferring data between systems</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Missing out on AI tools that could save hours on every estimate</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Paying for expensive software but only using 20% of features</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Scared to adopt new technology and fall behind competitors</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Don't know how to use AI for estimating without making costly mistakes</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-6">
                Master Modern Estimating Technology
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Choose the perfect software for your business size and needs</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Build integrated workflows where tools work together seamlessly</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Use AI to automate repetitive tasks and speed up estimates 10x</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Unlock advanced features in software you already own</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Stay ahead of competitors with cutting-edge technology</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Use AI safely and effectively without accuracy concerns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Categories */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Software & Tools You'll Master
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">All-in-One Platforms</h3>
              <p className="text-gray-700 mb-4">
                CRM, estimating, project management, and invoicing combined. AccuLynx, JobNimbus, Leap, and others.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Best for: Growing companies</li>
                <li>• Cost: $200-600/month</li>
                <li>• Difficulty: Medium</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Assistants</h3>
              <p className="text-gray-700 mb-4">
                ChatGPT, Claude, and specialized AI tools for spec analysis, material research, and estimate validation.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Best for: Everyone</li>
                <li>• Cost: $0-50/month</li>
                <li>• Difficulty: Low</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automation Tools</h3>
              <p className="text-gray-700 mb-4">
                Zapier, Make, and custom integrations to connect systems and eliminate manual data entry.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Best for: Tech-savvy teams</li>
                <li>• Cost: $0-100/month</li>
                <li>• Difficulty: Medium-High</li>
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
              8 parts covering modern estimating software, AI tools, and automation workflows
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Part 1 */}
            <PartCard
              number={1}
              title="Estimating Software Landscape 2025"
              duration="50 minutes"
              sections={[
                "Overview of major roofing/construction software platforms",
                "AccuLynx vs. JobNimbus vs. Leap vs. CompanyCam comparison",
                "All-in-one platforms vs. best-of-breed tools",
                "Pricing models and total cost of ownership",
                "Which software for different business sizes",
                "Migration strategies from spreadsheets to software"
              ]}
            />

            {/* Part 2 */}
            <PartCard
              number={2}
              title="AccuLynx Deep Dive"
              duration="65 minutes"
              sections={[
                "Complete AccuLynx platform walkthrough",
                "Lead management and CRM features",
                "Digital estimating and proposal generation",
                "Job tracking and project management",
                "Mobile app for field teams",
                "Reporting and analytics dashboard",
                "ROI calculation for AccuLynx investment"
              ]}
            />

            {/* Part 3 */}
            <PartCard
              number={3}
              title="JobNimbus & Alternative Platforms"
              duration="55 minutes"
              sections={[
                "JobNimbus platform overview and strengths",
                "When JobNimbus is better than AccuLynx",
                "Leap Sales Software for residential contractors",
                "Contractor Foreman for project management",
                "Budget-friendly options for small businesses",
                "Free and freemium software alternatives"
              ]}
            />

            {/* Part 4 */}
            <PartCard
              number={4}
              title="AI for Construction Estimating"
              duration="70 minutes"
              sections={[
                "Introduction to AI assistants (ChatGPT, Claude, Gemini)",
                "Using AI to analyze specifications and plans",
                "AI-powered material research and pricing",
                "Generating scope of work descriptions",
                "Validating estimates with AI double-checking",
                "AI limitations and when NOT to trust AI",
                "Building custom AI workflows for your business"
              ]}
            />

            {/* Part 5 */}
            <PartCard
              number={5}
              title="AI Prompt Engineering for Estimators"
              duration="60 minutes"
              sections={[
                "How to write effective AI prompts",
                "Spec analysis prompts that extract key info",
                "Material takeoff assistance prompts",
                "Labor calculation and validation prompts",
                "Proposal writing and client communication",
                "Building a custom prompt library",
                "Real examples: before/after AI integration"
              ]}
            />

            {/* Part 6 */}
            <PartCard
              number={6}
              title="Workflow Integration & Automation"
              duration="65 minutes"
              sections={[
                "Connecting EagleView/Hover to estimating software",
                "Integrating Bluebeam with proposal tools",
                "Using Zapier for no-code automation",
                "Make (formerly Integromat) for advanced workflows",
                "Automatic data transfer between systems",
                "Eliminating manual data entry completely",
                "Building your perfect tech stack"
              ]}
            />

            {/* Part 7 */}
            <PartCard
              number={7}
              title="Excel & Spreadsheet Superpowers"
              duration="55 minutes"
              sections={[
                "Advanced Excel formulas for estimating",
                "Dynamic templates with conditional logic",
                "Data validation and error prevention",
                "Using Power Query for data automation",
                "Excel vs. Google Sheets: when to use each",
                "Integrating spreadsheets with software platforms",
                "When to graduate from spreadsheets to software"
              ]}
            />

            {/* Part 8 */}
            <PartCard
              number={8}
              title="Building Your Complete Tech Stack"
              duration="70 minutes"
              sections={[
                "Auditing your current technology usage",
                "Identifying bottlenecks and inefficiencies",
                "Designing your ideal workflow from lead to payment",
                "Phased implementation strategy (don't buy everything at once)",
                "Onboarding staff on new technology",
                "Measuring ROI and tracking efficiency gains",
                "Future-proofing your estimating process"
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
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Business Owners</h3>
              <p className="text-gray-700">
                Evaluating software investments and want expert guidance on which tools provide the best ROI for your company size and market.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tech-Forward Estimators</h3>
              <p className="text-gray-700">
                Want to leverage AI and automation to work faster and more accurately. Early adopters looking for competitive advantages.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Software Users</h3>
              <p className="text-gray-700">
                Already using AccuLynx, JobNimbus, or other platforms but only scratching the surface. Want to unlock hidden features and integrations.
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
              <p className="text-lg">Choose the perfect estimating software for your business needs</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">2</span>
              <p className="text-lg">Use AI assistants to analyze specs and validate estimates</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">3</span>
              <p className="text-lg">Automate repetitive tasks with Zapier and Make</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">4</span>
              <p className="text-lg">Integrate multiple tools into seamless workflows</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">5</span>
              <p className="text-lg">Write effective AI prompts for estimating tasks</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">6</span>
              <p className="text-lg">Build advanced Excel templates with automation</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">7</span>
              <p className="text-lg">Calculate ROI on software investments</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">8</span>
              <p className="text-lg">Design a complete, future-proof technology stack</p>
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
            Real results from contractors using modern technology
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Jennifer Park"
              role="Owner"
              company="Park Roofing Systems"
              quote="The AI part changed everything. I'm using ChatGPT to analyze 50+ page specs in minutes instead of hours. The prompt library alone is worth 10x the tool price."
              rating={5}
              highlight="Spec analysis in minutes"
            />

            <TestimonialCard
              name="Marcus Johnson"
              role="Operations Manager"
              company="Summit Commercial Roofing"
              quote="We were evaluating AccuLynx vs. JobNimbus. This tool broke down exactly which was better for our size. Saved us from a $15,000 mistake by picking the wrong platform."
              rating={5}
              highlight="Saved $15k on software choice"
            />

            <TestimonialCard
              name="Sarah Chen"
              role="Estimating Manager"
              company="Pacific Contractors Group"
              quote="The automation workflows are incredible. We're now automatically importing EagleView reports into our estimating software. What took 20 minutes of data entry now takes 30 seconds."
              rating={5}
              highlight="20 minutes → 30 seconds"
            />

            <TestimonialCard
              name="David Martinez"
              role="Senior Estimator"
              company="Elite Roofing LLC"
              quote="I've been using Excel for 15 years but the advanced formulas part showed me features I never knew existed. My templates are now 10x more powerful and bulletproof."
              rating={5}
              highlight="Supercharged Excel templates"
            />

            <TestimonialCard
              name="Amanda Foster"
              role="Owner/Estimator"
              company="Foster Construction Co."
              quote="The AI spec analysis is a game-changer. I paste in the spec, AI extracts all roofing requirements, and I haven't missed a critical item since. My accuracy has never been better."
              rating={5}
              highlight="Perfect spec accuracy with AI"
            />

            <TestimonialCard
              name="Robert Williams"
              role="Project Manager"
              company="Coastal Commercial Roofing"
              quote="We're using Zapier to connect 5 different tools into one seamless workflow. Leads flow automatically from website to CRM to estimating. I feel like I'm from the future."
              rating={5}
              highlight="Fully automated workflow"
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
              question="Do I need to buy software to use this tool?"
              answer="No! This tool teaches you ABOUT software so you can make informed decisions. Most platforms offer free trials or demos. You'll get what to buy (or not buy) based on your specific needs."
            />

            <FAQItem
              question="Is AI really useful for estimating, or just hype?"
              answer="AI is incredibly useful when used correctly. This tool shows exactly where AI excels (spec analysis, research, validation) and where it fails (pricing decisions, final approvals). You'll get to use AI as a powerful assistant, not a replacement for expertise."
            />

            <FAQItem
              question="I'm not tech-savvy. Will this be too advanced?"
              answer="Not at all! We start with basics and build up. The tool is designed for contractors first, tech people second. If you can use Excel and email, you can use these tools."
            />

            <FAQItem
              question="Which software should I buy: AccuLynx or JobNimbus?"
              answer="It depends on your business! Part 1 and 2 provide a complete comparison framework. Generally, AccuLynx is better for larger commercial contractors, JobNimbus for smaller residential companies. But there are many factors - the tool covers all of them."
            />

            <FAQItem
              question="Will AI replace estimators?"
              answer="No. AI is a tool that makes good estimators great. It handles tedious tasks (reading specs, research, data entry) so you can focus on judgment, strategy, and client relationships. This tool shows you how to stay ahead by embracing AI, not fearing it."
            />

            <FAQItem
              question="Can I really automate my workflow?"
              answer="Yes! Part 6 shows exactly how. Most contractors have 5-10 hours per week of manual data entry that can be automated with tools like Zapier. Users report saving 10-20 hours per month after implementing the automation workflows."
            />

            <FAQItem
              question="What's included with my purchase?"
              answer="Lifetime access to all 8 parts (6+ hours), software comparison charts, AI prompt library, automation templates, integration guides, and a proof of completion. Plus all future updates as technology evolves."
            />

            <FAQItem
              question="Is there a money-back guarantee?"
              answer="Yes! 30-day money-back guarantee. If you're not satisfied, just email us for a full refund."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="purchase" className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Master Modern Estimating Technology?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join contractors using AI and automation to work smarter
            </p>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl p-8 lg:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Estimating Software & AI Tools - Complete Tool</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">$297</div>
              <p className="text-gray-600">One-time payment • Lifetime access • All updates included</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-bold mb-3">Tool Contents:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>8 software parts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>6+ hours of content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Platform comparisons</span>
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
                    <span>AI prompt library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Automation templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Software comparison charts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Integration guides</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <GumroadCheckoutButton
                productKey="estimatingSoftware"
                text="Get Access - $297"
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
