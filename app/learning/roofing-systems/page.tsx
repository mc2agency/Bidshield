'use client';

import Link from 'next/link';

const roofingSystems = [
  {
    id: 'asphalt-shingle',
    title: 'Asphalt Shingle',
    description: 'Most common residential roofing. 3-tab and architectural shingles.',
    href: '/learning/roofing-systems/shingle',
    icon: '🏠',
    comingSoon: false
  },
  {
    id: 'single-ply',
    title: 'TPO/PVC/EPDM',
    description: 'Single-ply membrane systems for commercial flat roofs.',
    href: '/learning/roofing-systems/tpo-pvc-epdm',
    icon: '🏢',
    comingSoon: false
  },
  {
    id: 'modified-bitumen',
    title: 'SBS Modified Bitumen',
    description: 'Torch-applied and self-adhered modified bitumen systems.',
    href: '/learning/roofing-systems/sbs',
    icon: '🔥',
    comingSoon: false
  },
  {
    id: 'metal',
    title: 'Metal Roofing',
    description: 'Standing seam, corrugated, and metal shingle systems.',
    href: '/learning/roofing-systems/metal',
    icon: '⚡',
    comingSoon: false
  },
  {
    id: 'tile',
    title: 'Tile Roofing',
    description: 'Clay and concrete tile roofing for residential and commercial.',
    href: '/learning/roofing-systems/tile',
    icon: '🏛️',
    comingSoon: false
  },
  {
    id: 'green-roof',
    title: 'Green Roofs',
    description: 'Vegetated roof systems with multiple layers and drainage.',
    href: '/learning/roofing-systems/green-roof',
    icon: '🌱',
    comingSoon: false
  },
  {
    id: 'restoration',
    title: 'Restoration/Coating',
    description: 'Roof coatings, restoration, and maintenance systems.',
    href: '/learning/roofing-systems/restoration-coating',
    icon: '🔧',
    comingSoon: false
  },
  {
    id: 'spray-foam',
    title: 'Spray Foam Insulation',
    description: 'Spray polyurethane foam roofing and insulation systems.',
    href: '/learning/roofing-systems/spray-foam',
    icon: '🧪',
    comingSoon: false
  }
];

export default function RoofingSystemsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/learning" className="inline-flex items-center text-blue-200 hover:text-white mb-4 text-sm">
            ← Back to Learning Center
          </Link>
          <div className="inline-block mb-4 px-4 py-2 bg-blue-700/50 rounded-full text-sm font-semibold">
            Free Learning Resource
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Roofing Systems Guide
          </h1>
          <p className="text-xl text-blue-100">
            Complete overview of all major roofing systems, materials, and installation methods for residential and commercial applications.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Understanding Roofing Systems</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Each roofing system has unique materials, installation methods, labor requirements, and cost considerations. As an estimator, understanding the nuances of each system is critical to creating accurate bids that protect your profit margins while remaining competitive.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            This guide breaks down the 7 major roofing system types you'll encounter in commercial and residential construction. Click on any system below to dive deep into material calculations, labor considerations, common mistakes, and estimating best practices.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Pro Tip:</strong> Most roofing contractors specialize in 2-3 systems rather than trying to be experts in all. Choose systems that match your market demand and crew expertise.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Systems Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {roofingSystems.map((system) => (
            <div key={system.id} className="relative">
              <Link
                href={system.comingSoon ? '#' : system.href}
                className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow h-full ${
                  system.comingSoon ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105 transition-transform'
                }`}
                onClick={(e) => system.comingSoon && e.preventDefault()}
              >
                <div className="p-6">
                  <div className="text-4xl mb-4">{system.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{system.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{system.description}</p>
                  {system.comingSoon ? (
                    <span className="inline-block px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-blue-600 font-semibold text-sm">
                      Learn More →
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Quick Comparison Table */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick System Comparison</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best For</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lifespan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/SF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Labor Level</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Asphalt Shingle</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Residential sloped roofs</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">15-30 years</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$3-$6</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Moderate</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">TPO/PVC/EPDM</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Commercial flat roofs</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">20-30 years</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$5-$10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Moderate-High</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Modified Bitumen</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Small commercial, additions</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">15-20 years</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$4-$8</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">High</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Metal Roofing</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Commercial/industrial sloped</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">30-50 years</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$7-$15</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">High</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tile Roofing</td>
                  <td className="px-6 py-4 text-sm text-gray-600">High-end residential</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">50-100 years</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$10-$20</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Very High</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Green Roof</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Commercial, LEED projects</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">20-40 years</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$15-$30</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Very High</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Restoration/Coating</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Existing roof extension</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">10-15 years</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$2-$6</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Moderate</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Estimating Considerations */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Estimating Considerations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-gray-900 mb-2">Roof Slope & Pitch</h3>
              <p className="text-sm text-gray-700">
                Slope affects material waste, labor hours, and safety requirements. Always apply appropriate pitch multipliers to square footage calculations.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-gray-900 mb-2">Substrate Conditions</h3>
              <p className="text-sm text-gray-700">
                Existing deck type (wood, concrete, steel) impacts fastener selection, attachment methods, and labor requirements.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-gray-900 mb-2">Waste Factors</h3>
              <p className="text-sm text-gray-700">
                Complex roof shapes require higher waste factors. Typical: 10-15% for simple roofs, 15-25% for complex configurations.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-gray-900 mb-2">Warranty Requirements</h3>
              <p className="text-sm text-gray-700">
                Manufacturer warranties often dictate specific installation methods, minimum insulation R-values, and approved accessories.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Get Complete Estimating Templates for All 5 Major Systems
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Ready-to-use Excel templates with material calculators, labor estimators, waste factors, and pricing breakdowns for Asphalt Shingle, Single-Ply, Modified Bitumen, Metal, and Tile roofing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
              <div className="text-3xl font-bold text-blue-600">$129</div>
              <div className="text-gray-500">All 5 Templates Bundle</div>
            </div>
            <Link
              href="/products/template-bundle"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg mb-3"
            >
              Get Template Bundle →
            </Link>
            <p className="text-sm text-gray-500">Individual templates available for $39 each</p>
          </div>
        </div>
      </div>
    </main>
  );
}
