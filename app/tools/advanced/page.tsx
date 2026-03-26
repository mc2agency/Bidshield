import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advanced Roofing Estimating Tools — Bluebeam, SketchUp & More | BidShield',
  description: 'Master professional-grade estimating tools to compete at the highest level. Advanced Bluebeam workflows, SketchUp visualization, AutoCAD submittals, and more.',
  keywords: 'advanced roofing estimating tools, Bluebeam advanced, SketchUp roofing, AutoCAD submittals, professional estimating, commercial roofing tools',
  alternates: { canonical: 'https://www.bidshield.co/tools/advanced' },
};

export default function AdvancedToolsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-purple-400 text-blue-900 rounded-full text-sm font-bold">
              ADVANCED LEVEL
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Advanced Tools
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Master professional-grade tools and techniques to compete at the highest level.
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link href="/tools" className="px-6 py-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition-colors">
                All Tools
              </Link>
              <Link href="/tools/beginner" className="px-6 py-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition-colors">
                Beginner
              </Link>
              <Link href="/tools/intermediate" className="px-6 py-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition-colors">
                Intermediate
              </Link>
              <button className="px-6 py-2 bg-blue-700 rounded-full hover:bg-blue-600 transition-colors">
                Advanced
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Tools */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Master Professional Tools & Techniques
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These advanced tools teach professional-grade software and sophisticated estimating techniques used by industry leaders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Bluebeam Mastery */}
            <ToolCard
              title="Bluebeam Mastery"
              price="$147"
              level="Beginner to Advanced"
              duration="8 parts • 6 hours"
              icon="⚡"
              featured={true}
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

          {/* All-Access Section */}
          <div className="mt-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 lg:p-12 border-2 border-purple-200">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Looking for Complete Mastery?</h3>
              <p className="text-lg text-gray-700 mb-6">
                Get access to all beginner, intermediate, and advanced tools with BidShield Pro membership. Master every tool and technique in the industry.
              </p>
              <div className="text-5xl font-bold text-blue-600 mb-2">$197<span className="text-2xl text-gray-600">/month</span></div>
              <p className="text-gray-600 mb-8">All 7 tools + templates + live Q&A + community access</p>
              <Link
                href="/membership"
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Join BidShield Pro →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Path Suggestion */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Recommended Getting Started Path</h2>
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Start with the Basics</h3>
                  <p className="text-gray-600">Build your foundation with Estimating Essentials</p>
                  <Link href="/tools/estimating-essentials" className="text-blue-600 hover:text-blue-700 font-semibold">View Tool →</Link>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Master Digital Takeoffs</h3>
                  <p className="text-gray-600">Level up with Bluebeam Mastery (Advanced techniques)</p>
                  <Link href="/tools/bluebeam-mastery" className="text-blue-600 hover:text-blue-700 font-semibold">View Tool →</Link>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Implement Professional Software</h3>
                  <p className="text-gray-600">Complete your toolkit with Estimating Software Mastery</p>
                  <Link href="/tools/estimating-software" className="text-blue-600 hover:text-blue-700 font-semibold">View Tool →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Back to All */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/tools" className="text-blue-600 hover:text-blue-700 font-semibold text-lg">
            ← View All Tools
          </Link>
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
  productKey?: string;
  featured?: boolean;
}

function ToolCard({ title, price, level, duration, icon, whatYoullGet, includes, href, productKey, featured = false }: ToolCardProps) {
  return (
    <div className={`group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 ${featured ? 'border-purple-500' : 'border-transparent hover:border-blue-300'}`}>
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-500 text-white text-sm font-bold rounded-full">
          ADVANCED
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">{icon}</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{price}</div>
          <div className="text-sm text-gray-500 mb-1">{duration}</div>
          <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
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
