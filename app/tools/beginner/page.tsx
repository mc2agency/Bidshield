import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beginner Roofing Estimating Tools — Start Here | BidShield',
  description: 'New to commercial roofing estimating? Start with the fundamentals — estimating essentials, measurement basics, and the core workflow every estimator needs to know.',
  keywords: 'beginner roofing estimating, estimating fundamentals, roofing estimator resources, commercial roofing estimating tools, commercial roofing basics',
  alternates: { canonical: 'https://www.bidshield.co/tools/beginner' },
};

export default function BeginnerToolsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-green-500 rounded-full text-sm font-bold">
              BEGINNER FRIENDLY
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Beginner Tools
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Start your estimating career with these beginner-friendly tools. No prior experience required.
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link href="/tools" className="px-6 py-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition-colors">
                All Tools
              </Link>
              <button className="px-6 py-2 bg-blue-700 rounded-full hover:bg-blue-600 transition-colors">
                Beginner
              </button>
              <Link href="/tools/intermediate" className="px-6 py-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition-colors">
                Intermediate
              </Link>
              <Link href="/tools/advanced" className="px-6 py-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition-colors">
                Advanced
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Beginner Tools */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perfect for Getting Started
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These tools are designed for beginners with no prior estimating experience. Start building your foundation today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Estimating Essentials */}
            <ToolCard
              title="Estimating Essentials"
              price="$497"
              level="Beginner to Intermediate"
              duration="8 parts • 12+ hours"
              icon="🧮"
              featured={true}
              whatYoullGet={[
                "Reading construction specifications",
                "Multi-discipline plan coordination",
                "Digital takeoff with Bluebeam basics",
                "Material pricing and waste factors",
                "Labor burden calculations",
                "General conditions breakdown"
              ]}
              includes={[
                "All 5 roofing system templates",
                "Complete estimating checklist",
                "Practice drawing sets",
                "Proof of completion"
              ]}
              href="/tools/estimating-essentials"
            />

            {/* Bluebeam Mastery */}
            <ToolCard
              title="Bluebeam Mastery"
              price="$147"
              level="Beginner to Advanced"
              duration="8 parts • 6 hours"
              icon="⚡"
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

            {/* SketchUp Visualization */}
            <ToolCard
              title="SketchUp Visualization"
              price="$97"
              level="Beginner"
              duration="5 parts • 4 hours"
              icon="🎨"
              whatYoullGet={[
                "SketchUp basics (Free vs Pro)",
                "3D roof modeling techniques",
                "Material textures and rendering",
                "Creating client presentations",
                "Before/after visualizations"
              ]}
              includes={[
                "Sample roof models",
                "Material texture library",
                "Presentation templates",
                "Export settings guide"
              ]}
              href="/tools/sketchup-visualization"
            />

            {/* Measurement Technology */}
            <ToolCard
              title="Measurement Technology"
              price="$97"
              level="Beginner"
              duration="4 parts • 3 hours"
              icon="📏"
              whatYoullGet={[
                "Pictometry detailed tutorial",
                "EagleView platform mastery",
                "Nearmap and alternative tools",
                "Google Earth measurements (free)",
                "Aerial vs manual methods comparison"
              ]}
              includes={[
                "Measurement worksheet templates",
                "Pitch multiplier charts",
                "Accuracy verification checklist",
                "Tool comparison matrix"
              ]}
              href="/tools/measurement-technology"
            />
          </div>
        </div>
      </section>

      {/* Ready for Intermediate */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for Intermediate Tools?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Once you've mastered the basics, explore our intermediate tools to level up your skills.
          </p>
          <Link
            href="/tools/intermediate"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View Intermediate Tools →
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
    <div className={`group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 ${featured ? 'border-blue-500' : 'border-transparent hover:border-blue-300'}`}>
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
          BEST FOR BEGINNERS
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">{icon}</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{price}</div>
          <div className="text-sm text-gray-500 mb-1">{duration}</div>
          <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
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
