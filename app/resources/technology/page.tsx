import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimating Technology & Software Stack for Roofers | BidShield',
  description: 'Master the essential technology stack for professional roofing estimators — from aerial measurement tools to AI-powered software. See what to use and how to use it.',
  keywords: 'roofing estimating technology, Bluebeam Revu, EagleView, drone roofing, AI roofing software, estimating tech stack',
  alternates: { canonical: 'https://www.bidshield.co/resources/technology' },
};

export default function TechnologyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="inline-block bg-blue-800 text-blue-100 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Resource Blocks #7 & #14
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Estimating Technology & Software
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Master the essential technology stack for professional roofing estimators.
              From measurement tools to AI-powered estimating software, see what to use and how to use it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/tools/bluebeam-mastery"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
              >
                Start with Bluebeam Tool →
              </Link>
              <Link
                href="#free-content"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg border-2 border-blue-600"
              >
                Free Tech Guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              The Professional Estimator's Technology Stack
            </h2>
            <p className="text-lg text-gray-700 text-center mb-12 max-w-3xl mx-auto">
              Modern estimating requires the right combination of hardware, software, and cloud services.
              Here's the complete technology ecosystem we teach.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold mb-4 text-blue-900">💻 Hardware</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• High-performance Windows PC or Mac</li>
                  <li>• Dual monitor setup</li>
                  <li>• Fast internet connection</li>
                  <li>• Cloud backup system</li>
                  <li>• Mobile device for field work</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold mb-4 text-green-900">📊 Core Software</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Bluebeam Revu (takeoff)</li>
                  <li>• Excel/Google Sheets</li>
                  <li>• Estimating software</li>
                  <li>• AutoCAD (submittals)</li>
                  <li>• PDF management tools</li>
                </ul>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold mb-4 text-purple-900">☁️ Cloud Services</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Roof measurement platforms</li>
                  <li>• Project bidding sites</li>
                  <li>• Cloud storage (Dropbox, Google Drive)</li>
                  <li>• Email and communication</li>
                  <li>• Project management tools</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Software Deep Dive */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Essential Software Tools
            </h2>
            <div className="space-y-8">
              {[
                {
                  category: '📐 Digital Takeoff & Measurement',
                  icon: '⚡',
                  tools: [
                    {
                      name: 'Bluebeam Revu',
                      description: 'Industry-standard PDF markup and takeoff software',
                      level: 'Essential',
                      cost: '$240/year',
                      features: ['Digital plan markup', 'Measurement tools', 'Count and area calculation', 'Collaboration features']
                    },
                    {
                      name: 'PlanSwift',
                      description: 'Alternative takeoff software popular with contractors',
                      level: 'Optional',
                      cost: '$1,895 one-time',
                      features: ['Quick area/length takeoff', 'Built-in assemblies', 'Export to Excel', 'Estimating integration']
                    },
                    {
                      name: 'On-Screen Takeoff (OST)',
                      description: 'Professional takeoff solution by STACK',
                      level: 'Optional',
                      cost: 'Custom pricing',
                      features: ['Advanced digitizing', 'Large project support', 'Multi-user collaboration', 'Database integration']
                    }
                  ]
                },
                {
                  category: '🛰️ Roof Measurement Services',
                  icon: '📏',
                  tools: [
                    {
                      name: 'EagleView',
                      description: 'Aerial measurement reports for roofing',
                      level: 'Highly Recommended',
                      cost: '$35-75/report',
                      features: ['Premium/QuickSquares reports', 'Waste calculation', 'Slope diagrams', 'Fast turnaround']
                    },
                    {
                      name: 'Pictometry (Nearmap)',
                      description: 'Aerial imagery and measurement platform',
                      level: 'Recommended',
                      cost: 'Subscription-based',
                      features: ['High-res oblique imagery', 'Measurement tools', 'Historical imagery', 'Coverage maps']
                    },
                    {
                      name: 'HoverConnect',
                      description: 'Smartphone-based measurement app',
                      level: 'Optional',
                      cost: 'Pay per report',
                      features: ['Phone-based capture', 'Quick measurements', 'Integration with contractors', 'Mobile-friendly']
                    }
                  ]
                },
                {
                  category: '💻 Estimating Software',
                  icon: '🧮',
                  tools: [
                    {
                      name: 'The Edge (Estimating Edge)',
                      description: 'Construction estimating database software',
                      level: 'Recommended',
                      cost: '$1,200-2,500/year',
                      features: ['RSMeans database', 'Assembly-based estimating', 'Bid management', 'Reporting tools']
                    },
                    {
                      name: 'AccuLynx',
                      description: 'All-in-one roofing contractor software',
                      level: 'Optional',
                      cost: '$375+/month',
                      features: ['CRM + estimating', 'Job management', 'Material ordering', 'Mobile app']
                    },
                    {
                      name: 'Kreo AI',
                      description: 'AI-powered estimating and takeoff',
                      level: 'Emerging',
                      cost: 'Custom pricing',
                      features: ['AI quantity takeoff', 'BIM integration', 'Cost estimation', 'Automated reporting']
                    },
                    {
                      name: 'Microsoft Excel',
                      description: 'Spreadsheet-based estimating (budget option)',
                      level: 'Starter',
                      cost: '$70/year (Microsoft 365)',
                      features: ['Complete control', 'Custom templates', 'Formulas and calculations', 'Universal compatibility']
                    }
                  ]
                },
                {
                  category: '📐 CAD & Design Software',
                  icon: '🎨',
                  tools: [
                    {
                      name: 'AutoCAD',
                      description: 'Professional CAD for shop drawings and submittals',
                      level: 'Recommended',
                      cost: '$1,865/year',
                      features: ['2D drafting', 'Shop drawing creation', 'DWG format standard', 'Precision drawing tools']
                    },
                    {
                      name: 'AutoCAD LT',
                      description: 'Affordable 2D-only version',
                      level: 'Budget Option',
                      cost: '$480/year',
                      features: ['2D drafting only', 'DWG compatibility', 'Basic annotation', 'Lower cost']
                    },
                    {
                      name: 'SketchUp Pro',
                      description: '3D modeling for visualization',
                      level: 'Optional',
                      cost: '$299/year',
                      features: ['3D roof modeling', 'Quick visualization', 'Easy to master', 'Presentation tools']
                    }
                  ]
                },
                {
                  category: '☁️ Project & Lead Management',
                  icon: '📋',
                  tools: [
                    {
                      name: 'BuildingConnected',
                      description: 'Free bid invitation and plan distribution',
                      level: 'Essential',
                      cost: 'Free for subs',
                      features: ['Bid invitations', 'Plan downloads', 'Bid management', 'GC network']
                    },
                    {
                      name: 'PlanHub',
                      description: 'Project leads and bidding platform',
                      level: 'Recommended',
                      cost: '$125-400/month',
                      features: ['Project leads', 'Plan access', 'Bid calendar', 'Subcontractor network']
                    },
                    {
                      name: 'Dodge Construction Network',
                      description: 'Commercial project intelligence',
                      level: 'For Growth',
                      cost: '$3,000+/year',
                      features: ['Pre-construction leads', 'Project tracking', 'Market intelligence', 'Contact database']
                    }
                  ]
                }
              ].map((category, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">{category.icon}</span>
                    <h3 className="text-2xl font-bold text-gray-900">{category.category}</h3>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.tools.map((tool, i) => (
                      <div key={i} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-gray-900">{tool.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            tool.level === 'Essential' ? 'bg-red-100 text-red-800' :
                            tool.level === 'Highly Recommended' || tool.level === 'Recommended' ? 'bg-green-100 text-green-800' :
                            tool.level === 'Emerging' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {tool.level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                        <p className="text-sm font-semibold text-blue-600 mb-3">{tool.cost}</p>
                        <ul className="space-y-1">
                          {tool.features.map((feature, j) => (
                            <li key={j} className="text-xs text-gray-700">• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
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
              Free Technology Resources
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Get started with these free guides
            </p>

            <div className="space-y-6">
              <FreeResource
                icon="💻"
                title="Technology Setup Guide (Free Sample)"
                description="Free excerpt from our complete tech setup guide covering computer specs and essential software."
                type="PDF Sample"
                href="/downloads/tech-setup-sample.pdf"
              />
              <FreeResource
                icon="📊"
                title="Software Comparison Spreadsheet"
                description="Compare features, pricing, and capabilities of all major estimating and takeoff software platforms."
                type="Excel Spreadsheet"
                href="/downloads/software-comparison.xlsx"
              />
              <FreeResource
                icon="🎥"
                title="Bluebeam Basics Video Tutorial"
                description="Free 20-minute video showing the essential Bluebeam tools for digital takeoff."
                type="Video"
                href="/resources/videos/bluebeam-basics"
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
              Master the Technology
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <ToolCard
                title="Bluebeam Mastery"
                price="$197"
                description="Complete resources on Bluebeam Revu for professional digital takeoffs and markups."
                href="/tools/bluebeam-mastery"
              />
              <ToolCard
                title="Estimating Software Tool"
                price="$297"
                description="Learn The Edge, Kreo AI, Excel estimating, and choosing the right platform."
                href="/tools/estimating-software"
              />
              <ToolCard
                title="Technology Setup Guide"
                price="$29"
                description="Complete guide to setting up your estimating technology stack on any budget."
                href="/products/tech-setup-guide"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get Access to All Technology Tools
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            BidShield Pro membership includes complete tools for Bluebeam, AutoCAD, SketchUp,
            estimating software, and all the tools professional estimators use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Join BidShield Pro - $197/mo →
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg border-2 border-blue-600"
            >
              Browse Individual Tools
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
