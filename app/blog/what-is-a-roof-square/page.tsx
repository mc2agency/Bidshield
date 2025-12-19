import Link from 'next/link';

export const metadata = {
  title: 'What is a Roof Square? Complete Guide to Roofing Measurements [2025] | MC2 Estimating',
  description: 'Learn what a roof square is, how to calculate roof squares, and why this measurement matters for roofing estimates. Includes calculators and conversion charts.',
};

export default function WhatIsRoofSquareArticle() {
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
            <span className="px-3 py-1 bg-blue-700 rounded-full">Estimation</span>
            <span>December 14, 2025</span>
            <span>10 min read</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            What is a Roof Square? Complete Guide to Roofing Measurements
          </h1>
          <p className="text-xl text-blue-100">
            Learn what a roof square is, how to calculate roof squares from square feet, and why this measurement is the foundation of roofing estimates. Includes conversion charts and calculators.
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
            <li><a href="#definition" className="hover:text-blue-600 transition-colors">What is a Roof Square?</a></li>
            <li><a href="#why-squares" className="hover:text-blue-600 transition-colors">Why Roofers Use Squares Instead of Square Feet</a></li>
            <li><a href="#calculation" className="hover:text-blue-600 transition-colors">How to Calculate Roof Squares</a></li>
            <li><a href="#conversion-chart" className="hover:text-blue-600 transition-colors">Square Feet to Squares Conversion Chart</a></li>
            <li><a href="#material-coverage" className="hover:text-blue-600 transition-colors">Material Coverage Per Square</a></li>
            <li><a href="#common-mistakes" className="hover:text-blue-600 transition-colors">Common Mistakes to Avoid</a></li>
          </ul>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
            <p className="text-gray-800 font-semibold mb-2">Quick Answer:</p>
            <p className="text-gray-700">
              A <strong>roof square</strong> equals exactly 100 square feet of roof area. It's the standard unit of measurement in the roofing industry. To calculate: divide total square feet by 100. Example: 2,400 sq ft ÷ 100 = 24 squares.
            </p>
          </div>

          <h2 id="definition" className="text-3xl font-bold text-gray-900 mb-4 mt-12">What is a Roof Square?</h2>
          <p className="text-gray-700 mb-6">
            In roofing, a <strong>square</strong> is a unit of measurement that represents <strong>100 square feet</strong> of roof surface area. This is the universal standard used by roofers, suppliers, and manufacturers across North America.
          </p>
          <p className="text-gray-700 mb-6">
            The term comes from the fact that 100 square feet equals a 10-foot by 10-foot square area, though the actual roof area doesn't need to be square in shape.
          </p>

          <div className="bg-gray-100 rounded-xl p-8 mb-8 text-center">
            <p className="text-gray-600 mb-2">Visual Representation:</p>
            <div className="bg-white inline-block p-8 rounded-lg border-4 border-blue-600">
              <p className="text-6xl font-bold text-blue-600 mb-2">10'</p>
              <p className="text-gray-700 mb-4">×</p>
              <p className="text-6xl font-bold text-blue-600 mb-4">10'</p>
              <p className="text-2xl font-bold text-gray-900">=</p>
              <p className="text-4xl font-bold text-green-600 mt-4">1 Square</p>
              <p className="text-gray-600 mt-2">(100 sq ft)</p>
            </div>
          </div>

          <h2 id="why-squares" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Why Roofers Use Squares Instead of Square Feet</h2>
          <p className="text-gray-700 mb-6">
            The roofing industry adopted "squares" as the standard measurement for several practical reasons:
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">1. Simpler Communication</h3>
          <p className="text-gray-700 mb-6">
            It's easier to say "a 24-square roof" than "a 2,400 square foot roof." The smaller numbers reduce errors in verbal communication and estimates.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">2. Material Packaging Standards</h3>
          <p className="text-gray-700 mb-6">
            Most roofing materials are packaged and priced per square:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Asphalt Shingles:</strong> 3 bundles = 1 square (covers 100 sq ft)</li>
            <li><strong>Metal Panels:</strong> Sold per square of coverage</li>
            <li><strong>Single-Ply Membrane:</strong> Priced per square</li>
            <li><strong>Built-Up Roofing:</strong> Labor and materials calculated per square</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">3. Labor Estimation</h3>
          <p className="text-gray-700 mb-6">
            Production rates are measured in squares per day. For example: "Our crew can install 15 squares of shingles per day" is easier than saying "1,500 square feet per day."
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">4. Industry Pricing Standards</h3>
          <p className="text-gray-700 mb-6">
            Contractors price their work per square ($350 per square, $500 per square, etc.), making quotes easier to compare and understand.
          </p>

          <h2 id="calculation" className="text-3xl font-bold text-gray-900 mb-4 mt-12">How to Calculate Roof Squares</h2>

          <div className="bg-gray-50 rounded-xl p-8 mb-8 border-2 border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6">The Formula</h3>
            <div className="bg-white rounded-lg p-6 mb-6 border-2 border-blue-500">
              <p className="text-center text-2xl font-bold text-gray-900 mb-2">Roof Squares = Total Square Feet ÷ 100</p>
              <p className="text-center text-gray-600">Or inversely:</p>
              <p className="text-center text-2xl font-bold text-gray-900 mt-2">Square Feet = Squares × 100</p>
            </div>

            <h4 className="font-semibold text-gray-900 mb-3">Step-by-Step Process:</h4>
            <ol className="list-decimal pl-6 space-y-3 text-gray-700">
              <li>
                <strong>Measure the roof area in square feet</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Use aerial measurement reports (EagleView, Pictometry)</li>
                  <li>Or calculate from plans: Length × Width for each roof plane</li>
                  <li>Don't forget to apply pitch multiplier for sloped roofs</li>
                </ul>
              </li>
              <li>
                <strong>Divide by 100</strong>
                <p className="mt-2">Total square feet ÷ 100 = Number of squares</p>
              </li>
              <li>
                <strong>Round appropriately</strong>
                <p className="mt-2">Round to nearest 0.1 square for estimates (e.g., 24.7 squares)</p>
              </li>
            </ol>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Example Calculations</h3>

          <div className="space-y-6 mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6">
              <p className="font-semibold text-gray-900 mb-2">Example 1: Simple Flat Roof</p>
              <p className="text-gray-700 mb-2">Building: 50 ft × 80 ft flat roof</p>
              <p className="text-gray-700 mb-2">Calculation: 50 × 80 = 4,000 sq ft</p>
              <p className="text-gray-700 mb-2">Convert to squares: 4,000 ÷ 100 = <strong>40 squares</strong></p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-6">
              <p className="font-semibold text-gray-900 mb-2">Example 2: Sloped Residential Roof</p>
              <p className="text-gray-700 mb-2">Building footprint: 1,800 sq ft</p>
              <p className="text-gray-700 mb-2">Roof pitch: 6:12 (multiplier 1.118)</p>
              <p className="text-gray-700 mb-2">Calculation: 1,800 × 1.118 = 2,012 sq ft</p>
              <p className="text-gray-700 mb-2">Convert to squares: 2,012 ÷ 100 = <strong>20.1 squares</strong></p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6">
              <p className="font-semibold text-gray-900 mb-2">Example 3: Complex Multi-Plane Roof</p>
              <p className="text-gray-700 mb-2">Main roof: 1,500 sq ft (6:12 pitch) = 1,500 × 1.118 = 1,677 sq ft</p>
              <p className="text-gray-700 mb-2">Garage: 600 sq ft (4:12 pitch) = 600 × 1.054 = 632 sq ft</p>
              <p className="text-gray-700 mb-2">Porch: 200 sq ft (3:12 pitch) = 200 × 1.031 = 206 sq ft</p>
              <p className="text-gray-700 mb-2">Total: 1,677 + 632 + 206 = 2,515 sq ft</p>
              <p className="text-gray-700 mb-2">Convert to squares: 2,515 ÷ 100 = <strong>25.2 squares</strong></p>
            </div>
          </div>

          <h2 id="conversion-chart" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Square Feet to Squares Conversion Chart</h2>
          <p className="text-gray-700 mb-6">
            Use this quick reference chart for common roof sizes:
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Square Feet</th>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Squares</th>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Typical Building Size</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">500 sq ft</td>
                  <td className="px-6 py-3 border-b font-semibold">5 squares</td>
                  <td className="px-6 py-3 border-b">Small garage</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">1,000 sq ft</td>
                  <td className="px-6 py-3 border-b font-semibold">10 squares</td>
                  <td className="px-6 py-3 border-b">Large garage, small house</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">1,500 sq ft</td>
                  <td className="px-6 py-3 border-b font-semibold">15 squares</td>
                  <td className="px-6 py-3 border-b">Small house</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-blue-50">
                  <td className="px-6 py-3 border-b">2,000 sq ft</td>
                  <td className="px-6 py-3 border-b font-semibold">20 squares</td>
                  <td className="px-6 py-3 border-b">Typical house</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">2,500 sq ft</td>
                  <td className="px-6 py-3 border-b font-semibold">25 squares</td>
                  <td className="px-6 py-3 border-b">Large house</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">3,000 sq ft</td>
                  <td className="px-6 py-3 border-b font-semibold">30 squares</td>
                  <td className="px-6 py-3 border-b">Large house</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">5,000 sq ft</td>
                  <td className="px-6 py-3 border-b font-semibold">50 squares</td>
                  <td className="px-6 py-3 border-b">Small commercial</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">10,000 sq ft</td>
                  <td className="px-6 py-3 border-b font-semibold">100 squares</td>
                  <td className="px-6 py-3 border-b">Medium commercial</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">20,000 sq ft</td>
                  <td className="px-6 py-3 border-b font-semibold">200 squares</td>
                  <td className="px-6 py-3 border-b">Large commercial</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 id="material-coverage" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Material Coverage Per Square</h2>
          <p className="text-gray-700 mb-6">
            Understanding how materials are packaged helps you order correctly:
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Asphalt Shingles</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>3-Tab Shingles:</strong> 3 bundles per square (26 shingles per bundle)</li>
            <li><strong>Architectural Shingles:</strong> 3 bundles per square (21 shingles per bundle)</li>
            <li><strong>Hip & Ridge Shingles:</strong> 1 bundle covers 20-33 linear feet</li>
            <li><strong>Starter Strip:</strong> 1 roll covers 100-125 linear feet</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Underlayment</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Felt Paper (#15):</strong> 4 squares per roll (400 sq ft)</li>
            <li><strong>Felt Paper (#30):</strong> 2 squares per roll (200 sq ft)</li>
            <li><strong>Synthetic Underlayment:</strong> 10 squares per roll (1,000 sq ft)</li>
            <li><strong>Ice & Water Shield:</strong> 2 squares per roll (200 sq ft)</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Single-Ply Membrane (TPO/PVC/EPDM)</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>10 ft wide rolls:</strong> Sold by square (100 sq ft = 10 ft long)</li>
            <li><strong>12 ft wide rolls:</strong> Sold by square (100 sq ft = 8.33 ft long)</li>
            <li><strong>Coverage:</strong> Order actual square footage (no bundle conversions)</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Roof Insulation</h3>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>4×8 sheets (32 sq ft):</strong> 3.125 sheets per square</li>
            <li><strong>4×4 sheets (16 sq ft):</strong> 6.25 sheets per square</li>
            <li><strong>Standard order:</strong> By the square, delivered in sheets</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 my-8">
            <p className="text-gray-800 font-semibold mb-2">Waste Factor Reminder:</p>
            <p className="text-gray-700">
              Always add waste factor to material orders: 10% for shingles (or 15% for complex roofs), 5-10% for single-ply, 10% for edge metal. Order in full squares or bundles (can't buy 2.3 bundles!).
            </p>
          </div>

          <h2 id="common-mistakes" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Common Mistakes to Avoid</h2>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">1. Forgetting the Pitch Multiplier</h3>
          <p className="text-gray-700 mb-6">
            Never calculate squares from building footprint without applying pitch multiplier. A 2,000 sq ft building with 6:12 pitch = 2,236 sq ft of roof = 22.4 squares, not 20 squares.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">2. Rounding Too Early</h3>
          <p className="text-gray-700 mb-6">
            Calculate total square feet first, then divide by 100. Don't round individual roof sections before adding them together.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">3. Ordering Exact Square Count</h3>
          <p className="text-gray-700 mb-6">
            A 24.3 square roof needs 25 squares of material (always round up), plus waste factor (10%), so order 28 squares.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">4. Confusing Coverage vs. Squares Needed</h3>
          <p className="text-gray-700 mb-6">
            "3 bundles per square" means 3 bundles COVERS one square. For a 20-square roof, you need 60 bundles (20 × 3).
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">5. Not Accounting for Separate Roof Planes</h3>
          <p className="text-gray-700 mb-6">
            Calculate each roof section separately if they have different pitches, then add together. Don't average pitches.
          </p>

          <div className="bg-gray-50 rounded-xl p-8 mb-8 border-2 border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Reference: Squares Calculation Checklist</h3>
            <ul className="space-y-2 text-gray-700">
              <li>☐ Measure each roof plane separately</li>
              <li>☐ Apply pitch multiplier to each plane</li>
              <li>☐ Add all planes together for total square feet</li>
              <li>☐ Divide total by 100 to get squares</li>
              <li>☐ Round UP to nearest square for material orders</li>
              <li>☐ Add waste factor (10-15%)</li>
              <li>☐ Convert to bundles/rolls based on material type</li>
              <li>☐ Round bundle count UP (can't order partial bundles)</li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-8 mt-12 mb-12">
          <h3 className="text-2xl font-bold mb-3">Professional Estimating Templates</h3>
          <p className="text-blue-100 mb-6 text-lg">
            Get our professional templates with built-in pitch multipliers, conversion calculators, and material quantity formulas. Calculate squares and order materials accurately.
          </p>
          <Link
            href="/products/template-bundle"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Template Bundle - $129 →
          </Link>
          <p className="text-sm text-blue-200 mt-3">Includes pitch multiplier charts, conversion calculators, and material ordering guides</p>
        </div>

        {/* Related Posts */}
        <div className="border-t border-gray-200 pt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/blog/how-to-calculate-roof-pitch" className="group block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                How to Calculate Roof Pitch
              </h4>
              <p className="text-gray-600 text-sm">Complete guide with pitch multiplier tables and calculator.</p>
            </Link>
            <Link href="/blog/measuring-roof-without-climbing" className="group block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                3 Ways to Measure a Roof Without Climbing
              </h4>
              <p className="text-gray-600 text-sm">Aerial measurement methods for safe, accurate roof measurements.</p>
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
