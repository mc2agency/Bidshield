import Link from 'next/link';

export default function PlansAndSpecsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="inline-block bg-blue-800 text-blue-100 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Resource Block #3
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Reading Plans & Specifications
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Master the art of reading construction drawings and interpreting specifications.
              Master identifying roofing scope, coordinate trades, and catch errors before they become costly mistakes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/tools/estimating-essentials"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
              >
                Take the Full Tool →
              </Link>
              <Link
                href="#free-content"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg border-2 border-blue-600"
              >
                Start with Free Sections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Why Reading Plans & Specs Matters
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                <h3 className="text-xl font-bold text-red-900 mb-3">Common Mistakes Cost You Money</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Missing scope items buried in specs</li>
                  <li>• Not understanding roofing assembly details</li>
                  <li>• Failing to coordinate with other trades</li>
                  <li>• Overlooking critical submittal requirements</li>
                  <li>• Misreading elevation changes and transitions</li>
                </ul>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <h3 className="text-xl font-bold text-green-900 mb-3">Proper Plan Reading Gives You</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Complete, accurate scope identification</li>
                  <li>• Better coordination = fewer conflicts</li>
                  <li>• Competitive advantage on complex projects</li>
                  <li>• Fewer change orders and surprises</li>
                  <li>• Professional credibility with GCs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              What You'll Get
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: '📐',
                  title: 'Reading Construction Drawings',
                  topics: [
                    'Title blocks and cover sheets',
                    'Architectural vs. Structural plans',
                    'Roof plans, elevations, and sections',
                    'Detail callouts and references',
                    'Scale and measurement conventions',
                    'Symbols and abbreviations'
                  ]
                },
                {
                  icon: '📖',
                  title: 'Understanding Specifications',
                  topics: [
                    'CSI MasterFormat organization',
                    'Division 07 - Thermal & Moisture Protection',
                    'Section 07 50 00 - Membrane Roofing',
                    'Reading general vs. specific requirements',
                    'Submittal and sample requirements',
                    'Product approval and substitutions'
                  ]
                },
                {
                  icon: '🏗️',
                  title: 'Scope Identification',
                  topics: [
                    'Defining roofing scope boundaries',
                    'Identifying related scope (flashing, insulation)',
                    'Understanding what\'s included vs. excluded',
                    'Reading allowances and unit prices',
                    'Spotting conflicting information',
                    'Knowing when to submit an RFI'
                  ]
                },
                {
                  icon: '🔗',
                  title: 'Multi-Discipline Coordination',
                  topics: [
                    'Reading mechanical, electrical, plumbing plans',
                    'Identifying roof penetrations and equipment',
                    'Coordinating with HVAC curbs and supports',
                    'Understanding structural requirements',
                    'Reading fall protection anchor locations',
                    'Fireproofing and firestopping coordination'
                  ]
                },
                {
                  icon: '🔍',
                  title: 'Detail Analysis',
                  topics: [
                    'Roof edge details (gravel stop, coping, parapet)',
                    'Penetration flashing details',
                    'Valley, ridge, and hip assemblies',
                    'Transition details between systems',
                    'Warranty-compliant assembly buildups',
                    'Manufacturer vs. custom details'
                  ]
                },
                {
                  icon: '✅',
                  title: 'Quality Control & Compliance',
                  topics: [
                    'Verifying code compliance requirements',
                    'FM Global vs. UL assembly requirements',
                    'Wind uplift and fire rating specifications',
                    'Energy code compliance (R-value, air barriers)',
                    'Testing requirements (flood, core cuts)',
                    'Closeout document requirements'
                  ]
                }
              ].map((section, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-200">
                  <div className="text-4xl mb-4">{section.icon}</div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.topics.map((topic, i) => (
                      <li key={i} className="text-gray-700 flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Free Content Section */}
      <section id="free-content" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Free Resources
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Get started with these free guides and videos
            </p>

            <div className="space-y-6">
              <FreeResource
                icon="📄"
                title="Construction Drawing Basics Cheat Sheet"
                description="Free PDF download covering the essentials of reading construction plans - symbols, abbreviations, scale, and conventions."
                type="PDF Download"
                href="/downloads/construction-drawing-basics.pdf"
              />
              <FreeResource
                icon="🎥"
                title="Understanding CSI MasterFormat (Video)"
                description="15-minute video explaining how specifications are organized and where to find roofing requirements."
                type="Video Tutorial"
                href="/resources/videos/csi-masterformat"
              />
              <FreeResource
                icon="📋"
                title="Plan Reading Checklist"
                description="Step-by-step checklist to ensure you don't miss critical information when reviewing plans and specs."
                type="Checklist"
                href="/downloads/plan-reading-checklist.pdf"
              />
              <FreeResource
                icon="📖"
                title="Common Roofing Symbols & Abbreviations"
                description="Reference guide to the most common symbols and abbreviations you'll see on roofing plans."
                type="Reference Guide"
                href="/downloads/roofing-symbols-guide.pdf"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Related Tools */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Related Tools & Products
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <ToolCard
                title="Estimating Essentials"
                price="$497"
                description="Complete tool covering plan reading, scope development, and accurate estimating."
                href="/tools/estimating-essentials"
              />
              <ToolCard
                title="Bluebeam Mastery"
                price="$197"
                description="Learn to use Bluebeam for digital takeoffs, markups, and document management."
                href="/tools/bluebeam-mastery"
              />
              <ToolCard
                title="Template Bundle"
                price="$129"
                description="Professional estimating templates for all major roofing systems."
                href="/products/template-bundle"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Master Plan Reading?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join the Estimating Essentials tool and master the complete system for reading plans,
            understanding specs, and developing accurate scope.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools/estimating-essentials"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Get Access to Full Tool - $497 →
            </Link>
            <Link
              href="/membership"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg border-2 border-blue-600"
            >
              Get MC2 Pro Membership
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FreeResource({ icon, title, description, type, href }: {
  icon: string;
  title: string;
  description: string;
  type: string;
  href: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border-2 border-blue-200 hover:border-blue-400 transition-all">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
              {type}
            </span>
          </div>
          <p className="text-gray-700 mb-4">{description}</p>
          <Link
            href={href}
            className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
          >
            Access Free Resource →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ title, price, description, href }: {
  title: string;
  price: string;
  description: string;
  href: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-blue-500">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-2xl font-bold text-blue-600 mb-4">{price}</p>
      <p className="text-gray-700 mb-6">{description}</p>
      <Link
        href={href}
        className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        View Details
      </Link>
    </div>
  );
}
