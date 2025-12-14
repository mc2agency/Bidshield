import Link from 'next/link';
import { Metadata } from 'next';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export const metadata: Metadata = {
  title: 'Roof Measurement & Technology Course - Drones, Apps & Digital Tools | MC2 Academy',
  description: 'Master modern roof measurement technology including drones, satellite measurement, mobile apps, and digital reporting. Learn EagleView, Hover, drones, and more.',
  keywords: 'roof measurement technology, drone roof measurement, EagleView, Hover app, satellite measurement, roofing technology course, digital roof measurement'
};

export default function MeasurementTechnologyPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold">
                CUTTING-EDGE TECHNOLOGY
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Roof Measurement
                <br />
                <span className="text-blue-300">& Technology</span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Master modern measurement technology. From satellite reports to drones, learn every digital tool that's transforming roofing.
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div>
                  <div className="text-5xl font-bold">$197</div>
                  <div className="text-blue-200">One-time payment</div>
                </div>
                <div className="h-12 w-px bg-blue-600" />
                <div className="space-y-1">
                  <div className="text-sm text-blue-200">7 Technology Modules</div>
                  <div className="text-sm text-blue-200">5+ Hours of Training</div>
                  <div className="text-sm text-blue-200">Lifetime Access</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#purchase"
                  className="inline-block px-8 py-4 bg-yellow-400 text-blue-900 rounded-lg font-bold hover:bg-yellow-300 transition-colors text-lg text-center"
                >
                  Enroll Now - $197
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
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Tool comparison guides</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-600">
              <h3 className="text-2xl font-bold mb-6">This Course Includes:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Satellite Report Training</div>
                    <div className="text-sm text-blue-200">EagleView, Hover, CoreLogic deep dives</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Drone Measurement Guide</div>
                    <div className="text-sm text-blue-200">Equipment, software, and workflows</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Mobile App Tutorials</div>
                    <div className="text-sm text-blue-200">On-site measurement apps and tools</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Technology Comparison Charts</div>
                    <div className="text-sm text-blue-200">Cost, accuracy, and ROI analysis</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Real Project Examples</div>
                    <div className="text-sm text-blue-200">Side-by-side accuracy comparisons</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Professional Certificate</div>
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
                Still Climbing on Every Roof?
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Spending hours on steep or dangerous roofs just to get measurements</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Liability and safety risks every time you climb a ladder</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Unsure which measurement technology is worth the investment</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Confused by satellite reports and questioning their accuracy</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Losing bids because competitors provide faster turnaround times</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Missing out on jobs where roof access isn't possible</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-6">
                Embrace Modern Measurement Technology
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Get accurate measurements without climbing - satellite, drone, or ground-level</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Eliminate safety risks and reduce insurance liability</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Know exactly which tools to invest in for your business size and market</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Validate satellite reports and understand their accuracy limitations</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Provide instant quotes and impress homeowners with same-day turnaround</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Bid jobs where traditional access is impossible or dangerous</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Overview */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Technologies You'll Master
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">🛰️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Satellite Reports</h3>
              <p className="text-gray-700 mb-4">
                EagleView, Hover, CoreLogic, and other satellite measurement services. Learn accuracy, limitations, and when to use each.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cost: $20-75 per report</li>
                <li>• Accuracy: ±2-5%</li>
                <li>• Turnaround: 24-48 hours</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">🚁</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Drone Measurement</h3>
              <p className="text-gray-700 mb-4">
                Professional drone equipment, photogrammetry software, and workflows for creating your own aerial measurements.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cost: $1,500-5,000 equipment</li>
                <li>• Accuracy: ±1-2%</li>
                <li>• Turnaround: 1-2 hours</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mobile Apps & Tools</h3>
              <p className="text-gray-700 mb-4">
                On-site measurement apps, ground-level photogrammetry, and digital pitch tools for instant measurements.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cost: $0-50/month</li>
                <li>• Accuracy: ±3-7%</li>
                <li>• Turnaround: Instant</li>
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
              Complete Course Curriculum
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              7 modules covering every modern measurement technology for roofing contractors
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Module 1 */}
            <ModuleCard
              number={1}
              title="Satellite Measurement Fundamentals"
              duration="50 minutes"
              lessons={[
                "How satellite roof measurement works (photogrammetry basics)",
                "Understanding accuracy and when satellite is reliable",
                "EagleView vs. Hover vs. CoreLogic comparison",
                "Reading and interpreting satellite reports",
                "Common satellite measurement errors",
                "When to climb and verify vs. trust the report"
              ]}
            />

            {/* Module 2 */}
            <ModuleCard
              number={2}
              title="EagleView Deep Dive"
              duration="45 minutes"
              lessons={[
                "EagleView platform navigation and ordering",
                "Understanding EagleView Premium vs. Standard",
                "Using SmartBuild design tool for new construction",
                "Integrating EagleView with estimating software",
                "Accuracy verification techniques",
                "Cost analysis and ROI for different business sizes"
              ]}
            />

            {/* Module 3 */}
            <ModuleCard
              number={3}
              title="Hover App & Ground-Level Technology"
              duration="55 minutes"
              lessons={[
                "Hover app complete walkthrough",
                "Capturing accurate photos for Hover processing",
                "Understanding Hover's measurement methodology",
                "Creating 3D models and visualizations",
                "Using Hover for homeowner presentations",
                "Pricing structure and subscription options"
              ]}
            />

            {/* Module 4 */}
            <ModuleCard
              number={4}
              title="Drone Measurement Systems"
              duration="65 minutes"
              lessons={[
                "Choosing the right drone (DJI Mavic, Phantom, etc.)",
                "FAA Part 107 requirements and licensing",
                "Flight planning and safety protocols",
                "Photogrammetry software (DroneDeploy, Pix4D)",
                "Processing aerial imagery into measurements",
                "Building your drone measurement workflow"
              ]}
            />

            {/* Module 5 */}
            <ModuleCard
              number={5}
              title="Mobile Apps & Digital Tools"
              duration="40 minutes"
              lessons={[
                "RoofSnap app complete guide",
                "Pitch Gauge apps and digital inclinometers",
                "On-site sketching and measurement apps",
                "Photo documentation and annotation tools",
                "Cloud storage and file organization",
                "Building a complete mobile toolkit"
              ]}
            />

            {/* Module 6 */}
            <ModuleCard
              number={6}
              title="Technology Selection & ROI"
              duration="50 minutes"
              lessons={[
                "Cost-benefit analysis by business size",
                "Which technology for residential vs. commercial",
                "Building a technology adoption roadmap",
                "Calculating ROI and payback period",
                "Training staff on new technology",
                "Avoiding costly technology mistakes"
              ]}
            />

            {/* Module 7 */}
            <ModuleCard
              number={7}
              title="Real-World Comparison Project"
              duration="60 minutes"
              lessons={[
                "Measuring the same roof with 5 different methods",
                "Accuracy comparison and analysis",
                "Speed and efficiency evaluation",
                "Cost per measurement breakdown",
                "When to use which technology",
                "Building your standard operating procedure"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Who This Course Is For
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Residential Contractors</h3>
              <p className="text-gray-700">
                Want to eliminate roof climbing, speed up quoting, and impress homeowners with instant digital measurements and 3D models.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Commercial Estimators</h3>
              <p className="text-gray-700">
                Need accurate measurements for large or difficult-to-access buildings. Evaluating drone programs or satellite services.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Business Owners</h3>
              <p className="text-gray-700">
                Considering technology investments and want to know which tools provide the best ROI for your specific business model.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Outcomes */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            By the End of This Course, You'll Be Able To:
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">1</span>
              <p className="text-lg">Order and interpret satellite measurement reports with confidence</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">2</span>
              <p className="text-lg">Use EagleView and Hover apps like a pro</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">3</span>
              <p className="text-lg">Operate drones for roof measurement (if you choose that path)</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">4</span>
              <p className="text-lg">Validate satellite accuracy and know when to verify in person</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">5</span>
              <p className="text-lg">Use mobile apps for on-site measurements and documentation</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">6</span>
              <p className="text-lg">Calculate ROI and choose the right technology for your business</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">7</span>
              <p className="text-lg">Eliminate roof climbing on 80%+ of jobs</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">8</span>
              <p className="text-lg">Provide faster quotes and win more jobs with technology advantage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            What Students Are Saying
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Real results from contractors using measurement technology
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Jake Morrison"
              role="Owner"
              company="Morrison Roofing Co."
              quote="I was skeptical about satellite reports until this course. Now I understand when they're accurate and when to verify. Haven't climbed a residential roof in 6 months. My insurance company loves it too."
              rating={5}
              highlight="Zero roof climbing in 6 months"
            />

            <TestimonialCard
              name="Rachel Kim"
              role="Estimator"
              company="Precision Roofing Systems"
              quote="The EagleView training was game-changing. I was ordering reports but not using half the features. Now I'm using SmartBuild for visualizations that close more sales. Worth every penny."
              rating={5}
              highlight="Closing more sales with tech"
            />

            <TestimonialCard
              name="Carlos Martinez"
              role="Owner/Operator"
              company="Martinez Roofing LLC"
              quote="Bought a drone after this course and it paid for itself in 2 months. I'm now the only contractor in my area offering aerial roof inspections. It's a huge competitive advantage."
              rating={5}
              highlight="Drone ROI in 2 months"
            />

            <TestimonialCard
              name="Amanda Foster"
              role="Commercial Estimator"
              company="Summit Commercial Roofing"
              quote="Finally understand which technology to use for which job type. No more wasting money on satellite reports for small jobs or climbing dangerous commercial roofs. This course has structure and strategy."
              rating={5}
              highlight="Optimized technology spending"
            />

            <TestimonialCard
              name="Tom Chen"
              role="Estimating Manager"
              company="Pacific Northwest Contractors"
              quote="The Hover app section alone was worth the course price. We now create 3D models for every homeowner presentation. Our close rate went from 35% to 52% in 3 months."
              rating={5}
              highlight="Close rate: 35% → 52%"
            />

            <TestimonialCard
              name="David Williams"
              role="Project Manager"
              company="Elite Roofing Group"
              quote="I was ordering the wrong type of satellite reports and overpaying. This course showed me exactly what to buy for each situation. Probably saving $200-300/month on measurement costs alone."
              rating={5}
              highlight="Saving $200-300/month"
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
              question="Do I need to buy any software or tools to take this course?"
              answer="No! This course teaches you ABOUT various technologies so you can make informed decisions. You don't need to own EagleView, drones, or Hover to learn. We provide demos and examples of everything."
            />

            <FAQItem
              question="Will this course help me decide which technology to invest in?"
              answer="Absolutely! That's the primary goal. Module 6 is entirely focused on ROI analysis and technology selection based on your business size, market, and budget. You'll know exactly what to buy (or not buy)."
            />

            <FAQItem
              question="Do I need a drone pilot license?"
              answer="If you want to fly drones commercially, yes - you need an FAA Part 107 license. This course covers what's required and how to get licensed. However, you can still learn drone technology without having the license yet."
            />

            <FAQItem
              question="How accurate are satellite reports really?"
              answer="Generally ±2-5% when conditions are ideal (good imagery, simple roof). This course teaches you how to spot potential issues and when satellite reports are vs. aren't reliable. You'll learn verification techniques too."
            />

            <FAQItem
              question="Can I use this for commercial roofing?"
              answer="Yes! Commercial contractors use EagleView, drones, and other technologies extensively. Large buildings are often perfect candidates for satellite or drone measurement instead of dangerous manual methods."
            />

            <FAQItem
              question="What's the best technology for residential contractors?"
              answer="It depends on your volume and budget. The course covers the complete spectrum from free mobile apps to $5,000 drone setups. Most residential contractors find the sweet spot with satellite reports ($30-40 each) or Hover ($50/month)."
            />

            <FAQItem
              question="How long does it take to complete?"
              answer="The course contains 5+ hours of video content. Most students complete it in 1-2 weeks. You have lifetime access, so learn at your own pace and revisit sections when you're ready to invest in specific technology."
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
              Ready to Master Measurement Technology?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Stop climbing dangerous roofs and start using modern measurement tools
            </p>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl p-8 lg:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Roof Measurement & Technology - Complete Course</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">$197</div>
              <p className="text-gray-600">One-time payment • Lifetime access • All updates included</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-bold mb-3">Course Content:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>7 technology modules</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>5+ hours of training</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Real comparison projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-3">Bonus Materials:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Technology comparison charts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>ROI calculation spreadsheet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Vendor discount codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Mobile app toolkit guide</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <GumroadCheckoutButton
                productKey="measurementTechnology"
                text="Enroll Now - $197"
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
              Or get this course + everything else with MC2 Pro membership →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

interface ModuleCardProps {
  number: number;
  title: string;
  duration: string;
  lessons: string[];
}

function ModuleCard({ number, title, duration, lessons }: ModuleCardProps) {
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
        {lessons.map((lesson, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>{lesson}</span>
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
