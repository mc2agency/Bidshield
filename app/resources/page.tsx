import Link from 'next/link';

export default function ResourceCenter() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm font-semibold">
              Free Educational Content
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Resource Center
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Comprehensive guides, tutorials, and resources to help you master construction estimating.
              Get started for free, upgrade when you're ready.
            </p>
          </div>
        </div>
      </section>

      {/* Resource Blocks Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Know
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From finding leads to executing projects, explore our comprehensive library of free educational content.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Block 1: Finding Work */}
            <ResourceCard
              title="Finding Work"
              description="Where to find construction leads, how to access BuildingConnected, Dodge Reports, and build relationships with GCs."
              icon="📋"
              href="/resources/finding-work"
              topics={[
                'BuildingConnected & Dodge',
                'Government bid sources',
                'GC relationships',
                'Digital marketing for leads'
              ]}
              premium="Lead Generation Playbook - $39"
            />

            {/* Block 2: Roof Measurement */}
            <ResourceCard
              title="Roof Measurement"
              description="Master aerial measurement tools and techniques to measure roofs accurately without ever climbing a ladder."
              icon="📏"
              href="/resources/measurement"
              topics={[
                'Pictometry & EagleView',
                'Google Earth methods',
                'Drone measurements',
                'Manual verification'
              ]}
              premium="Digital Measurement Tool - $97"
            />

            {/* Block 3: Reading Plans & Specs */}
            <ResourceCard
              title="Reading Plans & Specs"
              description="Learn to read construction drawings, understand specifications, and coordinate multi-discipline plans like a pro."
              icon="📐"
              href="/resources/plans-and-specs"
              topics={[
                'CSI MasterFormat',
                'Architectural drawings',
                'Structural & MEP plans',
                'Submittal requirements'
              ]}
              premium="Estimating Essentials Tool - $497"
            />

            {/* Block 4: Roofing Systems */}
            <ResourceCard
              title="Roofing Systems"
              description="Deep dive into TPO, EPDM, SBS, metal, tile, and green roofs with system-specific calculations and best practices."
              icon="🏗️"
              href="/resources/roofing-systems"
              topics={[
                'Single-ply membranes',
                'Modified bitumen',
                'Metal & tile roofing',
                'Green roof systems'
              ]}
              premium="System Templates - $39 each"
            />

            {/* Block 5: Estimating Best Practices */}
            <ResourceCard
              title="Estimating Best Practices"
              description="Common mistakes to avoid, time-saving techniques, and professional workflows used by top estimators."
              icon="🧮"
              href="/resources/estimating-best-practices"
              topics={[
                'Waste factors',
                'Labor burden',
                'General conditions',
                'Quality control'
              ]}
              premium="Estimating Essentials - $497"
            />

            {/* Block 6: Software & Technology */}
            <ResourceCard
              title="Software & Technology"
              description="Compare estimating software, learn Bluebeam basics, and understand when to use AI tools vs manual methods."
              icon="⚡"
              href="/resources/software-technology"
              topics={[
                'Bluebeam basics',
                'Estimating software',
                'AI tools overview',
                'Tech stack setup'
              ]}
              premium="Bluebeam Mastery - $147"
            />

            {/* Block 7: Proposal Writing */}
            <ResourceCard
              title="Proposal Writing"
              description="Craft winning proposals that stand out from the competition and communicate professionalism and value."
              icon="📄"
              href="/resources/proposal-writing"
              topics={[
                'Proposal structure',
                'Scope of work',
                'Pricing presentation',
                'Terms & conditions'
              ]}
              premium="Proposal Templates - $79"
            />

            {/* Block 8: Business Operations */}
            <ResourceCard
              title="Business Operations"
              description="Essential business knowledge: insurance requirements, OSHA compliance, bonding, and contractor licensing."
              icon="💼"
              href="/resources/business-operations"
              topics={[
                'Insurance requirements',
                'OSHA & safety',
                'Bonding & licensing',
                'Risk management'
              ]}
              premium="Insurance & Compliance Guide - $49"
            />

            {/* Block 9: Submittals & Shop Drawings */}
            <ResourceCard
              title="Submittals & Shop Drawings"
              description="Learn what submittals are, when they're required, and how to create professional shop drawings and product data packages."
              icon="📊"
              href="/resources/submittals"
              topics={[
                'Submittal requirements',
                'Product data sheets',
                'Shop drawings basics',
                'Closeout documents'
              ]}
              premium="Submittals Tool - $197"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Want Full Access to Everything?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join BidShield Pro for unlimited access to all tools, templates, tools, and monthly live Q&A sessions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              Join BidShield Pro - $197/mo →
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-lg border-2 border-blue-600"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ResourceCard({
  title,
  description,
  icon,
  href,
  topics,
  premium
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  topics: string[];
  premium: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-500 flex flex-col">
      <div className="p-6 flex-1">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>

        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">Topics covered:</div>
          <ul className="space-y-1">
            {topics.map((topic, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="text-xs text-blue-700 font-semibold mb-1">Premium Product:</div>
          <div className="text-sm text-blue-900">{premium}</div>
        </div>
      </div>

      <div className="p-6 pt-0">
        <Link
          href={href}
          className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Get Started →
        </Link>
      </div>
    </div>
  );
}
