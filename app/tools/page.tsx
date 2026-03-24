import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Estimating Tools',
  description: 'Master construction estimating with professional tools. Master Bluebeam, AutoCAD, roofing takeoffs, and more. Video guides with lifetime access.',
  keywords: 'estimating tools, Bluebeam tools, construction estimating tool, roofing estimator tools, takeoff tools',
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm font-semibold">
              Professional Tools
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Professional Estimating Tools
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">for Estimators</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              From beginner to advanced. Master the skills that take years on the job in weeks. All tools include hands-on projects and lifetime access.
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <button className="px-6 py-2 bg-blue-700 rounded-full hover:bg-blue-600 transition-colors">
                All Tools
              </button>
              <Link href="/tools/beginner" className="px-6 py-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition-colors">
                Beginner
              </Link>
              <Link href="/tools/intermediate" className="px-6 py-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition-colors">
                Intermediate
              </Link>
              <Link href="/tools/advanced" className="px-6 py-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition-colors">
                Advanced
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tool */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 lg:p-12 text-white">
                <div className="inline-block mb-4 px-3 py-1 bg-yellow-400 text-blue-900 rounded-full text-sm font-bold">
                  FEATURED TOOL
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Estimating Essentials
                </h2>
                <div className="text-4xl font-bold mb-6">$497</div>
                <p className="text-xl text-blue-50 mb-6">
                  The complete foundation for professional construction estimating. Everything you need to create accurate, profitable estimates from day one.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm">✓</span>
                    <span>8 comprehensive parts, 12+ hours of content</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm">✓</span>
                    <span>All 5 roofing system templates included</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm">✓</span>
                    <span>Proof of completion</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm">✓</span>
                    <span>Practice drawing sets and real projects</span>
                  </li>
                </ul>
                <Link
                  href="/tools/estimating-essentials"
                  className="inline-block px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
                >
                  Get Access →
                </Link>
              </div>
              <div className="bg-blue-900 p-8 lg:p-12">
                <h3 className="text-xl font-bold mb-6 text-white">What You'll Get:</h3>
                <ul className="space-y-4 text-blue-100">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">→</span>
                    <span>Read and interpret construction specifications and drawings across all disciplines (A, S, M, P, E)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">→</span>
                    <span>Perform accurate digital takeoffs using Bluebeam Revu</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">→</span>
                    <span>Calculate material quantities with proper waste factors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">→</span>
                    <span>Price labor accurately including burden, taxes, and insurance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">→</span>
                    <span>Build complete general conditions and overhead breakdowns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">→</span>
                    <span>Coordinate multi-discipline drawings to avoid costly mistakes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">→</span>
                    <span>Create professional estimates that win profitable projects</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">→</span>
                    <span>Understand CSI MasterFormat and specification organization</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Tools Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              All Professional Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Build your skills step-by-step or master specific tools. Every tool includes lifetime access and updates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Estimating Essentials */}
            <ToolCard
              title="Estimating Essentials"
              price="$497"
              level="Beginner to Intermediate"
              duration="8 parts • 12+ hours"
              icon="🧮"
              featured={true}
              whatYoullGet={[
                "Reading construction specifications",
                "Multi-discipline plan coordination",
                "Digital takeoff with Bluebeam basics",
                "Material pricing and waste factors",
                "Labor burden calculations",
                "General conditions breakdown"
              ]}
              includes={[
                "All 5 roofing system templates",
                "Complete estimating checklist",
                "Practice drawing sets",
                "Proof of completion"
              ]}
              href="/tools/estimating-essentials"
            />

            {/* Bluebeam Mastery */}
            <ToolCard
              title="Bluebeam Mastery"
              price="$147"
              level="Beginner to Advanced"
              duration="8 parts • 6 hours"
              icon="⚡"
              whatYoullGet={[
                "Complete Bluebeam interface mastery",
                "Digital takeoff calibration and scale",
                "Advanced measurement tools",
                "Automated quantity reports to Excel",
                "Real project walkthroughs"
              ]}
              includes={[
                "Bluebeam setup templates",
                "Custom tool sets",
                "Practice project files",
                "Tips and shortcuts guide"
              ]}
              href="/tools/bluebeam-mastery"
            />

            {/* AutoCAD for Submittals */}
            <ToolCard
              title="AutoCAD for Submittals"
              price="$247"
              level="Intermediate"
              duration="6 parts • 8 hours"
              icon="📐"
              whatYoullGet={[
                "AutoCAD basics for contractors",
                "Reading CAD drawings",
                "Creating professional shop drawings",
                "Sheet metal detail sections",
                "Submittal package creation"
              ]}
              includes={[
                "AutoCAD template files",
                "Sample shop drawings",
                "Detail library",
                "Alternative tools guide"
              ]}
              href="/tools/autocad-submittals"
            />

            {/* SketchUp Visualization */}
            <ToolCard
              title="SketchUp Visualization"
              price="$97"
              level="Beginner"
              duration="5 parts • 4 hours"
              icon="🎨"
              whatYoullGet={[
                "SketchUp basics (Free vs Pro)",
                "3D roof modeling techniques",
                "Material textures and rendering",
                "Creating client presentations",
                "Before/after visualizations"
              ]}
              includes={[
                "Sample roof models",
                "Material texture library",
                "Presentation templates",
                "Export settings guide"
              ]}
              href="/tools/sketchup-visualization"
            />

            {/* Measurement Technology */}
            <ToolCard
              title="Measurement Technology"
              price="$97"
              level="Beginner"
              duration="4 parts • 3 hours"
              icon="📏"
              whatYoullGet={[
                "Pictometry detailed tutorial",
                "EagleView platform mastery",
                "Nearmap and alternative tools",
                "Google Earth measurements (free)",
                "Aerial vs manual methods comparison"
              ]}
              includes={[
                "Measurement worksheet templates",
                "Pitch multiplier charts",
                "Accuracy verification checklist",
                "Tool comparison matrix"
              ]}
              href="/tools/measurement-technology"
            />

            {/* Construction Submittals */}
            <ToolCard
              title="Construction Submittals"
              price="$197"
              level="Intermediate"
              duration="8 parts • 6 hours"
              icon="📊"
              whatYoullGet={[
                "Reading submittal requirements in specs",
                "Organizing submittal packages",
                "Collecting product data sheets",
                "Handling reviews and resubmittals",
                "Closeout document preparation"
              ]}
              includes={[
                "Submittal cover sheet templates",
                "Product data checklist",
                "Submittal log spreadsheet",
                "Sample submittal packages"
              ]}
              href="/tools/construction-submittals"
            />

            {/* Estimating Software Mastery */}
            <ToolCard
              title="Estimating Software Mastery"
              price="$197"
              level="Intermediate to Advanced"
              duration="6 parts • 7 hours"
              icon="💻"
              whatYoullGet={[
                "The Edge (Estimating Edge) complete tutorial",
                "Kreo AI estimating platform",
                "RSMeans cost data usage",
                "Building unit cost databases",
                "Integration with templates"
              ]}
              includes={[
                "Software comparison matrix",
                "Template integration guides",
                "Cost database starter files",
                "Platform selection guide"
              ]}
              href="/tools/estimating-software"
            />
          </div>
        </div>
      </section>

      {/* Tool Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Compare Tools</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="px-6 py-4 text-left">Tool</th>
                  <th className="px-6 py-4 text-center">Price</th>
                  <th className="px-6 py-4 text-center">Duration</th>
                  <th className="px-6 py-4 text-center">Level</th>
                  <th className="px-6 py-4 text-center">Includes Templates</th>
                  <th className="px-6 py-4 text-center">Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">Estimating Essentials</td>
                  <td className="px-6 py-4 text-center">$497</td>
                  <td className="px-6 py-4 text-center">12+ hours</td>
                  <td className="px-6 py-4 text-center">Beginner-Int</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">Bluebeam Mastery</td>
                  <td className="px-6 py-4 text-center">$147</td>
                  <td className="px-6 py-4 text-center">6 hours</td>
                  <td className="px-6 py-4 text-center">Beginner-Adv</td>
                  <td className="px-6 py-4 text-center text-gray-300">—</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">AutoCAD for Submittals</td>
                  <td className="px-6 py-4 text-center">$247</td>
                  <td className="px-6 py-4 text-center">8 hours</td>
                  <td className="px-6 py-4 text-center">Intermediate</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">SketchUp Visualization</td>
                  <td className="px-6 py-4 text-center">$97</td>
                  <td className="px-6 py-4 text-center">4 hours</td>
                  <td className="px-6 py-4 text-center">Beginner</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">Measurement Technology</td>
                  <td className="px-6 py-4 text-center">$97</td>
                  <td className="px-6 py-4 text-center">3 hours</td>
                  <td className="px-6 py-4 text-center">Beginner</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">Construction Submittals</td>
                  <td className="px-6 py-4 text-center">$197</td>
                  <td className="px-6 py-4 text-center">6 hours</td>
                  <td className="px-6 py-4 text-center">Intermediate</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">Estimating Software Mastery</td>
                  <td className="px-6 py-4 text-center">$197</td>
                  <td className="px-6 py-4 text-center">7 hours</td>
                  <td className="px-6 py-4 text-center">Int-Advanced</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Not Sure Where to Start */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 lg:p-12 border-2 border-blue-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Not Sure Where to Start?
            </h2>
            <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto">
              Take our quick quiz to find the perfect getting started path for your experience level and goals.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3 text-blue-900">New to Estimating?</h3>
                <p className="text-gray-600 mb-4">
                  Start with Estimating Essentials to build a solid foundation.
                </p>
                <Link href="/tools/estimating-essentials" className="text-blue-600 font-semibold hover:text-blue-700">
                  Start Here →
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3 text-blue-900">Know the Basics?</h3>
                <p className="text-gray-600 mb-4">
                  Level up with Bluebeam Mastery and Software tools.
                </p>
                <Link href="/tools/bluebeam-mastery" className="text-blue-600 font-semibold hover:text-blue-700">
                  View Details →
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3 text-blue-900">Want Everything?</h3>
                <p className="text-gray-600 mb-4">
                  Join BidShield Pro and get access to all tools plus templates.
                </p>
                <Link href="/membership" className="text-blue-600 font-semibold hover:text-blue-700">
                  View Membership →
                </Link>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/quiz"
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Take the Tool Quiz
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">What Our Customers Say</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Join thousands of contractors who have transformed their estimating skills.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Mike Rodriguez"
              role="Commercial Estimator"
              company="Summit Roofing"
              quote="The Estimating Essentials tool cut my estimate time from 4 hours to 45 minutes. I've already won 3 bids using the templates. This paid for itself in the first week."
              rating={5}
            />

            <TestimonialCard
              name="Sarah Chen"
              role="Junior Estimator"
              company="Pacific Contractors"
              quote="I went from knowing nothing about Bluebeam to doing complete digital takeoffs in 2 weeks. The real project walkthroughs were incredibly helpful. Best investment in my career."
              rating={5}
            />

            <TestimonialCard
              name="Tom Bennett"
              role="Owner/Estimator"
              company="Bennett Construction"
              quote="After 15 years of manual estimating, these tools modernized my entire process. The AutoCAD and SketchUp tools helped me create submittals that impressed GCs and won bigger projects."
              rating={5}
            />

            <TestimonialCard
              name="Jessica Martinez"
              role="Project Manager"
              company="Apex Roofing Systems"
              quote="The measurement technology tool saved me thousands on aerial measurement subscriptions. Now I know exactly which tool to use for each project type."
              rating={5}
            />

            <TestimonialCard
              name="David Park"
              role="Estimator"
              company="Midwest Commercial Roofing"
              quote="I struggled with labor burden calculations for years. The Essentials tool finally made it click. My estimates are now accurate and profitable."
              rating={5}
            />

            <TestimonialCard
              name="Amanda Foster"
              role="Estimating Manager"
              company="Foster & Sons Roofing"
              quote="We get accessed our entire estimating team in the BidShield Pro membership. The standardization and efficiency gains have been incredible. Highly recommended for companies wanting consistent processes."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* BidShield Pro Membership CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-yellow-400 text-blue-900 rounded-full text-sm font-bold">
              BEST VALUE
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get Access to All Tools
            </h2>
            <p className="text-xl text-blue-100 mb-6">
              Join BidShield Pro and unlock everything. Save over $1,400 compared to buying tools individually.
            </p>
            <div className="text-5xl font-bold mb-2">$197<span className="text-2xl text-blue-300">/month</span></div>
            <p className="text-blue-200 mb-8">Cancel anytime. No long-term commitment.</p>
          </div>

          <div className="bg-blue-800/50 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Everything Included:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm">✓</span>
                <span>Access to ALL 7 tools ($1,472 value)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm">✓</span>
                <span>All templates and tools</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm">✓</span>
                <span>Monthly live Q&A sessions</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm">✓</span>
                <span>Private community access</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm">✓</span>
                <span>Monthly price list updates</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm">✓</span>
                <span>New content as released</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm">✓</span>
                <span>Priority email support</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm">✓</span>
                <span>Badge for all tools</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/membership"
              className="inline-block px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg mb-4"
            >
              Join BidShield Pro Now →
            </Link>
            <p className="text-sm text-blue-200">
              30-day money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <FAQItem
              question="Do I need any specific software to use these tools?"
              answer="Most tools use industry-standard software like Bluebeam Revu, AutoCAD, and SketchUp. Free trial versions are available for all software, and we provide guidance on free alternatives where applicable. The Estimating Essentials tool includes all templates you'll need."
            />

            <FAQItem
              question="How long do I have access to the tools?"
              answer="All tools include lifetime access. Watch at your own pace, revisit sections anytime, and receive all future updates at no additional cost."
            />

            <FAQItem
              question="Are these tools suitable for beginners?"
              answer="Absolutely! We have tools designed for every skill level. The Estimating Essentials tool is perfect for beginners with no prior experience. Each tool clearly indicates its difficulty level."
            />

            <FAQItem
              question="What's the difference between buying tools individually and BidShield Pro membership?"
              answer="Individual tools are one-time purchases perfect if you only need specific skills. BidShield Pro membership ($197/month) gives you access to ALL tools, templates, live Q&A sessions, and the private community. If you plan to take 2+ tools, membership is the better value."
            />

            <FAQItem
              question="Do you offer refunds?"
              answer="Yes! We offer a 30-day money-back guarantee on all tools and memberships. If you're not satisfied for any reason, just email us for a full refund."
            />

            <FAQItem
              question="Can I get a badge after completing a tool?"
              answer="Yes! Each tool includes a proof of completion that you can add to your LinkedIn profile or resume. The Estimating Essentials tool badge is particularly valued in the industry."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

interface ToolCardProps {
  title: string;
  price: string;
  level: string;
  duration: string;
  icon: string;
  whatYoullGet: string[];
  includes: string[];
  href: string;
  featured?: boolean;
}

function ToolCard({ title, price, level, duration, icon, whatYoullGet, includes, href, featured = false }: ToolCardProps) {
  return (
    <div className={`group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 ${featured ? 'border-blue-500' : 'border-transparent hover:border-blue-300'}`}>
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
          MOST POPULAR
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">{icon}</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{price}</div>
          <div className="text-sm text-gray-500 mb-1">{duration}</div>
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            {level}
          </div>
        </div>

        {/* What You'll Get */}
        <div className="mb-6">
          <h4 className="font-bold text-gray-900 mb-3">What You'll Get:</h4>
          <ul className="space-y-2">
            {whatYoullGet.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What's Included */}
        <div className="mb-6">
          <h4 className="font-bold text-gray-900 mb-3">What's Included:</h4>
          <ul className="space-y-2">
            {includes.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Link
          href="/bidshield/pricing"
          className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Get Access with BidShield Pro
        </Link>

        <Link
          href={href}
          className="block w-full text-center mt-3 px-6 py-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
}

function TestimonialCard({ name, role, company, quote, rating }: TestimonialCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-xl">★</span>
        ))}
      </div>
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
