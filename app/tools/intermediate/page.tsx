import Link from 'next/link';

export default function IntermediateToolsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-yellow-400 text-blue-900 rounded-full text-sm font-bold">
              INTERMEDIATE LEVEL
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Intermediate Tools
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Level up your estimating skills with advanced techniques and specialized tools.
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link href="/tools" className="px-6 py-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition-colors">
                All Tools
              </Link>
              <Link href="/tools/beginner" className="px-6 py-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition-colors">
                Beginner
              </Link>
              <button className="px-6 py-2 bg-blue-700 rounded-full hover:bg-blue-600 transition-colors">
                Intermediate
              </button>
              <Link href="/tools/advanced" className="px-6 py-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition-colors">
                Advanced
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intermediate Tools */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Take Your Skills to the Next Level
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These tools build on fundamental knowledge and teach specialized skills for professional estimators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AutoCAD for Submittals */}
            <ToolCard
              title="AutoCAD for Submittals"
              price="$247"
              level="Intermediate"
              duration="6 parts • 8 hours"
              icon="📐"
              productKey="autocadSubmittals"
              whatYoullGet={[
                "AutoCAD basics for contractors",
                "Reading CAD drawings",
                "Creating professional shop drawings",
                "Sheet metal detail sections",
                "Submittal package creation"
              ]}
              includes={[
                "AutoCAD template files",
                "Sample shop drawings",
                "Detail library",
                "Alternative tools guide"
              ]}
              href="/tools/autocad-submittals"
            />

            {/* Construction Submittals */}
            <ToolCard
              title="Construction Submittals"
              price="$197"
              level="Intermediate"
              duration="8 parts • 6 hours"
              icon="📊"
              productKey="constructionSubmittals"
              whatYoullGet={[
                "Reading submittal requirements in specs",
                "Organizing submittal packages",
                "Collecting product data sheets",
                "Handling reviews and resubmittals",
                "Closeout document preparation"
              ]}
              includes={[
                "Submittal cover sheet templates",
                "Product data checklist",
                "Submittal log spreadsheet",
                "Sample submittal packages"
              ]}
              href="/tools/construction-submittals"
            />

            {/* Estimating Software Mastery */}
            <ToolCard
              title="Estimating Software Mastery"
              price="$197"
              level="Intermediate to Advanced"
              duration="6 parts • 7 hours"
              icon="💻"
              productKey="estimatingSoftware"
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

            {/* Estimating Essentials - Also suitable for intermediate */}
            <ToolCard
              title="Estimating Essentials"
              price="$497"
              level="Beginner to Intermediate"
              duration="8 parts • 12+ hours"
              icon="🧮"
              featured={true}
              productKey="estimatingEssentials"
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
          </div>
        </div>
      </section>

      {/* Ready for Advanced */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Master Advanced Tools?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Take your expertise to the professional level with our advanced software tools.
          </p>
          <Link
            href="/tools/advanced"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View Advanced Tools →
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
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-blue-900 text-sm font-bold rounded-full">
          POPULAR CHOICE
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">{icon}</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{price}</div>
          <div className="text-sm text-gray-500 mb-1">{duration}</div>
          <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
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
