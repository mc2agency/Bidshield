'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function RoofPitchArticle() {
  const [run, setRun] = useState('12');
  const [rise, setRise] = useState('6');
  const [calculatedPitch, setCalculatedPitch] = useState('');
  const [multiplier, setMultiplier] = useState('');

  const calculatePitch = () => {
    const riseNum = parseFloat(rise);
    const runNum = parseFloat(run);

    if (riseNum && runNum) {
      const pitchRatio = `${riseNum}:${runNum}`;
      const angle = Math.atan(riseNum / runNum) * (180 / Math.PI);
      const mult = Math.sqrt(1 + Math.pow(riseNum / runNum, 2));

      setCalculatedPitch(`${pitchRatio} (${angle.toFixed(1)}°)`);
      setMultiplier(mult.toFixed(3));
    }
  };

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
            <span>December 10, 2025</span>
            <span>8 min read</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            How to Calculate Roof Pitch in 3 Easy Steps [With Calculator]
          </h1>
          <p className="text-xl text-blue-100">
            Master roof pitch calculations with our complete guide. Includes pitch multiplier tables and a free calculator.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
              MC
            </div>
            <div>
              <div className="font-semibold">BidShield</div>
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
            <li><a href="#what-is-pitch" className="hover:text-blue-600 transition-colors">What is Roof Pitch?</a></li>
            <li><a href="#why-matters" className="hover:text-blue-600 transition-colors">Why Roof Pitch Matters for Estimating</a></li>
            <li><a href="#calculation-methods" className="hover:text-blue-600 transition-colors">3 Methods to Calculate Roof Pitch</a></li>
            <li><a href="#multiplier-table" className="hover:text-blue-600 transition-colors">Complete Pitch Multiplier Table</a></li>
            <li><a href="#calculator" className="hover:text-blue-600 transition-colors">Free Roof Pitch Calculator</a></li>
            <li><a href="#common-mistakes" className="hover:text-blue-600 transition-colors">Common Mistakes to Avoid</a></li>
          </ul>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <h2 id="what-is-pitch" className="text-3xl font-bold text-gray-900 mb-4 mt-12">What is Roof Pitch?</h2>
          <p className="text-gray-700 mb-6">
            Roof pitch is the measure of a roof's steepness, expressed as a ratio of vertical rise to horizontal run.
            In construction, we typically measure pitch as the number of inches the roof rises for every 12 inches of
            horizontal distance.
          </p>
          <p className="text-gray-700 mb-6">
            For example, a <strong>6:12 pitch</strong> means the roof rises 6 inches for every 12 inches of horizontal run.
            This is also called a "6 in 12" or "6/12" pitch.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
            <p className="text-gray-800 font-semibold mb-2">Pro Tip:</p>
            <p className="text-gray-700">
              The second number in a pitch ratio is almost always 12 in the United States. If you see "6:12",
              the 6 is the rise and 12 is the run. Some countries use different conventions, but US estimators
              always use X:12 format.
            </p>
          </div>

          <h2 id="why-matters" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Why Roof Pitch Matters for Estimating</h2>
          <p className="text-gray-700 mb-6">
            Understanding roof pitch is critical for accurate estimating because:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>Material Quantities:</strong> Steeper roofs have more surface area than their horizontal footprint suggests</li>
            <li><strong>Labor Costs:</strong> Steeper pitches require more time and safety equipment</li>
            <li><strong>Material Selection:</strong> Some roofing materials have minimum pitch requirements</li>
            <li><strong>Drainage Design:</strong> Pitch affects water runoff and drainage specifications</li>
            <li><strong>Safety Requirements:</strong> OSHA has different fall protection requirements based on pitch</li>
          </ul>

          <h2 id="calculation-methods" className="text-3xl font-bold text-gray-900 mb-4 mt-12">3 Methods to Calculate Roof Pitch</h2>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Method 1: Using a Pitch Gauge (Fastest)</h3>
          <p className="text-gray-700 mb-6">
            A pitch gauge or roof protractor is the fastest tool for measuring pitch on existing roofs:
          </p>
          <ol className="list-decimal pl-6 mb-6 text-gray-700 space-y-3">
            <li>Place the pitch gauge level on the roof surface</li>
            <li>Read the pitch directly from the gauge (e.g., "6:12")</li>
            <li>Record the measurement for your estimate</li>
          </ol>
          <p className="text-gray-700 mb-6">
            <strong>Cost:</strong> $15-30 | <strong>Accuracy:</strong> ±0.5:12
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Method 2: Using a Level and Tape Measure</h3>
          <p className="text-gray-700 mb-6">
            If you don't have a pitch gauge, you can use a standard level:
          </p>
          <ol className="list-decimal pl-6 mb-6 text-gray-700 space-y-3">
            <li>Place a 12-inch level on the roof surface, perfectly level</li>
            <li>Measure from the roof surface to the bottom of the level at the 12-inch mark</li>
            <li>This measurement is your pitch rise (e.g., 6 inches = 6:12 pitch)</li>
          </ol>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Method 3: From Plans (For New Construction)</h3>
          <p className="text-gray-700 mb-6">
            When estimating from construction drawings:
          </p>
          <ol className="list-decimal pl-6 mb-6 text-gray-700 space-y-3">
            <li>Look for roof pitch notation on architectural drawings (usually on elevations or roof plans)</li>
            <li>Pitch is typically shown as a triangle symbol with the ratio labeled</li>
            <li>Check building sections for pitch verification</li>
            <li>Verify all roof areas have the same pitch (many buildings have multiple pitches)</li>
          </ol>

          <h2 id="multiplier-table" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Complete Pitch Multiplier Table</h2>
          <p className="text-gray-700 mb-6">
            The pitch multiplier is used to convert horizontal roof area to actual sloped surface area.
            To use: <strong>Horizontal Area × Multiplier = Actual Roof Surface Area</strong>
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Pitch</th>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Angle (Degrees)</th>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Multiplier</th>
                  <th className="px-6 py-3 border-b text-left font-bold text-gray-900">Typical Use</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">1:12</td>
                  <td className="px-6 py-3 border-b">4.76°</td>
                  <td className="px-6 py-3 border-b font-semibold">1.003</td>
                  <td className="px-6 py-3 border-b">Near-flat roofs</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">2:12</td>
                  <td className="px-6 py-3 border-b">9.46°</td>
                  <td className="px-6 py-3 border-b font-semibold">1.014</td>
                  <td className="px-6 py-3 border-b">Low-slope commercial</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">3:12</td>
                  <td className="px-6 py-3 border-b">14.04°</td>
                  <td className="px-6 py-3 border-b font-semibold">1.031</td>
                  <td className="px-6 py-3 border-b">Minimum for shingles</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">4:12</td>
                  <td className="px-6 py-3 border-b">18.43°</td>
                  <td className="px-6 py-3 border-b font-semibold">1.054</td>
                  <td className="px-6 py-3 border-b">Low residential</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-blue-50">
                  <td className="px-6 py-3 border-b font-bold">5:12</td>
                  <td className="px-6 py-3 border-b">22.62°</td>
                  <td className="px-6 py-3 border-b font-semibold">1.083</td>
                  <td className="px-6 py-3 border-b">Common residential</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-blue-50">
                  <td className="px-6 py-3 border-b font-bold">6:12</td>
                  <td className="px-6 py-3 border-b">26.57°</td>
                  <td className="px-6 py-3 border-b font-semibold">1.118</td>
                  <td className="px-6 py-3 border-b">Most common pitch</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">7:12</td>
                  <td className="px-6 py-3 border-b">30.26°</td>
                  <td className="px-6 py-3 border-b font-semibold">1.158</td>
                  <td className="px-6 py-3 border-b">Steep residential</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">8:12</td>
                  <td className="px-6 py-3 border-b">33.69°</td>
                  <td className="px-6 py-3 border-b font-semibold">1.202</td>
                  <td className="px-6 py-3 border-b">Steep residential</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">9:12</td>
                  <td className="px-6 py-3 border-b">36.87°</td>
                  <td className="px-6 py-3 border-b font-semibold">1.250</td>
                  <td className="px-6 py-3 border-b">Very steep</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">10:12</td>
                  <td className="px-6 py-3 border-b">39.81°</td>
                  <td className="px-6 py-3 border-b font-semibold">1.302</td>
                  <td className="px-6 py-3 border-b">Very steep</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">12:12</td>
                  <td className="px-6 py-3 border-b">45.00°</td>
                  <td className="px-6 py-3 border-b font-semibold">1.414</td>
                  <td className="px-6 py-3 border-b">Extremely steep</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 my-8">
            <p className="text-gray-800 font-semibold mb-2">Example Calculation:</p>
            <p className="text-gray-700">
              If you have a 2,000 sq ft horizontal roof area with a 6:12 pitch:<br/>
              <strong>2,000 sq ft × 1.118 = 2,236 sq ft</strong> of actual roof surface area<br/>
              You need to order materials for 2,236 sq ft, not 2,000 sq ft!
            </p>
          </div>

          <h2 id="calculator" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Free Roof Pitch Calculator</h2>
          <p className="text-gray-700 mb-6">
            Use this simple calculator to determine your pitch and multiplier:
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 mb-8 border-2 border-blue-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Pitch Calculator</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rise (inches)</label>
                <input
                  type="number"
                  value={rise}
                  onChange={(e) => setRise(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-lg"
                  placeholder="6"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Run (inches)</label>
                <input
                  type="number"
                  value={run}
                  onChange={(e) => setRun(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-lg"
                  placeholder="12"
                />
              </div>
            </div>
            <button
              onClick={calculatePitch}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-6"
            >
              Calculate Pitch
            </button>
            {calculatedPitch && (
              <div className="bg-white rounded-lg p-6 border-2 border-blue-500">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Roof Pitch</div>
                    <div className="text-2xl font-bold text-blue-600">{calculatedPitch}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Pitch Multiplier</div>
                    <div className="text-2xl font-bold text-blue-600">{multiplier}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <h2 id="common-mistakes" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Common Mistakes to Avoid</h2>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">1. Forgetting to Apply the Multiplier</h3>
          <p className="text-gray-700 mb-6">
            The most expensive mistake: measuring the building footprint and ordering that much material.
            A 2,000 sq ft building with 6:12 pitch needs <strong>2,236 sq ft</strong> of roofing, not 2,000!
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">2. Assuming All Roof Areas Have the Same Pitch</h3>
          <p className="text-gray-700 mb-6">
            Many buildings have multiple pitches. Check every roof plane separately. Porches, dormers,
            and additions often have different pitches than the main roof.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">3. Measuring Pitch from Inside the Attic</h3>
          <p className="text-gray-700 mb-6">
            Attic rafters can be misleading due to insulation, truss geometry, and ceiling joists.
            Always measure on the exterior roof surface or from architectural drawings.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">4. Rounding Too Aggressively</h3>
          <p className="text-gray-700 mb-6">
            Keep at least 3 decimal places in your multiplier (1.118, not 1.1). On large projects,
            rounding can mean hundreds of square feet and thousands of dollars.
          </p>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-8 mt-12 mb-12">
          <h3 className="text-2xl font-bold mb-3">Download the Complete Pitch Multiplier Chart</h3>
          <p className="text-blue-100 mb-6 text-lg">
            Get our professional PDF pitch chart with all common pitches, multipliers, and conversion formulas.
            Print it and keep it in your truck for quick reference on every job.
          </p>
          <Link
            href="/products/estimating-checklist"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Estimating Checklist - $29 →
          </Link>
          <p className="text-sm text-blue-200 mt-3">Includes pitch chart, estimating checklist, and 25+ other essential reference sheets</p>
        </div>

        {/* Related Posts */}
        <div className="border-t border-gray-200 pt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/blog/labor-burden-calculation-guide" className="group block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Labor Burden Calculation for Contractors
              </h4>
              <p className="text-gray-600 text-sm">Learn how to calculate true labor costs including all burden and overhead.</p>
            </Link>
            <Link href="/blog/reading-construction-specifications" className="group block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                How to Read Construction Specifications
              </h4>
              <p className="text-gray-600 text-sm">Master the CSI MasterFormat and find critical information in spec books.</p>
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
