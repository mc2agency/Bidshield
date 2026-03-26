import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bluebeam Mastery for Estimators - Complete Digital Takeoff Tool',
  description: 'Master Bluebeam Revu for construction takeoff. 8 parts covering calibration, measurement tools, advanced techniques, and Excel reporting. Go from beginner to expert.',
  keywords: 'Bluebeam Revu tools, digital takeoff tool, construction measurement, PDF takeoff, Bluebeam for estimators, quantity takeoff'
,
  alternates: { canonical: 'https://www.bidshield.co/tools/bluebeam-mastery' }
};

export default function BluebeamMasteryPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold">
                MOST POPULAR SOFTWARE TOOL
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Bluebeam Mastery
                <br />
                <span className="text-blue-300">for Estimators</span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Go from manual takeoff to professional digital estimating. Master the industry-standard software used by top contractors.
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div>
                  <div className="text-5xl font-bold">$147</div>
                  <div className="text-blue-200">One-time payment</div>
                </div>
                <div className="h-12 w-px bg-blue-600" />
                <div className="space-y-1">
                  <div className="text-sm text-blue-200">8 Comprehensive Parts</div>
                  <div className="text-sm text-blue-200">6+ Hours of Content</div>
                  <div className="text-sm text-blue-200">Lifetime Access</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#purchase"
                  className="inline-block px-8 py-4 bg-yellow-400 text-blue-900 rounded-lg font-bold hover:bg-yellow-300 transition-colors text-lg text-center"
                >
                  Get Access - $147
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
                  <span>Custom tool sets included</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-600">
              <h3 className="text-2xl font-bold mb-6">This Tool Includes:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Custom Bluebeam Tool Sets</div>
                    <div className="text-sm text-blue-200">Pre-configured for roofing takeoff</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Practice Project Files</div>
                    <div className="text-sm text-blue-200">Real commercial drawings to practice on</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Report Templates</div>
                    <div className="text-sm text-blue-200">Export takeoff directly to Excel</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Tips & Shortcuts Guide</div>
                    <div className="text-sm text-blue-200">50+ time-saving techniques</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Real Project Walkthrough</div>
                    <div className="text-sm text-blue-200">Complete estimate from start to finish</div>
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
                Still Doing Manual Takeoff?
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Spending hours with a scale ruler measuring drawings</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Making calculation errors that cost you money on bids</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Unable to show clients or GCs how you arrived at quantities</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Redoing takeoffs when plans change or corrections are issued</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Looking unprofessional compared to competitors with digital tools</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Frustrated by Bluebeam's interface and not knowing where to start</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-6">
                Become a Digital Takeoff Pro
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Complete accurate takeoffs in 1/3 the time of manual methods</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Eliminate math errors with automated calculations</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Generate professional reports showing color-coded markups</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Update estimates in minutes when plan revisions come in</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Impress clients with detailed, visual quantity reports</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Master every Bluebeam tool and workflow for estimating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Bluebeam Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Bluebeam Revu is the Industry Standard
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Precision Measurement</h3>
              <p className="text-gray-700">
                Calibrate to any scale and measure with pinpoint accuracy. Area, length, count, and volume tools designed specifically for construction.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Speed & Efficiency</h3>
              <p className="text-gray-700">
                What takes hours manually takes minutes with Bluebeam. Custom tool sets and formulas automate repetitive tasks and eliminate errors.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Reports</h3>
              <p className="text-gray-700">
                Export quantities directly to Excel with one click. Generate visual reports with color-coded markups that clients and GCs love.
              </p>
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
              8 parts taking you from Bluebeam beginner to advanced estimator
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Part 1 */}
            <PartCard
              number={1}
              title="Bluebeam Basics & Interface"
              duration="45 minutes"
              sections={[
                "Understanding Bluebeam Revu versions (Standard, CAD, eXtreme)",
                "Interface overview and customization",
                "Panels, toolbars, and workspace setup",
                "PDF navigation and multi-tab workflows",
                "File management best practices",
                "Free trial setup and installation"
              ]}
            />

            {/* Part 2 */}
            <PartCard
              number={2}
              title="Setting Up for Takeoff"
              duration="50 minutes"
              sections={[
                "Calibrating plans to scale (critical step)",
                "Understanding architectural vs. engineering scales",
                "Verifying scale accuracy across sheets",
                "Setting up measurement precision",
                "Configuring units (feet, inches, square feet)",
                "Layer management and plan organization"
              ]}
            />

            {/* Part 3 */}
            <PartCard
              number={3}
              title="Essential Measurement Tools"
              duration="60 minutes"
              sections={[
                "Area measurement for roofing systems",
                "Length/perimeter tools for flashing and edge metal",
                "Count tool for penetrations, drains, curbs",
                "Volume measurements (rarely used in roofing)",
                "Custom columns and formulas",
                "Color-coding markups for clarity"
              ]}
            />

            {/* Part 4 */}
            <PartCard
              number={4}
              title="Advanced Techniques"
              duration="55 minutes"
              sections={[
                "Creating custom tool sets for roofing",
                "Using formulas for automatic calculations",
                "Polylength for irregular shapes",
                "Working with multiple layers and disciplines",
                "Copying markups between sheets",
                "Search and auto-markup features"
              ]}
            />

            {/* Part 5 */}
            <PartCard
              number={5}
              title="Generating Reports to Excel"
              duration="50 minutes"
              sections={[
                "Creating markup summaries",
                "Exporting to Excel with one click",
                "Customizing report columns and data",
                "Organizing quantities by assembly/system",
                "Linking Bluebeam to estimating templates",
                "Quality control and verification process"
              ]}
            />

            {/* Part 6 */}
            <PartCard
              number={6}
              title="Collaboration & Studio"
              duration="40 minutes"
              sections={[
                "Bluebeam Studio for team collaboration",
                "Sharing and reviewing markups",
                "Studio Projects vs. Studio Sessions",
                "Working with general contractors",
                "Tracking changes and revisions",
                "Best practices for multi-user workflows"
              ]}
            />

            {/* Part 7 */}
            <PartCard
              number={7}
              title="Tips, Shortcuts & Efficiency"
              duration="45 minutes"
              sections={[
                "50+ keyboard shortcuts that save hours",
                "Creating custom stamps and symbols",
                "Batch processing multiple sheets",
                "Quick measurement verification techniques",
                "Common mistakes and how to avoid them",
                "Workflow optimization strategies"
              ]}
            />

            {/* Part 8 */}
            <PartCard
              number={8}
              title="Real Project Walkthrough"
              duration="90 minutes"
              sections={[
                "Complete commercial roofing project from start to finish",
                "Calibrating multi-sheet plan sets",
                "Measuring roofing area with complex geometry",
                "Counting all penetrations and accessories",
                "Coordinating with MEP drawings",
                "Generating final quantity report",
                "Quality control and double-checking process"
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
              <div className="text-4xl mb-4">🆕</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Beginners</h3>
              <p className="text-gray-700">
                Never used Bluebeam before? Perfect. We start from zero and build you up to advanced techniques step by step.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">📏</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Manual Estimators</h3>
              <p className="text-gray-700">
                Ready to go digital and dramatically speed up your takeoff process. This is your complete transition guide.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Self-Taught Users</h3>
              <p className="text-gray-700">
                You know the basics but want to unlock advanced features and master proper workflows from an expert.
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
              <p className="text-lg">Navigate Bluebeam Revu confidently and customize your workspace</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">2</span>
              <p className="text-lg">Calibrate any plan to scale and verify accuracy</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">3</span>
              <p className="text-lg">Measure areas, lengths, and counts with precision</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">4</span>
              <p className="text-lg">Create custom tool sets and formulas for automated calculations</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">5</span>
              <p className="text-lg">Generate professional quantity reports exported to Excel</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">6</span>
              <p className="text-lg">Use Studio for collaboration with teams and general contractors</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">7</span>
              <p className="text-lg">Work 3x faster using advanced shortcuts and techniques</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">8</span>
              <p className="text-lg">Complete real-world commercial takeoffs from start to finish</p>
            </div>
          </div>
        </div>
      </section>

      {/* Software Requirements */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Software Requirements
          </h2>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-300">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Required Software:</h3>
                <p className="text-gray-700 mb-4">
                  <strong>Bluebeam Revu</strong> (Standard, CAD, or eXtreme edition)
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Price:</strong> Approximately $349 for Standard edition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Free Trial:</strong> 30-day full-featured trial available (enough to complete this tool)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Subscription:</strong> Monthly/annual subscription options available</span>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">System Requirements:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Windows 10 or later (Mac users: use Parallels or Boot Camp)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>4GB RAM minimum (8GB+ recommended)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Microsoft Excel or Google Sheets for reports</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> This tool pays for itself in time saved on your first few estimates. Most users find the Bluebeam investment returns 10x+ in the first month through increased efficiency and accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            What Customers Are Saying
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Real results from contractors who mastered Bluebeam
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Chen"
              role="Junior Estimator"
              company="Pacific Commercial Roofing"
              quote="I went from knowing nothing about Bluebeam to doing complete digital takeoffs in 2 weeks. The real project walkthroughs were incredibly helpful. Now I'm 3x faster than manual methods."
              rating={5}
              highlight="Manual → Digital in 2 weeks"
            />

            <TestimonialCard
              name="Marcus Johnson"
              role="Senior Estimator"
              company="Johnson Bros. Roofing"
              quote="The custom tool sets alone saved me 20 hours in the first month. I had been using Bluebeam for years but was only scratching the surface. This tool unlocked features I didn't know existed."
              rating={5}
              highlight="Saved 20+ hours first month"
            />

            <TestimonialCard
              name="Amanda Foster"
              role="Owner/Estimator"
              company="Foster Roofing Solutions"
              quote="Best $147 I've spent on my business. My estimates went from handwritten to professional digital reports overnight. GCs are impressed, and I'm winning more bids because I look professional."
              rating={5}
              highlight="Winning more bids with pro reports"
            />

            <TestimonialCard
              name="Robert Martinez"
              role="Project Estimator"
              company="Apex Roofing Systems"
              quote="The Excel integration changed everything. I can export quantities and plug them directly into my templates. What used to take 3 hours now takes 30 minutes. This tool paid for itself on day one."
              rating={5}
              highlight="3 hours → 30 minutes"
            />

            <TestimonialCard
              name="Kevin Park"
              role="Estimating Manager"
              company="Summit Commercial Roofing"
              quote="I get accessed my entire team in this tool. Everyone now uses the same workflow and custom tool sets. Our estimates are consistent, accurate, and fast. Team efficiency up 40%."
              rating={5}
              highlight="Team efficiency up 40%"
            />

            <TestimonialCard
              name="Lisa Thompson"
              role="Commercial Estimator"
              company="Pacific Northwest Contractors"
              quote="I was intimidated by Bluebeam's interface and stuck with manual takeoff for too long. This tool made it simple and intuitive. Now I can't imagine going back. My accuracy has improved dramatically."
              rating={5}
              highlight="Dramatically improved accuracy"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <FAQItem
              question="Do I need to own Bluebeam Revu to use this tool?"
              answer="Not immediately. Bluebeam offers a 30-day free trial which is plenty of time to complete this tool. You can decide to purchase the software after you've used it and seen the value. The tool also works with all Bluebeam Revu editions (Standard, CAD, eXtreme)."
            />

            <FAQItem
              question="I've never used Bluebeam before. Is this too advanced for me?"
              answer="Not at all! This tool is designed for complete beginners. We start with the absolute basics (interface, navigation) and progressively build to advanced techniques. If you can use a computer and open a PDF, you can succeed in this tool."
            />

            <FAQItem
              question="How long will it take to complete the tool?"
              answer="The tool contains 6+ hours of video content. Most users complete it in 1-2 weeks, practicing 3-5 hours per week. However, you have lifetime access, so you can work at your own pace and revisit sections anytime."
            />

            <FAQItem
              question="Will this work for other trades besides roofing?"
              answer="Absolutely! While examples focus on roofing, the Bluebeam techniques apply to any construction trade - electrical, plumbing, HVAC, concrete, framing, etc. The measurement and reporting principles are universal."
            />

            <FAQItem
              question="What's included with my purchase?"
              answer="You get lifetime access to all 8 parts (6+ hours), custom Bluebeam tool sets pre-configured for roofing, practice project files with real commercial drawings, report templates, tips & shortcuts guide, and a proof of completion. Plus all future updates at no cost."
            />

            <FAQItem
              question="Can I use this on a Mac?"
              answer="Bluebeam Revu is Windows-only. Mac users can run it using Parallels Desktop, VMware Fusion, or Boot Camp. Many users successfully use Parallels and report it works perfectly. We include setup guidance for Mac users."
            />

            <FAQItem
              question="Is there a money-back guarantee?"
              answer="Yes! We offer a 30-day money-back guarantee. If you're not satisfied for any reason within 30 days of purchase, just email us for a full refund - no questions asked."
            />

            <FAQItem
              question="Will I get a badge?"
              answer="Yes! Upon completion of all parts, you'll receive a professional proof of completion that you can add to your LinkedIn profile, resume, or email signature."
            />

            <FAQItem
              question="How is this different from YouTube tutorials?"
              answer="This is a complete, structured system designed specifically for construction estimators - not random tips. You get custom tool sets, practice files, Excel templates, and a proven workflow. Plus, it's taught by someone who uses Bluebeam daily on real commercial projects."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="purchase" className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Master Bluebeam?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of estimators who've gone digital and never looked back
            </p>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl p-8 lg:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Bluebeam Mastery - Complete Tool</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">$147</div>
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
                    <span>6+ hours of video guides</span>
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
                    <span>Custom Bluebeam tool sets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Practice project files</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Excel report templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>50+ tips & shortcuts guide</span>
                  </li>
                </ul>
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
              Questions? Email us at support@bidshield.co
            </p>
            <Link href="/membership" className="text-yellow-400 hover:text-yellow-300 font-semibold">
              Or get this tool + everything else with BidShield Pro membership →
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
