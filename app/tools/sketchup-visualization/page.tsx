import Link from 'next/link';
import { Metadata } from 'next';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export const metadata: Metadata = {
  title: 'SketchUp for Visualization Tool - 3D Modeling for Contractors',
  description: 'Use SketchUp for roofing and construction visualization. Create stunning 3D models, client presentations, and shop drawings. Perfect for contractors who want to impress clients.',
  keywords: 'SketchUp for contractors, 3D roofing models, construction visualization, SketchUp tutorial, client presentations, roofing 3D models'
};

export default function SketchUpVisualizationPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold">
                VISUAL COMMUNICATION
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                SketchUp for
                <br />
                <span className="text-blue-300">Visualization</span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Create stunning 3D models and visualizations that wow clients. Use SketchUp from a contractor's perspective - no architecture degree needed.
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div>
                  <div className="text-5xl font-bold">$147</div>
                  <div className="text-blue-200">One-time payment</div>
                </div>
                <div className="h-12 w-px bg-blue-600" />
                <div className="space-y-1">
                  <div className="text-sm text-blue-200">6 Practical Parts</div>
                  <div className="text-sm text-blue-200">5+ Hours of Content</div>
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
                  <span>Model library included</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-600">
              <h3 className="text-2xl font-bold mb-6">This Tool Includes:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">SketchUp Template Library</div>
                    <div className="text-sm text-blue-200">Pre-built roofing components and materials</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Real Project Files</div>
                    <div className="text-sm text-blue-200">Complete models to work with and modify</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Material & Texture Library</div>
                    <div className="text-sm text-blue-200">Photorealistic roofing textures</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Presentation Templates</div>
                    <div className="text-sm text-blue-200">Scene setups for impressive client presentations</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm mt-1">✓</span>
                  <div>
                    <div className="font-semibold">Plugin Recommendations</div>
                    <div className="text-sm text-blue-200">Essential extensions for construction modeling</div>
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
                Struggling to Communicate Your Vision?
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Clients can't visualize your proposed solution from 2D drawings</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Losing bids to competitors with impressive 3D presentations</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Miscommunication leading to scope disputes and change orders</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Complex projects where photos and sketches aren't enough</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Intimidated by 3D modeling and thinking it's too technical</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl mt-1">✗</span>
                  <p>Want to create shop drawings but AutoCAD feels overwhelming</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-6">
                Create Visual Presentations That Sell
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Show clients exactly what their roof will look like in stunning 3D</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Stand out from competitors with professional visualizations</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Eliminate confusion and get client approval with clear 3D models</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Create shop drawings and coordination models visually</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Use SketchUp quickly - easier than AutoCAD for most contractors</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <p>Use SketchUp Free or upgrade to Pro based on your needs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why SketchUp Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Why SketchUp for Contractors?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easier Than AutoCAD</h3>
              <p className="text-gray-700">
                SketchUp's intuitive interface lets you build 3D models as naturally as sketching on paper. No complex commands or steep setup time.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Free to Start</h3>
              <p className="text-gray-700">
                SketchUp Free (web version) is powerful enough for most contractors. Upgrade to Pro ($299/year) only if you need advanced features.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Impact</h3>
              <p className="text-gray-700">
                Create photorealistic renderings and walkthroughs that impress clients and close more sales. Worth thousands in increased close rates.
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
              6 hands-on parts teaching SketchUp specifically for construction visualization
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Part 1 */}
            <PartCard
              number={1}
              title="SketchUp Basics"
              duration="55 minutes"
              sections={[
                "SketchUp Free vs. Pro - which do you need?",
                "Interface overview and customization",
                "Essential tools: Push/Pull, Line, Rectangle, Circle",
                "Navigation and view controls",
                "Precision drawing and measurements",
                "Groups and components explained",
                "Saving and organizing your work"
              ]}
            />

            {/* Part 2 */}
            <PartCard
              number={2}
              title="Building Your First Roof Model"
              duration="70 minutes"
              sections={[
                "Importing site photos or Google Earth imagery",
                "Tracing building footprints accurately",
                "Creating basic roof shapes (gable, hip, flat)",
                "Understanding roof pitch and geometry",
                "Adding roof edges and fascia",
                "Creating realistic roof textures and materials",
                "Modeling common roof features (chimneys, vents)"
              ]}
            />

            {/* Part 3 */}
            <PartCard
              number={3}
              title="Advanced Roofing Details"
              duration="65 minutes"
              sections={[
                "Complex roof geometries (valleys, dormers, transitions)",
                "Modeling edge metal and coping details",
                "Creating roof drains and scuppers in 3D",
                "HVAC curbs and penetrations",
                "Parapet walls and cap details",
                "Using components for repeating elements",
                "Building a personal component library"
              ]}
            />

            {/* Part 4 */}
            <PartCard
              number={4}
              title="Materials, Textures & Realism"
              duration="50 minutes"
              sections={[
                "Applying realistic roofing materials (shingles, TPO, metal)",
                "Creating custom textures from photos",
                "Understanding material scale and positioning",
                "Adding shadows and lighting for realism",
                "Sky and background settings",
                "Rendering basics for photorealistic output",
                "Using styles to control appearance"
              ]}
            />

            {/* Part 5 */}
            <PartCard
              number={5}
              title="Client Presentations & Scenes"
              duration="60 minutes"
              sections={[
                "Creating scenes (saved camera views)",
                "Setting up a presentation sequence",
                "Adding text, dimensions, and annotations",
                "Exporting images for proposals",
                "Creating animations and walkthroughs",
                "PDF and PowerPoint export options",
                "Presenting to clients - best practices"
              ]}
            />

            {/* Part 6 */}
            <PartCard
              number={6}
              title="Shop Drawings & Coordination"
              duration="65 minutes"
              sections={[
                "Using SketchUp for shop drawing creation",
                "LayOut introduction (Pro feature)",
                "Creating dimensioned plan views",
                "Detail callouts and annotations",
                "Coordinating with architectural models",
                "Exporting to AutoCAD (DWG/DXF)",
                "Real project walkthrough: quote to approval"
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
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sales-Focused Contractors</h3>
              <p className="text-gray-700">
                Want to close more deals with impressive 3D visualizations. Show homeowners exactly what they're getting before signing.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Complex Project Managers</h3>
              <p className="text-gray-700">
                Working on commercial projects with coordination challenges. Need visual tools to communicate with GCs, architects, and other trades.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Creative Estimators</h3>
              <p className="text-gray-700">
                Enjoy visual work and want to add 3D modeling skills. Prefer SketchUp's intuitive approach over AutoCAD's technical complexity.
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
              <p className="text-lg">Navigate SketchUp confidently and use core modeling tools</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">2</span>
              <p className="text-lg">Create accurate 3D roof models from plans or photos</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">3</span>
              <p className="text-lg">Model complex roof geometries including valleys and dormers</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">4</span>
              <p className="text-lg">Apply photorealistic materials and textures</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">5</span>
              <p className="text-lg">Create professional presentations and client walkthroughs</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">6</span>
              <p className="text-lg">Export images and animations for proposals</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">7</span>
              <p className="text-lg">Use SketchUp for basic shop drawing creation</p>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">8</span>
              <p className="text-lg">Build a component library for faster future modeling</p>
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">To Get Started:</h3>
                <p className="text-gray-700 mb-4">
                  <strong>SketchUp Free</strong> (web-based, completely free)
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Cost:</strong> $0 - runs in your web browser</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Perfect for:</strong> Using, simple models, client presentations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>Limitations:</strong> 10GB cloud storage, no CAD export</span>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Optional Upgrade:</h3>
                <p className="text-gray-700 mb-4">
                  <strong>SketchUp Pro</strong> (desktop application)
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>Cost:</strong> $299/year subscription</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>Adds:</strong> LayOut for shop drawings, CAD import/export, unlimited storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>When needed:</strong> Professional shop drawings, CAD integration</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Tool Note:</strong> This entire tool can be completed with SketchUp Free. We cover Pro features in Part 6, but you can skip that part or upgrade later if needed. Get started for $0!
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
            Real results from contractors using SketchUp
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Brian Foster"
              role="Owner"
              company="Foster Roofing Co."
              quote="My close rate went from 40% to 68% after I started showing clients 3D models. They can actually SEE what they're getting. This tool paid for itself in the first week with one high-end residential job."
              rating={5}
              highlight="Close rate: 40% → 68%"
            />

            <TestimonialCard
              name="Maria Santos"
              role="Estimator/Designer"
              company="Summit Roofing Systems"
              quote="I tried using AutoCAD and gave up. SketchUp clicked immediately. Now I'm creating shop drawings and client presentations that look like they came from an architect. Clients are blown away."
              rating={5}
              highlight="From frustrated to confident"
            />

            <TestimonialCard
              name="Kevin Park"
              role="Commercial PM"
              company="Apex Construction Group"
              quote="The coordination part saved our bacon on a $800k project. We found conflicts with HVAC curbs in SketchUp before they became expensive field problems. Worth 100x the tool price."
              rating={5}
              highlight="Prevented costly field conflicts"
            />

            <TestimonialCard
              name="Amanda Chen"
              role="Owner/Estimator"
              company="Pacific Northwest Roofing"
              quote="Started with SketchUp Free and the tool templates. Built my first 3D model in under an hour. Now every proposal includes a visualization. I'll never go back to 2D-only presentations."
              rating={5}
              highlight="First model in under 1 hour"
            />

            <TestimonialCard
              name="Robert Williams"
              role="Project Manager"
              company="Elite Commercial Roofing"
              quote="The material library and textures alone are worth the tool. I can show clients different roofing options (colors, materials) in 3D before they commit. Upsells have increased 30%."
              rating={5}
              highlight="Upsells increased 30%"
            />

            <TestimonialCard
              name="Lisa Martinez"
              role="Estimator"
              company="Coastal Contractors LLC"
              quote="I was skeptical that SketchUp would be useful for roofing. Boy was I wrong. Complex geometry that was confusing in 2D became crystal clear in 3D. My accuracy has never been better."
              rating={5}
              highlight="Crystal clear complex geometry"
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
              question="Do I need to buy SketchUp to use this tool?"
              answer="No! SketchUp Free (web version) is completely free and powerful enough for 95% of what contractors need. You can complete the entire tool without spending a dime on software. We cover SketchUp Pro features, but they're optional."
            />

            <FAQItem
              question="I'm not artistic or good at drawing. Can I still use this?"
              answer="Absolutely! SketchUp is more like digital Legos than artistic drawing. If you can click and drag, you can build 3D models. The tool is designed for contractors, not artists. No artistic ability required."
            />

            <FAQItem
              question="How long until I can create my first client presentation?"
              answer="Most users create their first simple roof model in Part 2 (first 2-3 hours). By Part 5, you'll be creating full client presentations. Many users use SketchUp on real quotes within the first week."
            />

            <FAQItem
              question="Is SketchUp better than AutoCAD for shop drawings?"
              answer="It depends. SketchUp is easier to use and better for visualization. AutoCAD is more precise for technical drawings. Many contractors use SketchUp for client presentations and coordination, then AutoCAD for final shop drawings. We cover both approaches."
            />

            <FAQItem
              question="Will this work for commercial projects?"
              answer="Yes! SketchUp is widely used in commercial construction for coordination and visualization. Many contractors use it to coordinate with MEP trades, show GCs installation methods, and create submittal visualizations."
            />

            <FAQItem
              question="Can I use this on iPad or tablet?"
              answer="SketchUp Free runs in any web browser, so yes - you can use it on iPad. However, the experience is better on a computer with a mouse. SketchUp also has dedicated mobile apps, but the desktop/web version is recommended for serious work."
            />

            <FAQItem
              question="What's included with my purchase?"
              answer="Lifetime access to all 6 parts (5+ hours), SketchUp template library, material and texture library, component library, presentation templates, plugin recommendations, and proof of completion. Plus all future updates."
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
              Ready to Master SketchUp?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Create stunning visualizations that wow clients and close more sales
            </p>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl p-8 lg:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">SketchUp for Visualization - Complete Tool</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">$147</div>
              <p className="text-gray-600">One-time payment • Lifetime access • All updates included</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-bold mb-3">Tool Contents:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>6 practical parts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>5+ hours of content</span>
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
                    <span>SketchUp template library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Material & texture library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Component library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">+</span>
                    <span>Presentation templates</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <GumroadCheckoutButton
                productKey="sketchupVisualization"
                text="Get Access - $147"
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
