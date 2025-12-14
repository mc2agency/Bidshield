import Link from 'next/link';

export default function BusinessOperationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="inline-block bg-blue-800 text-blue-100 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Learning Blocks #8, #9, #12, #13
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Business Operations & Compliance
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Master the business side of roofing contracting - from writing winning proposals to executing projects,
              managing insurance requirements, and ensuring OSHA compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products/proposal-templates"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
              >
                Get Proposal Templates →
              </Link>
              <Link
                href="#free-content"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg border-2 border-blue-600"
              >
                Free Business Resources
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
              Why Business Operations Matter
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-8 mb-8">
              <p className="text-lg text-gray-800 leading-relaxed">
                You can be the best estimator in the world, but if you can't write a compelling proposal,
                manage submittals, handle insurance requirements, or maintain OSHA compliance - you won't win
                projects or keep them profitable.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Professional Operations Include:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Writing persuasive, professional proposals</li>
                  <li>• Managing submittals and shop drawings</li>
                  <li>• Maintaining proper insurance coverage</li>
                  <li>• OSHA safety compliance and training</li>
                  <li>• Contract review and negotiation</li>
                  <li>• Project closeout documentation</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">The Competitive Advantage:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Win more bids with professional presentation</li>
                  <li>• Avoid costly insurance gaps and claims</li>
                  <li>• Prevent OSHA fines and shutdowns</li>
                  <li>• Smooth project execution = repeat clients</li>
                  <li>• Protect your business legally</li>
                  <li>• Build long-term client relationships</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Topics */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              What You'll Master
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: '📝',
                  title: 'Proposal Writing',
                  description: 'Create compelling proposals that win projects',
                  topics: [
                    'Professional proposal structure and formatting',
                    'Writing persuasive cover letters',
                    'Scope of work clarity and detail',
                    'Pricing presentation strategies',
                    'Terms and conditions that protect you',
                    'Project timeline and milestone planning',
                    'Reference projects and past performance',
                    'Digital signature and submission'
                  ]
                },
                {
                  icon: '📋',
                  title: 'Submittals & Closeout',
                  description: 'Navigate project execution requirements',
                  topics: [
                    'Reading submittal requirements in specs',
                    'Product data sheet compilation',
                    'Shop drawing preparation',
                    'Sample submission procedures',
                    'RFI (Request for Information) process',
                    'As-built documentation',
                    'Warranty documentation packages',
                    'O&M (Operations & Maintenance) manuals'
                  ]
                },
                {
                  icon: '🛡️',
                  title: 'Insurance & Bonding',
                  description: 'Understand and maintain proper coverage',
                  topics: [
                    'General Liability insurance requirements',
                    'Workers Compensation coverage',
                    'Umbrella/Excess liability policies',
                    'Completed Operations coverage',
                    'Auto insurance for commercial vehicles',
                    'Additional Insured endorsements',
                    'Certificate of Insurance (COI) management',
                    'Performance and payment bonds'
                  ]
                },
                {
                  icon: '⚠️',
                  title: 'OSHA Compliance',
                  description: 'Keep your team safe and avoid violations',
                  topics: [
                    'OSHA 10 and OSHA 30 hour training',
                    'Fall protection requirements (1926.501)',
                    'Personal fall arrest systems',
                    'Guardrail and safety monitor systems',
                    'Ladder safety and scaffolding',
                    'Rooftop warning line systems',
                    'Hazard communication and SDS',
                    'Jobsite safety inspections'
                  ]
                },
                {
                  icon: '📄',
                  title: 'Contract Management',
                  description: 'Protect your interests with proper contracts',
                  topics: [
                    'Understanding AIA contract documents',
                    'ConsensusDocs alternatives',
                    'Subcontract agreements',
                    'Payment terms and schedules',
                    'Change order procedures',
                    'Lien waiver management',
                    'Warranty vs. guarantee provisions',
                    'Dispute resolution clauses'
                  ]
                },
                {
                  icon: '✅',
                  title: 'Business Requirements',
                  description: 'Essential licenses, registrations, and compliance',
                  topics: [
                    'Contractor licensing by state',
                    'Business entity formation (LLC, Corp)',
                    'Federal tax ID (EIN) and state tax registration',
                    'Prevailing wage and certified payroll',
                    'DBE/MBE/WBE certifications',
                    'Prequalification requirements',
                    'SAM.gov registration for federal work',
                    'Local business licenses and permits'
                  ]
                }
              ].map((section, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-200">
                  <div className="text-4xl mb-4">{section.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{section.title}</h3>
                  <p className="text-gray-600 mb-4">{section.description}</p>
                  <ul className="space-y-2">
                    {section.topics.map((topic, i) => (
                      <li key={i} className="text-gray-700 text-sm flex items-start">
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

      {/* Free Resources */}
      <section id="free-content" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Free Business Resources
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Download these free guides to get started
            </p>

            <div className="space-y-6">
              <FreeResource
                icon="📄"
                title="Proposal Template Sample"
                description="Free professional proposal template for roofing projects - includes cover letter, scope, pricing, and terms."
                type="Template Download"
                href="/downloads/proposal-template-sample.docx"
              />
              <FreeResource
                icon="📋"
                title="Insurance Requirements Checklist"
                description="Complete checklist of insurance types, coverage amounts, and requirements for commercial roofing contractors."
                type="Checklist"
                href="/downloads/insurance-checklist.pdf"
              />
              <FreeResource
                icon="⚠️"
                title="OSHA Fall Protection Quick Guide"
                description="Easy-to-understand guide covering the basics of OSHA fall protection requirements for roofing."
                type="PDF Guide"
                href="/downloads/osha-fall-protection-guide.pdf"
              />
              <FreeResource
                icon="📖"
                title="Submittal Requirements Guide"
                description="Learn how to read submittal requirements in specifications and prepare complete submittal packages."
                type="Guide"
                href="/downloads/submittal-guide.pdf"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Professional Business Tools
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <ProductCard
                title="Proposal Templates"
                price="$79"
                description="Professional proposal templates for 8 roofing systems, plus cover letters and terms."
                href="/products/proposal-templates"
              />
              <ProductCard
                title="Insurance & Compliance Guide"
                price="$49"
                description="Complete guide to contractor insurance, COIs, bonds, and compliance requirements."
                href="/products/insurance-guide"
              />
              <ProductCard
                title="OSHA Safety Guide"
                price="$39"
                description="Comprehensive OSHA compliance guide for roofing contractors with checklists and forms."
                href="/products/osha-guide"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Build a Professional Roofing Business
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Get access to all our business operations templates, guides, and training with MC2 Pro membership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Join MC2 Pro - $197/mo →
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg border-2 border-blue-600"
            >
              Browse Individual Products
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
            Download Free Resource →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ title, price, description, href }: {
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
        Learn More
      </Link>
    </div>
  );
}
