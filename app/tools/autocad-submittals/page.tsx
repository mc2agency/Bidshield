import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AutoCAD for Submittals - Shop Drawing Tool for Contractors | MC2 Estimating',
  description: 'Master AutoCAD essentials for creating professional shop drawings and submittal packages. Perfect for contractors who need CAD skills without becoming full-time drafters.',
  keywords: 'AutoCAD for contractors, shop drawings, construction submittals, CAD tools, AutoCAD essentials, contractor CAD tool'
};

export default function AutoCADSubmittalsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold">
                PROFESSIONAL DEVELOPMENT
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                AutoCAD Essentials
                <br />
                <span className="text-blue-300">for Contractors</span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Master exactly what you need to create professional shop drawings and submittal packages. No fluff, just practical CAD skills for contractors.
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div>
                  <div className="text-5xl font-bold">$247</div>
                  <div className="text-blue-200">One-time payment</div>
                </div>
                <div className="h-12 w-px bg-blue-600" />
                <div className="space-y-1">
                  <div className="text-sm text-blue-200">6 Focused Parts</div>
                  <div className="text-sm text-blue-200">8+ Hours of Content</div>
                  <div className="text-sm text-blue-200">Lifetime Access</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#purchase"
                  className="inline-block px-8 py-4 bg-yellow-400 text-blue-900 rounded-lg font-bold hover:bg-yellow-300 transition-colors text-lg text-center"
                >
                  Get Access - $247
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
                  <span>Free alternatives included</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-600">
              <h3 className="text-2xl font-bold mb-6">This Tool Includes:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">AutoCAD Template Files</div>
                    <div className="text-sm text-blue-200">Pre-configured for roofing shop drawings</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Sample Shop Drawings</div>
                    <div className="text-sm text-blue-200">Real submittal packages to work with</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Detail Library</div>
                    <div className="text-sm text-blue-200">Common roofing details ready to use</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Alternative Tools Guide</div>
                    <div className="text-sm text-blue-200">Free options: DraftSight, LibreCAD, Fusion 360</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Submittal Package Examples</div>
                    <div className="text-sm text-blue-200">Complete packages used on real projects</div>
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
                Losing Bids Due to Missing Shop Drawings?
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Paying expensive drafting services $500-2,000 per submittal package</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Waiting weeks for shop drawings, delaying project starts</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Losing commercial bids because you can't provide required submittals</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Intimidated by AutoCAD and thinking it's only for architects</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Unable to make quick revisions when submittal reviews come back</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Hand-sketching details that look unprofessional</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-6">
                Create Professional Shop Drawings In-House
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Save thousands per year by creating your own shop drawings</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Complete submittal packages in days, not weeks</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Win commercial projects that require professional submittals</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Master only what contractors need - no architectural design fluff</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Make revisions instantly when reviews come back</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Present professional, engineered-quality drawings to GCs and architects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Shop Drawings Matter in Commercial Work
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Required by GCs</h3>
              <p className="text-gray-700">
                Most commercial projects require shop drawings as part of the submittal process. Without them, you can't get approval to start work.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Save Thousands</h3>
              <p className="text-gray-700">
                Drafting services charge $500-2,000 per submittal. Creating your own shop drawings pays for this tool after just 1-2 projects.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Speed & Control</h3>
              <p className="text-gray-700">
                Control your timeline and make revisions instantly. No more waiting weeks for external drafters to make simple changes.
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
              6 focused parts teaching only what contractors need - no architectural design theory
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Part 1 */}
            <PartCard
              number={1}
              title="AutoCAD Basics for Contractors"
              duration="90 minutes"
              sections={[
                "AutoCAD interface and workspace setup",
                "Understanding the difference between model space and paper space",
                "Essential commands: Line, Circle, Rectangle, Polyline",
                "Zoom, Pan, and navigation shortcuts",
                "Layers and layer management",
                "Object snaps and precision drawing",
                "Basic editing: Move, Copy, Rotate, Scale"
              ]}
            />

            {/* Part 2 */}
            <PartCard
              number={2}
              title="Reading CAD Drawings"
              duration="75 minutes"
              sections={[
                "Understanding CAD file formats (DWG, DXF, PDF)",
                "Opening and viewing architectural drawings",
                "Reading title blocks and drawing information",
                "Using layers to isolate information",
                "Measuring from existing CAD files",
                "Identifying dimensions and annotations",
                "Extracting information for shop drawings"
              ]}
            />

            {/* Part 3 */}
            <PartCard
              number={3}
              title="Creating Professional Shop Drawings"
              duration="120 minutes"
              sections={[
                "Setting up shop drawing templates",
                "Creating plan views of roofing systems",
                "Drawing roof edges, penetrations, and details",
                "Adding dimensions and annotations",
                "Creating professional title blocks",
                "Organizing drawings by sheet number",
                "Export to PDF for submittal packages"
              ]}
            />

            {/* Part 4 */}
            <PartCard
              number={4}
              title="Sheet Metal & Roofing Details"
              duration="100 minutes"
              sections={[
                "Creating edge metal details (coping, gravel stop, fascia)",
                "Roof drain and scupper details",
                "Penetration flashing details (pipes, vents, conduits)",
                "Expansion joint and control joint details",
                "Parapet wall cap details",
                "Using blocks and detail libraries",
                "Modifying standard details for your projects"
              ]}
            />

            {/* Part 5 */}
            <PartCard
              number={5}
              title="Submittal Package Creation"
              duration="85 minutes"
              sections={[
                "Understanding submittal requirements in specs",
                "Organizing multi-sheet drawing sets",
                "Creating cover sheets and drawing indexes",
                "Coordinating shop drawings with product data",
                "PDF export settings for professional quality",
                "Naming conventions and file organization",
                "Resubmittal process and revision tracking"
              ]}
            />

            {/* Part 6 */}
            <PartCard
              number={6}
              title="Alternative Tools & Cost Savings"
              duration="60 minutes"
              sections={[
                "DraftSight - Free AutoCAD alternative overview",
                "LibreCAD - Open-source CAD software",
                "Autodesk Fusion 360 - Free for small businesses",
                "Comparing features and limitations",
                "When to invest in full AutoCAD",
                "Subscription vs. perpetual license options",
                "Maximizing ROI on CAD software investment"
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
              <h3 className="text-xl font-bold text-gray-900 mb-3">Commercial Contractors</h3>
              <p className="text-gray-700">
                Bidding commercial projects that require shop drawings and submittal packages. Tired of paying expensive drafting fees.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">📐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Project Managers</h3>
              <p className="text-gray-700">
                Need to create or review shop drawings, make revisions quickly, and manage the submittal process efficiently.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Small Business Owners</h3>
              <p className="text-gray-700">
                Want to bring submittal creation in-house to save money, control timelines, and win bigger commercial projects.
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
              <p className="text-lg">Navigate AutoCAD confidently and use essential drawing commands</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">2</span>
              <p className="text-lg">Read and extract information from architectural CAD drawings</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">3</span>
              <p className="text-lg">Create professional shop drawings for roofing systems</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">4</span>
              <p className="text-lg">Develop detailed sheet metal and flashing details</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">5</span>
              <p className="text-lg">Organize complete submittal packages ready for GC approval</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">6</span>
              <p className="text-lg">Use free CAD alternatives if budget is limited</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">7</span>
              <p className="text-lg">Make quick revisions when submittal reviews come back</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">8</span>
              <p className="text-lg">Save thousands annually by creating shop drawings in-house</p>
            </div>
          </div>
        </div>
      </section>

      {/* Software Requirements */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Software Options
          </h2>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-300">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Recommended Option:</h3>
                <p className="text-gray-700 mb-4">
                  <strong>AutoCAD or AutoCAD LT</strong>
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Subscription:</strong> $220/month (AutoCAD) or $55/month (AutoCAD LT)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Free Trial:</strong> 30-day trial available (enough to complete most of this tool)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Note:</strong> AutoCAD LT is sufficient for shop drawings - you don't need full AutoCAD</span>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free Alternatives (Covered in Tool):</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>DraftSight</strong> - Very similar to AutoCAD, free version available</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>LibreCAD</strong> - Completely free, open-source (limited features)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Fusion 360</strong> - Free for small businesses (under $100k revenue)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>ROI Note:</strong> If you're currently paying $500-2,000 per submittal package, even full AutoCAD ($220/month) pays for itself after your first project. Most contractors save $5,000-15,000 annually by creating shop drawings in-house.
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
            Real results from contractors who mastered CAD skills
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Tom Bennett"
              role="Owner/Estimator"
              company="Bennett Construction Group"
              quote="After 15 years of outsourcing shop drawings, I finally mastered how to do them myself. Saved over $8,000 in the first 6 months. The AutoCAD and SketchUp tools together helped me create submittals that impressed GCs and won bigger projects."
              rating={5}
              highlight="Saved $8,000 in 6 months"
            />

            <TestimonialCard
              name="Robert Garcia"
              role="Project Manager"
              company="Garcia Roofing Systems"
              quote="We were waiting 2-3 weeks for shop drawings from external drafters. Now I create them in-house in 2-3 days. The speed advantage alone has helped us start projects faster and keep GCs happy."
              rating={5}
              highlight="3 weeks → 3 days turnaround"
            />

            <TestimonialCard
              name="Lisa Chen"
              role="Commercial Estimator"
              company="Coastal Commercial Roofing"
              quote="I was intimidated by CAD software and thought it was only for architects. This tool made it approachable and taught exactly what contractors need. Now I can create professional shop drawings and make quick revisions."
              rating={5}
              highlight="From intimidated to confident"
            />

            <TestimonialCard
              name="Michael Santos"
              role="Owner"
              company="Santos Construction LLC"
              quote="Started with the free trial of AutoCAD and completed the tool. By the time the trial ended, I had already created 3 submittal packages for active projects. Paid for AutoCAD subscription and this tool within a month."
              rating={5}
              highlight="ROI in first month"
            />

            <TestimonialCard
              name="Jennifer Martinez"
              role="Project Coordinator"
              company="Summit Roofing Contractors"
              quote="The detail library alone is worth the price. Pre-made flashing and edge metal details save me hours on every project. I just modify them for our specific job conditions."
              rating={5}
              highlight="Detail library saves hours"
            />

            <TestimonialCard
              name="David Park"
              role="Estimator/PM"
              company="Park Commercial Roofing"
              quote="Using AutoCAD opened up commercial opportunities we were passing on before. GCs now see us as a professional outfit that can handle complex projects with full submittal packages."
              rating={5}
              highlight="Won commercial opportunities"
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
              question="Do I need prior CAD experience?"
              answer="No! This tool is designed for complete beginners. We start with the absolute basics and build up to creating professional shop drawings. If you can use a computer, you can use this."
            />

            <FAQItem
              question="Do I need to buy AutoCAD to use this tool?"
              answer="Not immediately. AutoCAD offers a 30-day free trial which gives you time to master and decide. The tool also covers free alternatives like DraftSight and LibreCAD that work for most contractors."
            />

            <FAQItem
              question="How long will it take to complete the tool?"
              answer="The tool contains 8+ hours of video content. Most users complete it in 2-3 weeks, practicing 3-5 hours per week. You have lifetime access, so work at your own pace."
            />

            <FAQItem
              question="Is AutoCAD LT sufficient, or do I need full AutoCAD?"
              answer="AutoCAD LT ($55/month) is perfect for shop drawings and submittal creation. You don't need full AutoCAD ($220/month) unless you're doing 3D modeling or advanced customization. We cover both in the tool."
            />

            <FAQItem
              question="Will this work for other trades besides roofing?"
              answer="Absolutely! While examples focus on roofing, the CAD skills apply to any construction trade - sheet metal, HVAC, plumbing, electrical, structural steel, etc. Shop drawing principles are universal."
            />

            <FAQItem
              question="How much money will I save by creating my own shop drawings?"
              answer="Most drafting services charge $500-2,000 per submittal package. If you do 5-10 submittals per year, you'll save $2,500-20,000 annually. This tool pays for itself after your first 1-2 projects."
            />

            <FAQItem
              question="What's included with my purchase?"
              answer="You get lifetime access to all 6 parts (8+ hours), AutoCAD template files, sample shop drawings, a detail library with common roofing details, alternative tools guide, submittal package examples, and a proof of completion. Plus all future updates."
            />

            <FAQItem
              question="Is there a money-back guarantee?"
              answer="Yes! We offer a 30-day money-back guarantee. If you're not satisfied for any reason, just email us for a full refund."
            />

            <FAQItem
              question="Will I get a badge?"
              answer="Yes! Upon completion of all parts, you'll receive a professional proof of completion that you can add to your LinkedIn profile and resume."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="purchase" className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Create Professional Shop Drawings?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Save thousands annually and control your submittal timeline
            </p>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl p-8 lg:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">AutoCAD Essentials for Contractors - Complete Tool</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">$247</div>
              <p className="text-gray-600">One-time payment • Lifetime access • All updates included</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-bold mb-3">Tool Contents:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>6 focused parts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>8+ hours of video guides</span>
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
                    <span>AutoCAD template files</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Sample shop drawings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Roofing detail library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Free alternatives guide</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Gumroad Button Placeholder */}
            <div className="text-center">
              <div className="inline-block bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
                <p className="text-gray-600 mb-2">Gumroad Buy Button Integration</p>
                <p className="text-sm text-gray-500">Connect to Gumroad product link here</p>
              </div>

              <div className="flex flex-col items-center gap-4 mb-6">
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
