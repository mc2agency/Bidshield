import Link from 'next/link';

export const metadata = {
  title: 'Standing Seam Metal Roofing Guide [2025]: Costs, Types & Installation',
  description: 'Complete guide to standing seam metal roofing. Learn about panel types, costs, installation methods, and how to estimate metal roofing projects accurately.',
};

export default function StandingSeamMetalRoofingArticle() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/blog" className="text-blue-300 hover:text-white transition-colors">
              ← Back to Blog
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm mb-4">
            <span className="px-3 py-1 bg-blue-700 rounded-full">Roofing Systems</span>
            <span>December 14, 2025</span>
            <span>15 min read</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Standing Seam Metal Roofing Guide: Complete Overview for 2025
          </h1>
          <p className="text-xl text-blue-100">
            Everything you need to know about standing seam metal roofing: panel types, costs, installation methods, and how to accurately estimate metal roofing projects.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
              MC
            </div>
            <div>
              <div className="font-semibold">MC2 Estimating</div>
              <div className="text-sm text-blue-200">Professional Estimating Tools</div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Table of Contents */}
        <div className="bg-gray-50 rounded-xl p-6 mb-12 border-l-4 border-blue-600">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Table of Contents</h2>
          <ul className="space-y-2 text-gray-700">
            <li><a href="#what-is-standing-seam" className="hover:text-blue-600 transition-colors">What is Standing Seam Metal Roofing?</a></li>
            <li><a href="#panel-types" className="hover:text-blue-600 transition-colors">Panel Types and Profiles</a></li>
            <li><a href="#materials" className="hover:text-blue-600 transition-colors">Material Options</a></li>
            <li><a href="#installation-methods" className="hover:text-blue-600 transition-colors">Installation Methods</a></li>
            <li><a href="#cost-breakdown" className="hover:text-blue-600 transition-colors">Cost Breakdown</a></li>
            <li><a href="#advantages" className="hover:text-blue-600 transition-colors">Advantages & Disadvantages</a></li>
            <li><a href="#estimating-guide" className="hover:text-blue-600 transition-colors">How to Estimate Metal Roofing</a></li>
          </ul>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
            <p className="text-gray-800 font-semibold mb-2">Quick Summary:</p>
            <p className="text-gray-700">
              Standing seam metal roofing is a premium roofing system featuring vertical panels with raised seams. It offers 40-70 year lifespan, excellent weather resistance, and modern aesthetics. Typical cost: $8-16 per square foot installed.
            </p>
          </div>

          <h2 id="what-is-standing-seam" className="text-3xl font-bold text-gray-900 mb-4 mt-12">What is Standing Seam Metal Roofing?</h2>
          <p className="text-gray-700 mb-6">
            <strong>Standing seam metal roofing</strong> is a type of metal roofing system where the panels are joined together with vertical seams that stand above the flat surface of the roof. The seams are either mechanically seamed (crimped) or snap-together, creating a watertight connection without exposed fasteners.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Key Characteristics</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Concealed Fasteners:</strong> Clips attach panels to roof deck, hidden under panel seams</li>
            <li><strong>Vertical Seams:</strong> Raised seams (typically 1-2" tall) run from eave to ridge</li>
            <li><strong>Panel Movement:</strong> Panels can expand/contract with temperature changes</li>
            <li><strong>Water Shedding:</strong> Vertical design sheds water efficiently</li>
            <li><strong>Long Panels:</strong> Continuous panels from eave to ridge (no horizontal seams)</li>
          </ul>

          <h2 id="panel-types" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Panel Types and Profiles</h2>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Snap-Lock (Snap-Together)</h3>
          <p className="text-gray-700 mb-4">
            <strong>How it works:</strong> Male and female edges snap together without tools
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Seam Height:</strong> 1-1.5"</li>
            <li><strong>Installation:</strong> Fastest, easiest for DIY</li>
            <li><strong>Cost:</strong> $6-10/sq ft installed</li>
            <li><strong>Best For:</strong> Residential, lower slopes (3:12 minimum)</li>
            <li><strong>Pros:</strong> Fast installation, no special tools</li>
            <li><strong>Cons:</strong> Less wind resistance than mechanical seam</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Mechanical Lock (Crimped Seam)</h3>
          <p className="text-gray-700 mb-4">
            <strong>How it works:</strong> Panels crimped together with mechanical seamer
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Seam Height:</strong> 1.5-2"</li>
            <li><strong>Installation:</strong> Requires special seaming equipment</li>
            <li><strong>Cost:</strong> $8-14/sq ft installed</li>
            <li><strong>Best For:</strong> Commercial, high wind areas</li>
            <li><strong>Pros:</strong> Strongest weatherproofing, highest wind resistance</li>
            <li><strong>Cons:</strong> Slower installation, requires skilled labor</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Common Panel Widths</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>12" panels:</strong> Most common residential</li>
            <li><strong>16" panels:</strong> Popular commercial width</li>
            <li><strong>18" panels:</strong> Large commercial projects</li>
            <li><strong>24" panels:</strong> Industrial applications</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 my-8">
            <p className="text-gray-800 font-semibold mb-2">Coverage vs. Flat Width:</p>
            <p className="text-gray-700">
              A "16-inch panel" has 16" coverage but 18-19" flat width due to the laps and seams. Always confirm if dimensions refer to coverage or flat width when ordering.
            </p>
          </div>

          <h2 id="materials" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Material Options</h2>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Galvalume (Aluminum-Zinc Coated Steel)</h3>
          <p className="text-gray-700 mb-4">
            <strong>Most popular choice</strong> - 55% aluminum, 43.4% zinc, 1.6% silicon coating over steel
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Cost:</strong> $$ (mid-range)</li>
            <li><strong>Lifespan:</strong> 40-60 years</li>
            <li><strong>Gauges:</strong> 22, 24, 26 gauge (thinner = higher number)</li>
            <li><strong>Finish Options:</strong> Bare Galvalume or painted (Kynar/PVDF)</li>
            <li><strong>Pros:</strong> Best value, excellent corrosion resistance, paint adheres well</li>
            <li><strong>Cons:</strong> Will corrode in salt spray areas without proper coating</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Aluminum</h3>
          <p className="text-gray-700 mb-4">
            <strong>Best for coastal areas</strong> - Won't rust even in salt spray
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Cost:</strong> $$$ (higher than steel)</li>
            <li><strong>Lifespan:</strong> 50+ years</li>
            <li><strong>Gauges:</strong> .032", .040", .050" thickness</li>
            <li><strong>Pros:</strong> Won't rust, lightweight, excellent coastal performance</li>
            <li><strong>Cons:</strong> More expensive, dents easier than steel, oil-canning visible</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Copper</h3>
          <p className="text-gray-700 mb-4">
            <strong>Premium architectural choice</strong> - Develops natural patina over time
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Cost:</strong> $$$$ (most expensive)</li>
            <li><strong>Lifespan:</strong> 70+ years</li>
            <li><strong>Weight:</strong> 16 oz or 20 oz copper</li>
            <li><strong>Pros:</strong> Extremely long life, beautiful patina, no painting needed</li>
            <li><strong>Cons:</strong> Very expensive, requires specialty installers, can stain adjacent materials</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Zinc</h3>
          <p className="text-gray-700 mb-4">
            <strong>European favorite</strong> - Self-healing patina
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Cost:</strong> $$$$</li>
            <li><strong>Lifespan:</strong> 60-100+ years</li>
            <li><strong>Pros:</strong> Self-healing scratches, beautiful appearance, extremely long life</li>
            <li><strong>Cons:</strong> Expensive, limited availability in US, requires experienced installers</li>
          </ul>

          <h2 id="installation-methods" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Installation Methods</h2>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Fixed vs. Floating Clip Systems</h3>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6">
              <h4 className="font-bold text-blue-900 mb-4">Fixed Clips</h4>
              <p className="text-gray-700 mb-3">Clips are screwed directly through panel into deck</p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                <li>Less expensive</li>
                <li>Panels can't move with temperature</li>
                <li>Risk of oil-canning</li>
                <li>Best for short runs (under 30 ft)</li>
                <li>Common on residential</li>
              </ul>
            </div>

            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
              <h4 className="font-bold text-green-900 mb-4">Floating Clips</h4>
              <p className="text-gray-700 mb-3">Clips allow panels to expand/contract</p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                <li>More expensive</li>
                <li>Panels move freely</li>
                <li>Less oil-canning</li>
                <li>Required for long runs (30+ ft)</li>
                <li>Standard on commercial</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Substrate Requirements</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Over Solid Deck:</strong> Most common - install over plywood/OSB with underlayment</li>
            <li><strong>Over Open Purlins:</strong> Commercial - panels span between purlins (no deck)</li>
            <li><strong>Over Existing Roof:</strong> Retrofit - can install over shingles with proper separation</li>
          </ul>

          <h2 id="cost-breakdown" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Detailed Cost Breakdown (2025)</h2>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Material Costs (Per Square Foot)</h3>

          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Material</th>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Panel Cost</th>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Total Installed</th>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Lifespan</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">Galvalume Bare (26ga)</td>
                  <td className="px-6 py-3 border-b">$2.50-4.00</td>
                  <td className="px-6 py-3 border-b font-semibold">$6-9/sq ft</td>
                  <td className="px-6 py-3 border-b">40-50 years</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-yellow-50">
                  <td className="px-6 py-3 border-b">Galvalume Painted (24ga)</td>
                  <td className="px-6 py-3 border-b">$3.50-5.50</td>
                  <td className="px-6 py-3 border-b font-semibold">$8-12/sq ft</td>
                  <td className="px-6 py-3 border-b">40-60 years</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">Aluminum (.040")</td>
                  <td className="px-6 py-3 border-b">$4.00-6.50</td>
                  <td className="px-6 py-3 border-b font-semibold">$9-14/sq ft</td>
                  <td className="px-6 py-3 border-b">50+ years</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">Copper (16oz)</td>
                  <td className="px-6 py-3 border-b">$12-18</td>
                  <td className="px-6 py-3 border-b font-semibold">$18-30/sq ft</td>
                  <td className="px-6 py-3 border-b">70+ years</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">Zinc</td>
                  <td className="px-6 py-3 border-b">$10-15</td>
                  <td className="px-6 py-3 border-b font-semibold">$16-25/sq ft</td>
                  <td className="px-6 py-3 border-b">60-100 years</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Example: 2,500 sq ft Residential Roof</h3>

          <div className="bg-gray-50 rounded-xl p-8 mb-8 border-2 border-gray-300">
            <h4 className="font-semibold text-gray-900 mb-4">24ga Painted Galvalume, Snap-Lock, 6:12 Pitch</h4>

            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between border-b pb-2">
                <span>Panels (2,500 sq ft × $4.00)</span>
                <span className="font-semibold">$10,000</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Clips & Fasteners</span>
                <span className="font-semibold">$1,500</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Underlayment (synthetic)</span>
                <span className="font-semibold">$1,000</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Ridge Cap, Eave Trim, Rake Trim</span>
                <span className="font-semibold">$2,500</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Labor (2,500 × $3.50)</span>
                <span className="font-semibold">$8,750</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Tear-off Shingles</span>
                <span className="font-semibold">$2,000</span>
              </div>
              <div className="flex justify-between border-b-2 border-gray-900 pb-2 font-semibold text-lg">
                <span>Total Project Cost</span>
                <span>$25,750</span>
              </div>
              <div className="flex justify-between text-blue-600 font-bold text-xl pt-2">
                <span>Cost Per Square Foot</span>
                <span>$10.30</span>
              </div>
            </div>
          </div>

          <h2 id="advantages" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Advantages & Disadvantages</h2>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Advantages</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Longevity:</strong> 40-70+ year lifespan (2-3x longer than asphalt shingles)</li>
            <li><strong>No Exposed Fasteners:</strong> Fewer leak points, cleaner aesthetic</li>
            <li><strong>Weather Resistance:</strong> Excellent wind, hail, and fire resistance</li>
            <li><strong>Energy Efficiency:</strong> Reflective surfaces reduce cooling costs 10-25%</li>
            <li><strong>Low Maintenance:</strong> Virtually maintenance-free</li>
            <li><strong>Resale Value:</strong> Increases property value</li>
            <li><strong>Recyclable:</strong> 100% recyclable at end of life</li>
            <li><strong>Modern Aesthetic:</strong> Clean, contemporary appearance</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Disadvantages</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>High Initial Cost:</strong> 2-3x more than asphalt shingles</li>
            <li><strong>Noise:</strong> Can be noisy during rain (insulation helps)</li>
            <li><strong>Denting:</strong> Susceptible to dents from hail or falling branches</li>
            <li><strong>Oil-Canning:</strong> Visible waviness in panels (aesthetic, not structural)</li>
            <li><strong>Specialized Installation:</strong> Requires experienced installers</li>
            <li><strong>Expansion/Contraction:</strong> Panels move with temperature (normal but can be noisy)</li>
            <li><strong>Limited Color Selection:</strong> Fewer colors than shingles</li>
          </ul>

          <h2 id="estimating-guide" className="text-3xl font-bold text-gray-900 mb-4 mt-12">How to Estimate Metal Roofing Projects</h2>

          <div className="bg-gray-50 rounded-xl p-8 mb-8 border-2 border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Step-by-Step Estimating Process</h3>

            <ol className="list-decimal pl-6 space-y-4 text-gray-700">
              <li>
                <strong>Measure Roof Area (Apply Pitch Multiplier)</strong>
                <p className="mt-1">Don't forget pitch multiplier - metal goes on sloped surface, not horizontal footprint</p>
              </li>
              <li>
                <strong>Calculate Panel Quantity</strong>
                <p className="mt-1">Divide roof width by panel coverage (not flat width). Add 10% waste for cuts and mistakes</p>
              </li>
              <li>
                <strong>Calculate Linear Trim</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Eave trim: length of eave</li>
                  <li>Rake trim: length of rakes (both sides)</li>
                  <li>Ridge cap: length of ridge + hips</li>
                  <li>Valley: length of valleys</li>
                  <li>Wall flashing: where roof meets walls</li>
                </ul>
              </li>
              <li>
                <strong>Calculate Clips & Fasteners</strong>
                <p className="mt-1">Typical: 24-30 clips per square. Confirm manufacturer requirements for wind zone</p>
              </li>
              <li>
                <strong>Add Underlayment</strong>
                <p className="mt-1">Synthetic underlayment: 10 squares per roll. Add 10% for laps</p>
              </li>
              <li>
                <strong>Calculate Labor</strong>
                <p className="mt-1">Residential: 1-1.5 squares per installer per day. Commercial: 1.5-2.5 squares/day</p>
              </li>
              <li>
                <strong>Add Tear-Off (if applicable)</strong>
                <p className="mt-1">$1-2 per sq ft for shingle removal</p>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 my-8">
            <p className="text-gray-800 font-semibold mb-2">Panel Length Consideration:</p>
            <p className="text-gray-700">
              Standing seam panels are typically ordered to exact length (eave to ridge). Confirm maximum shipping length (often 40-50 ft). Longer panels may require field splicing or multiple pieces.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-8 mt-12 mb-12">
          <h3 className="text-2xl font-bold mb-3">Master Metal Roofing Estimating</h3>
          <p className="text-blue-100 mb-6 text-lg">
            Learn how to estimate, specify, and install standing seam metal roofing. Our Metal Roofing tool includes panel calculations, trim takeoff, and installation details.
          </p>
          <Link
            href="/tools/metal-roofing"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Metal Roofing Tool - $147 →
          </Link>
          <p className="text-sm text-blue-200 mt-3">Includes material calculators, trim details, and installation guides</p>
        </div>

        {/* Related Posts */}
        <div className="border-t border-gray-200 pt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/blog/tpo-vs-pvc-vs-epdm" className="group block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                TPO vs PVC vs EPDM Comparison
              </h4>
              <p className="text-gray-600 text-sm">Complete guide to single-ply roofing systems.</p>
            </Link>
            <Link href="/blog/how-to-calculate-roof-pitch" className="group block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                How to Calculate Roof Pitch
              </h4>
              <p className="text-gray-600 text-sm">Master pitch multipliers for accurate metal roof measurements.</p>
            </Link>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-semibold">Share this article:</span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Twitter
            </button>
            <button className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors">
              LinkedIn
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Email
            </button>
          </div>
        </div>

        {/* Comments Placeholder */}
        <div className="border-t border-gray-200 pt-12 mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments</h3>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">Comments are coming soon! For now, share your questions in our community.</p>
            <Link href="/membership" className="inline-block mt-4 text-blue-600 font-semibold hover:text-blue-700">
              Join MC2 Pro Community →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
