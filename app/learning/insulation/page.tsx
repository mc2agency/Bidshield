'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CubeIcon,
  BeakerIcon,
  ChartBarIcon,
  TableCellsIcon,
  ShieldCheckIcon,
  CalculatorIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';

export default function InsulationPage() {
  const [activeTab, setActiveTab] = useState('tapered');

  const tabs = [
    { id: 'tapered', name: 'Tapered Systems', icon: ArrowTrendingUpIcon },
    { id: 'flatstock', name: 'Flat Stock', icon: Square3Stack3DIcon },
    { id: 'psi', name: 'PSI Ratings', icon: ShieldCheckIcon },
    { id: 'rvalues', name: 'R-Values', icon: ChartBarIcon },
    { id: 'coverboards', name: 'Cover Boards', icon: TableCellsIcon },
    { id: 'specialty', name: 'IRMA & Green Roof', icon: BeakerIcon },
    { id: 'calculator', name: 'Calculator', icon: CalculatorIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/learning"
            className="inline-flex items-center text-emerald-400 hover:text-emerald-300 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Learning Center
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <CubeIcon className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Roofing Insulation Systems</h1>
              <p className="text-slate-400 mt-1">
                Complete guide to tapered systems, flat stock, R-values, PSI ratings & cover boards
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-2 gap-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tapered Systems */}
        {activeTab === 'tapered' && (
          <div className="space-y-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Tapered Insulation Systems</h2>
              <p className="text-slate-300 mb-6">
                Tapered insulation provides positive slope for drainage on flat roofs. Understanding slope ratios
                and board configurations is critical for accurate material takeoffs and cost estimation.
              </p>

              {/* Slope Options */}
              <h3 className="text-xl font-semibold text-white mb-4">Standard Slope Options</h3>
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                {[
                  { slope: '1/8"', ratio: '1/8" per foot', percent: '1.04%', use: 'Minimum code requirement, budget option' },
                  { slope: '1/4"', ratio: '1/4" per foot', percent: '2.08%', use: 'Industry standard, best drainage' },
                  { slope: '3/8"', ratio: '3/8" per foot', percent: '3.13%', use: 'Enhanced drainage, steeper areas' },
                  { slope: '1/2"', ratio: '1/2" per foot', percent: '4.17%', use: 'Maximum slope, special applications' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-emerald-400 mb-1">{item.slope}</div>
                    <div className="text-sm text-slate-400 mb-2">{item.ratio}</div>
                    <div className="text-xs text-slate-500 mb-2">{item.percent} slope</div>
                    <div className="text-xs text-slate-300">{item.use}</div>
                  </div>
                ))}
              </div>

              {/* Tapered Board Configurations */}
              <h3 className="text-xl font-semibold text-white mb-4">Standard Panel Sizes</h3>
              <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-emerald-400 mb-2">Polyiso Tapered</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Standard: 4' x 4' panels</li>
                      <li>• Also available: 4' x 8' panels</li>
                      <li>• Thickness range: 1/4" to 4"+ (tapered edge)</li>
                      <li>• Cricket/saddle panels available</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-400 mb-2">EPS Tapered</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Standard: 4' x 4' or 4' x 8' panels</li>
                      <li>• Custom sizes available</li>
                      <li>• Often used for thick fills</li>
                      <li>• More economical for deep tapers</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tapered System Components */}
              <h3 className="text-xl font-semibold text-white mb-4">System Components</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-4 border border-blue-500/30">
                  <h4 className="font-semibold text-blue-400 mb-2">Flat Fill</h4>
                  <p className="text-slate-300 text-sm">
                    Base layer of uniform thickness insulation to achieve minimum R-value before tapered system begins.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-lg p-4 border border-emerald-500/30">
                  <h4 className="font-semibold text-emerald-400 mb-2">Tapered Panels</h4>
                  <p className="text-slate-300 text-sm">
                    Wedge-shaped panels that create slope. Thickness varies from thin edge to thick edge across panel.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-4 border border-purple-500/30">
                  <h4 className="font-semibold text-purple-400 mb-2">Crickets & Saddles</h4>
                  <p className="text-slate-300 text-sm">
                    Pre-formed pieces that divert water around penetrations, HVAC units, and to drains.
                  </p>
                </div>
              </div>

              {/* Estimating Tip */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-1">Estimating Tip</h4>
                    <p className="text-slate-300 text-sm">
                      When estimating tapered systems, always request a tapered layout drawing from the manufacturer.
                      This shows exact panel placement, quantities, and average thickness for R-value calculations.
                      Average R-value = (min thickness R + max thickness R) / 2
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Drainage Design */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Drainage Design Principles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-3">4-Way Slope (Diamond)</h4>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-300 text-sm mb-3">
                      Water flows to center drain from all four directions. Most efficient for single drain locations.
                    </p>
                    <ul className="text-slate-400 text-sm space-y-1">
                      <li>• High point at perimeter/corners</li>
                      <li>• Low point at center drain</li>
                      <li>• Requires valley panels</li>
                      <li>• Best for: Square/rectangular areas</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-3">2-Way Slope (Linear)</h4>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-300 text-sm mb-3">
                      Water flows in two directions to a center valley or gutter line. Simpler installation.
                    </p>
                    <ul className="text-slate-400 text-sm space-y-1">
                      <li>• High points at two edges</li>
                      <li>• Low point along center line</li>
                      <li>• Simpler panel layout</li>
                      <li>• Best for: Long narrow areas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flat Stock Insulation */}
        {activeTab === 'flatstock' && (
          <div className="space-y-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Flat Stock Insulation Types</h2>
              <p className="text-slate-300 mb-6">
                Flat stock insulation provides uniform thermal resistance across the roof assembly.
                Selection depends on R-value requirements, compressive strength needs, and budget.
              </p>

              {/* Polyiso */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-6 border border-emerald-500/20 mb-6">
                <h3 className="text-xl font-semibold text-emerald-400 mb-4">Polyisocyanurate (Polyiso)</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Specifications</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• R-Value: ~5.7 per inch (LTTR)</li>
                      <li>• Standard sizes: 4'x4', 4'x8'</li>
                      <li>• Thickness: 0.5" to 4.5"</li>
                      <li>• Facers: Glass, coated glass, foil</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Advantages</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Highest R-value per inch</li>
                      <li>• Lightweight</li>
                      <li>• Fire resistant</li>
                      <li>• Most common commercial choice</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Considerations</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• R-value decreases in cold temps</li>
                      <li>• Not for below-grade use</li>
                      <li>• Moisture sensitive</li>
                      <li>• Higher cost than EPS</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-emerald-500/20">
                  <h4 className="font-semibold text-white mb-2">Common Thicknesses & R-Values</h4>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                    {[
                      { thick: '1.0"', r: 'R-5.7' },
                      { thick: '1.5"', r: 'R-8.6' },
                      { thick: '2.0"', r: 'R-11.4' },
                      { thick: '2.5"', r: 'R-14.3' },
                      { thick: '3.0"', r: 'R-17.1' },
                      { thick: '4.0"', r: 'R-22.8' },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-700/50 rounded px-3 py-2 text-center">
                        <div className="text-emerald-400 font-semibold">{item.thick}</div>
                        <div className="text-slate-400 text-xs">{item.r}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* EPS */}
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-6 border border-blue-500/20 mb-6">
                <h3 className="text-xl font-semibold text-blue-400 mb-4">Expanded Polystyrene (EPS)</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Specifications</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• R-Value: ~3.8-4.2 per inch</li>
                      <li>• Standard sizes: 4'x4', 4'x8'</li>
                      <li>• Thickness: 1" to 40"+ custom</li>
                      <li>• Densities: Type I, II, VIII, IX</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Advantages</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Most economical option</li>
                      <li>• Stable R-value (no thermal drift)</li>
                      <li>• Custom shapes available</li>
                      <li>• Good for thick fills</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Considerations</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Lower R per inch than polyiso</li>
                      <li>• Requires protective cover</li>
                      <li>• Not compatible with some adhesives</li>
                      <li>• Lighter weight = wind concerns</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* XPS */}
              <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 rounded-xl p-6 border border-pink-500/20">
                <h3 className="text-xl font-semibold text-pink-400 mb-4">Extruded Polystyrene (XPS)</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Specifications</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• R-Value: ~5.0 per inch (LTTR)</li>
                      <li>• Standard sizes: 2'x8', 4'x8'</li>
                      <li>• Thickness: 0.5" to 4"</li>
                      <li>• Colors: Pink, Blue, Green (by brand)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Advantages</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Excellent moisture resistance</li>
                      <li>• High compressive strength</li>
                      <li>• Best for below-grade/wet areas</li>
                      <li>• IRMA/PMR applications</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Considerations</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Higher cost</li>
                      <li>• UV sensitive (must be covered)</li>
                      <li>• Environmental concerns (blowing agents)</li>
                      <li>• Limited thickness options</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Board Foot Calculations */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Board Foot Calculations</h3>
              <p className="text-slate-300 mb-4">
                Insulation is often priced per board foot (BF). One board foot = 1 sq ft at 1" thickness.
              </p>

              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <div className="text-emerald-400 font-mono text-lg mb-2">
                  Board Feet = Square Feet × Thickness (inches)
                </div>
                <div className="text-slate-400 text-sm">
                  Example: 10,000 SF of 2.5" polyiso = 10,000 × 2.5 = 25,000 BF
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-400 mb-2">Quick Reference</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="text-left py-1">Thickness</th>
                        <th className="text-left py-1">BF per SF</th>
                        <th className="text-left py-1">SF per 1000 BF</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr><td>1.0"</td><td>1.0</td><td>1,000 SF</td></tr>
                      <tr><td>1.5"</td><td>1.5</td><td>667 SF</td></tr>
                      <tr><td>2.0"</td><td>2.0</td><td>500 SF</td></tr>
                      <tr><td>2.5"</td><td>2.5</td><td>400 SF</td></tr>
                      <tr><td>3.0"</td><td>3.0</td><td>333 SF</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-400 mb-2">Pricing Example</h4>
                  <div className="text-slate-300 text-sm space-y-2">
                    <p>If polyiso costs $0.45 per board foot:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• 1" = $0.45/SF</li>
                      <li>• 2" = $0.90/SF</li>
                      <li>• 3" = $1.35/SF</li>
                    </ul>
                    <p className="text-slate-400 mt-2">
                      Always confirm current pricing with suppliers - material costs fluctuate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PSI Ratings */}
        {activeTab === 'psi' && (
          <div className="space-y-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Compressive Strength (PSI) Ratings</h2>
              <p className="text-slate-300 mb-6">
                PSI (pounds per square inch) indicates the insulation's ability to withstand loads without permanent
                deformation. Higher PSI is required for roofs with heavy foot traffic, equipment, or special systems.
              </p>

              {/* PSI Comparison */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">20 PSI</div>
                  <h3 className="text-lg font-semibold text-white mb-3">Standard Duty</h3>
                  <ul className="text-slate-300 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>General commercial roofing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Limited foot traffic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Adhered/mechanically attached</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Most economical option</span>
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-slate-600">
                    <span className="text-slate-400 text-xs">Common Products:</span>
                    <p className="text-slate-300 text-sm">Standard polyiso, Type I EPS</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/50 to-slate-800 rounded-xl p-6 border border-blue-500/30">
                  <div className="text-3xl font-bold text-blue-400 mb-2">25 PSI</div>
                  <h3 className="text-lg font-semibold text-white mb-3">Medium Duty</h3>
                  <ul className="text-slate-300 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Moderate foot traffic areas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Light equipment pads</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Ballasted systems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>FM/UL assemblies</span>
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-blue-500/30">
                    <span className="text-slate-400 text-xs">Common Products:</span>
                    <p className="text-slate-300 text-sm">HD Polyiso, Type II EPS</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-slate-800 rounded-xl p-6 border border-purple-500/30">
                  <div className="text-3xl font-bold text-purple-400 mb-2">60 PSI</div>
                  <h3 className="text-lg font-semibold text-white mb-3">Heavy Duty</h3>
                  <ul className="text-slate-300 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>IRMA / PMR systems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Green roof assemblies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Plaza deck / pavers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Heavy equipment areas</span>
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-purple-500/30">
                    <span className="text-slate-400 text-xs">Common Products:</span>
                    <p className="text-slate-300 text-sm">XPS, DuPont Styrofoam, Type IX EPS</p>
                  </div>
                </div>
              </div>

              {/* Higher PSI Options */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Specialty High-PSI Applications</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-2">100+ PSI</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Parking deck overlays</li>
                      <li>• Vehicular traffic areas</li>
                      <li>• Cold storage facilities</li>
                      <li>• Products: Type XV EPS, specialty XPS</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-400 mb-2">Point Load Considerations</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• HVAC equipment requires load spreading</li>
                      <li>• Use sleepers or concrete pads</li>
                      <li>• Calculate actual PSI at contact points</li>
                      <li>• Consult structural engineer for heavy loads</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* FM & UL Considerations */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">FM Global & UL Requirements</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-400 mb-2">FM Approved Assemblies</h4>
                  <p className="text-slate-300 text-sm mb-3">
                    Factory Mutual approved roof assemblies often specify minimum 25 PSI insulation for:
                  </p>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>• Wind uplift resistance</li>
                    <li>• Hail resistance ratings</li>
                    <li>• Fire classification</li>
                    <li>• Overall system performance</li>
                  </ul>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-400 mb-2">Insurance Implications</h4>
                  <p className="text-slate-300 text-sm mb-3">
                    Using FM/UL approved assemblies can impact:
                  </p>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>• Insurance premiums</li>
                    <li>• Warranty coverage</li>
                    <li>• Code compliance</li>
                    <li>• Building certifications (LEED, etc.)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* R-Values */}
        {activeTab === 'rvalues' && (
          <div className="space-y-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">R-Value Reference Guide</h2>
              <p className="text-slate-300 mb-6">
                R-value measures thermal resistance - higher values mean better insulation performance.
                Building codes specify minimum R-values based on climate zone and roof type.
              </p>

              {/* R-Value Comparison Table */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-700/50">
                      <th className="text-left p-3 text-slate-300">Insulation Type</th>
                      <th className="text-center p-3 text-slate-300">R per Inch</th>
                      <th className="text-center p-3 text-slate-300">1"</th>
                      <th className="text-center p-3 text-slate-300">2"</th>
                      <th className="text-center p-3 text-slate-300">3"</th>
                      <th className="text-center p-3 text-slate-300">4"</th>
                      <th className="text-center p-3 text-slate-300">5"</th>
                      <th className="text-center p-3 text-slate-300">6"</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    <tr className="hover:bg-slate-700/30">
                      <td className="p-3 text-emerald-400 font-semibold">Polyiso (LTTR)</td>
                      <td className="p-3 text-center text-white">5.7</td>
                      <td className="p-3 text-center text-slate-300">5.7</td>
                      <td className="p-3 text-center text-slate-300">11.4</td>
                      <td className="p-3 text-center text-slate-300">17.1</td>
                      <td className="p-3 text-center text-slate-300">22.8</td>
                      <td className="p-3 text-center text-slate-300">28.5</td>
                      <td className="p-3 text-center text-slate-300">34.2</td>
                    </tr>
                    <tr className="hover:bg-slate-700/30">
                      <td className="p-3 text-blue-400 font-semibold">XPS</td>
                      <td className="p-3 text-center text-white">5.0</td>
                      <td className="p-3 text-center text-slate-300">5.0</td>
                      <td className="p-3 text-center text-slate-300">10.0</td>
                      <td className="p-3 text-center text-slate-300">15.0</td>
                      <td className="p-3 text-center text-slate-300">20.0</td>
                      <td className="p-3 text-center text-slate-300">25.0</td>
                      <td className="p-3 text-center text-slate-300">30.0</td>
                    </tr>
                    <tr className="hover:bg-slate-700/30">
                      <td className="p-3 text-pink-400 font-semibold">EPS Type II</td>
                      <td className="p-3 text-center text-white">4.2</td>
                      <td className="p-3 text-center text-slate-300">4.2</td>
                      <td className="p-3 text-center text-slate-300">8.4</td>
                      <td className="p-3 text-center text-slate-300">12.6</td>
                      <td className="p-3 text-center text-slate-300">16.8</td>
                      <td className="p-3 text-center text-slate-300">21.0</td>
                      <td className="p-3 text-center text-slate-300">25.2</td>
                    </tr>
                    <tr className="hover:bg-slate-700/30">
                      <td className="p-3 text-purple-400 font-semibold">EPS Type I</td>
                      <td className="p-3 text-center text-white">3.8</td>
                      <td className="p-3 text-center text-slate-300">3.8</td>
                      <td className="p-3 text-center text-slate-300">7.6</td>
                      <td className="p-3 text-center text-slate-300">11.4</td>
                      <td className="p-3 text-center text-slate-300">15.2</td>
                      <td className="p-3 text-center text-slate-300">19.0</td>
                      <td className="p-3 text-center text-slate-300">22.8</td>
                    </tr>
                    <tr className="hover:bg-slate-700/30">
                      <td className="p-3 text-amber-400 font-semibold">Mineral Wool</td>
                      <td className="p-3 text-center text-white">3.7</td>
                      <td className="p-3 text-center text-slate-300">3.7</td>
                      <td className="p-3 text-center text-slate-300">7.4</td>
                      <td className="p-3 text-center text-slate-300">11.1</td>
                      <td className="p-3 text-center text-slate-300">14.8</td>
                      <td className="p-3 text-center text-slate-300">18.5</td>
                      <td className="p-3 text-center text-slate-300">22.2</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Code Requirements */}
              <h3 className="text-xl font-semibold text-white mb-4">IECC Code Requirements by Climate Zone</h3>
              <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                <p className="text-slate-300 text-sm mb-4">
                  2021 IECC minimum roof insulation R-values for commercial buildings:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { zone: 'Zone 1-3', r: 'R-25 c.i.', desc: 'Hot/Warm climates' },
                    { zone: 'Zone 4-5', r: 'R-30 c.i.', desc: 'Mixed climates' },
                    { zone: 'Zone 6-7', r: 'R-35 c.i.', desc: 'Cold climates' },
                    { zone: 'Zone 8', r: 'R-40 c.i.', desc: 'Very cold climates' },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div className="text-emerald-400 font-semibold">{item.zone}</div>
                      <div className="text-2xl font-bold text-white">{item.r}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                  ))}
                </div>
                <p className="text-slate-400 text-xs mt-4">
                  c.i. = continuous insulation. Always verify local code requirements as they may exceed IECC minimums.
                </p>
              </div>

              {/* LTTR Explanation */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-1">Understanding LTTR (Long-Term Thermal Resistance)</h4>
                    <p className="text-slate-300 text-sm">
                      Polyiso R-values use LTTR methodology which accounts for thermal drift over time. The 5.7 R/inch
                      value represents stabilized performance after aging. Initial R-value may be higher (6.0+) but will
                      settle to LTTR within 2-5 years. Always use LTTR values for energy calculations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Temperature Effects */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Temperature Effects on R-Value</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-3">Polyiso Cold Weather Performance</h4>
                  <p className="text-slate-300 text-sm mb-3">
                    Polyiso R-value decreases in cold temperatures:
                  </p>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>• At 75°F: R-5.7/inch (rated)</li>
                    <li>• At 40°F: ~R-5.0/inch</li>
                    <li>• At 25°F: ~R-4.5/inch</li>
                    <li>• At 0°F: ~R-4.0/inch</li>
                  </ul>
                  <p className="text-slate-400 text-xs mt-3">
                    Consider hybrid systems with EPS/XPS beneath polyiso in cold climates.
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-400 mb-3">EPS/XPS Stability</h4>
                  <p className="text-slate-300 text-sm mb-3">
                    EPS and XPS maintain more stable R-values:
                  </p>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>• Minimal thermal drift</li>
                    <li>• Consistent cold weather performance</li>
                    <li>• Better for below-grade applications</li>
                    <li>• Preferred for IRMA systems</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cover Boards */}
        {activeTab === 'coverboards' && (
          <div className="space-y-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Cover Board Types</h2>
              <p className="text-slate-300 mb-6">
                Cover boards protect insulation, enhance fire ratings, improve puncture resistance,
                and provide a stable substrate for membrane attachment. Selection depends on system requirements.
              </p>

              {/* Cover Board Grid */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* HD Polyiso */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-5 border border-emerald-500/20">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">High-Density Polyiso</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 text-sm">Thickness:</span>
                      <span className="text-white text-sm ml-2">1/4", 1/2", 3/4"</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">PSI:</span>
                      <span className="text-white text-sm ml-2">25 PSI typical</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">R-Value:</span>
                      <span className="text-white text-sm ml-2">~R-1.4 per 1/4"</span>
                    </div>
                    <ul className="text-slate-300 text-sm space-y-1 mt-3">
                      <li>✓ Adds R-value to assembly</li>
                      <li>✓ Lightweight</li>
                      <li>✓ Good for adhered systems</li>
                      <li>✓ FM approved assemblies</li>
                    </ul>
                    <p className="text-slate-400 text-xs mt-2">Brands: DensDeck Prime ISO, SECUROCK</p>
                  </div>
                </div>

                {/* Gypsum */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-5 border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Gypsum Cover Board</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 text-sm">Thickness:</span>
                      <span className="text-white text-sm ml-2">1/4", 5/16", 1/2", 5/8"</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Weight:</span>
                      <span className="text-white text-sm ml-2">~2.0 PSF (1/2")</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Fire Rating:</span>
                      <span className="text-white text-sm ml-2">Non-combustible</span>
                    </div>
                    <ul className="text-slate-300 text-sm space-y-1 mt-3">
                      <li>✓ Enhanced fire protection</li>
                      <li>✓ Hail/puncture resistance</li>
                      <li>✓ Smooth membrane substrate</li>
                      <li>✓ Required for many FM assemblies</li>
                    </ul>
                    <p className="text-slate-400 text-xs mt-2">Brands: DensDeck, SECUROCK, DEXcell</p>
                  </div>
                </div>

                {/* Wood Fiber */}
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-5 border border-amber-500/20">
                  <h3 className="text-lg font-semibold text-amber-400 mb-3">Wood Fiber / Asphaltic</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 text-sm">Thickness:</span>
                      <span className="text-white text-sm ml-2">1/2", 3/4", 1"</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">PSI:</span>
                      <span className="text-white text-sm ml-2">100+ PSI</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">R-Value:</span>
                      <span className="text-white text-sm ml-2">~R-1.5 per inch</span>
                    </div>
                    <ul className="text-slate-300 text-sm space-y-1 mt-3">
                      <li>✓ Excellent for hot asphalt</li>
                      <li>✓ High compressive strength</li>
                      <li>✓ Moisture tolerant</li>
                      <li>✓ Traditional BUR substrate</li>
                    </ul>
                    <p className="text-slate-400 text-xs mt-2">Brands: Celotex, Mule-Hide, Tapered Edge</p>
                  </div>
                </div>

                {/* Perlite */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-5 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">Perlite Board</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 text-sm">Thickness:</span>
                      <span className="text-white text-sm ml-2">1/2", 3/4", 1", 1.5"</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Fire Rating:</span>
                      <span className="text-white text-sm ml-2">Non-combustible</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">R-Value:</span>
                      <span className="text-white text-sm ml-2">~R-2.7 per inch</span>
                    </div>
                    <ul className="text-slate-300 text-sm space-y-1 mt-3">
                      <li>✓ Fire resistant mineral board</li>
                      <li>✓ Compatible with hot asphalt</li>
                      <li>✓ Dimensional stability</li>
                      <li>✓ FM Class 1 rated</li>
                    </ul>
                    <p className="text-slate-400 text-xs mt-2">Brands: GAF EnergyGuard Perlite, Johns Manville</p>
                  </div>
                </div>

                {/* Mineral Wool */}
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl p-5 border border-red-500/20">
                  <h3 className="text-lg font-semibold text-red-400 mb-3">Mineral Wool / Stone Wool</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 text-sm">Thickness:</span>
                      <span className="text-white text-sm ml-2">1", 1.5", 2"</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Fire Rating:</span>
                      <span className="text-white text-sm ml-2">Non-combustible, 2000°F+</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">R-Value:</span>
                      <span className="text-white text-sm ml-2">~R-4.2 per inch</span>
                    </div>
                    <ul className="text-slate-300 text-sm space-y-1 mt-3">
                      <li>✓ Superior fire protection</li>
                      <li>✓ Acoustic benefits</li>
                      <li>✓ Water resistant</li>
                      <li>✓ No thermal drift</li>
                    </ul>
                    <p className="text-slate-400 text-xs mt-2">Brands: ROCKWOOL, Owens Corning Thermafiber</p>
                  </div>
                </div>

                {/* OSB/Plywood */}
                <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/5 rounded-xl p-5 border border-slate-500/20">
                  <h3 className="text-lg font-semibold text-slate-300 mb-3">OSB / Plywood</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 text-sm">Thickness:</span>
                      <span className="text-white text-sm ml-2">3/8", 1/2", 5/8", 3/4"</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Weight:</span>
                      <span className="text-white text-sm ml-2">~2.0 PSF (1/2")</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Nailability:</span>
                      <span className="text-white text-sm ml-2">Excellent</span>
                    </div>
                    <ul className="text-slate-300 text-sm space-y-1 mt-3">
                      <li>✓ Best for mechanically attached</li>
                      <li>✓ Excellent nail/screw holding</li>
                      <li>✓ Required for some shingle systems</li>
                      <li>✓ Cost effective</li>
                    </ul>
                    <p className="text-slate-400 text-xs mt-2">Note: Not for adhered single-ply systems</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selection Guide */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Cover Board Selection Guide</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-700/50">
                      <th className="text-left p-3 text-slate-300">Application</th>
                      <th className="text-left p-3 text-slate-300">Recommended Cover Board</th>
                      <th className="text-left p-3 text-slate-300">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-slate-300">
                    <tr className="hover:bg-slate-700/30">
                      <td className="p-3">TPO/PVC Adhered</td>
                      <td className="p-3 text-emerald-400">Gypsum or HD Polyiso</td>
                      <td className="p-3 text-slate-400">Smooth surface for adhesion</td>
                    </tr>
                    <tr className="hover:bg-slate-700/30">
                      <td className="p-3">EPDM Adhered</td>
                      <td className="p-3 text-emerald-400">HD Polyiso or Gypsum</td>
                      <td className="p-3 text-slate-400">Check adhesive compatibility</td>
                    </tr>
                    <tr className="hover:bg-slate-700/30">
                      <td className="p-3">BUR / Modified Bitumen</td>
                      <td className="p-3 text-emerald-400">Wood Fiber or Perlite</td>
                      <td className="p-3 text-slate-400">Hot asphalt compatible</td>
                    </tr>
                    <tr className="hover:bg-slate-700/30">
                      <td className="p-3">High Fire Rating Required</td>
                      <td className="p-3 text-emerald-400">Gypsum or Mineral Wool</td>
                      <td className="p-3 text-slate-400">Non-combustible options</td>
                    </tr>
                    <tr className="hover:bg-slate-700/30">
                      <td className="p-3">Hail-Prone Areas</td>
                      <td className="p-3 text-emerald-400">1/2" or 5/8" Gypsum</td>
                      <td className="p-3 text-slate-400">FM SH (Severe Hail) rated</td>
                    </tr>
                    <tr className="hover:bg-slate-700/30">
                      <td className="p-3">Mechanically Attached</td>
                      <td className="p-3 text-emerald-400">Gypsum, OSB, or HD Polyiso</td>
                      <td className="p-3 text-slate-400">Fastener pull-through resistance</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* IRMA & Green Roof */}
        {activeTab === 'specialty' && (
          <div className="space-y-8">
            {/* IRMA Section */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">IRMA / PMR Systems</h2>
              <p className="text-slate-300 mb-6">
                Inverted Roof Membrane Assembly (IRMA) or Protected Membrane Roof (PMR) places insulation
                above the waterproofing membrane, protecting it from thermal cycling, UV, and physical damage.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-700/30 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">System Components (Top to Bottom)</h3>
                  <ol className="text-slate-300 text-sm space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="bg-emerald-500/20 text-emerald-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">1</span>
                      <span><strong>Ballast/Pavers:</strong> Stone, concrete pavers, or vegetation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-emerald-500/20 text-emerald-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">2</span>
                      <span><strong>Filter Fabric:</strong> Prevents fines migration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-emerald-500/20 text-emerald-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">3</span>
                      <span><strong>XPS Insulation:</strong> 60 PSI minimum, moisture resistant</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-emerald-500/20 text-emerald-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">4</span>
                      <span><strong>Protection Board:</strong> Optional drainage mat</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-emerald-500/20 text-emerald-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">5</span>
                      <span><strong>Waterproofing:</strong> EPDM, PVC, or built-up membrane</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-emerald-500/20 text-emerald-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">6</span>
                      <span><strong>Structural Deck:</strong> Concrete, steel, or wood</span>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">IRMA Insulation Requirements</h3>
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 mb-4">
                    <h4 className="font-semibold text-white mb-2">DuPont Styrofoam™ Products</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• <strong>ROOFMATE™:</strong> 25-60 PSI, R-5 per inch</li>
                      <li>• <strong>CAVITYMATE™:</strong> Below-grade applications</li>
                      <li>• Closed-cell structure resists moisture</li>
                      <li>• Long-term water absorption &lt;0.3%</li>
                    </ul>
                  </div>
                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <h4 className="font-semibold text-white mb-2">Owens Corning FOAMULAR®</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• <strong>FOAMULAR 400:</strong> 40 PSI</li>
                      <li>• <strong>FOAMULAR 600:</strong> 60 PSI</li>
                      <li>• <strong>FOAMULAR 1000:</strong> 100 PSI</li>
                      <li>• Pink color identification</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* R-Value Adjustment */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-1">IRMA R-Value Reduction Factor</h4>
                    <p className="text-slate-300 text-sm">
                      Water flowing under IRMA insulation reduces effective R-value. Apply a reduction factor:
                      <br />• Typical: Reduce R-value by 10-20%
                      <br />• Use manufacturer's published "in-service" R-values for energy calculations
                      <br />• Additional insulation may be needed to meet code requirements
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Green Roof Section */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Green Roof Insulation</h2>
              <p className="text-slate-300 mb-6">
                Green roofs require insulation that can withstand permanent moisture exposure, root penetration
                pressure, and heavy loads from saturated growing media.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* DuPont Plazamate */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-5 border border-emerald-500/20">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">DuPont™ Styrofoam™ PLAZAMATE™</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Premium XPS insulation specifically designed for plaza deck and green roof applications.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Compressive Strength:</span>
                      <span className="text-white">60 PSI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">R-Value:</span>
                      <span className="text-white">R-5.0 per inch</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Water Absorption:</span>
                      <span className="text-white">&lt;0.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Thickness:</span>
                      <span className="text-white">1" to 4"</span>
                    </div>
                  </div>
                  <ul className="text-slate-300 text-sm space-y-1 mt-4 pt-4 border-t border-emerald-500/20">
                    <li>✓ Root resistant</li>
                    <li>✓ Permanent moisture exposure rated</li>
                    <li>✓ Ship-lap edges for drainage</li>
                    <li>✓ 20+ year performance history</li>
                  </ul>
                </div>

                {/* Green Roof Assembly */}
                <div className="bg-slate-700/30 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Intensive Green Roof Assembly</h3>
                  <ol className="text-slate-300 text-sm space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">1</span>
                      <span><strong>Vegetation:</strong> Plants, trees, shrubs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">2</span>
                      <span><strong>Growing Media:</strong> 6-24" engineered soil</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">3</span>
                      <span><strong>Filter Fabric:</strong> Prevents soil migration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">4</span>
                      <span><strong>Drainage Layer:</strong> Cups or aggregate</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">5</span>
                      <span><strong>XPS Insulation:</strong> 60 PSI (PLAZAMATE)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">6</span>
                      <span><strong>Root Barrier:</strong> If not integral to membrane</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">7</span>
                      <span><strong>Waterproofing:</strong> Hot fluid-applied or sheet</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">8</span>
                      <span><strong>Structural Deck:</strong> Concrete (typ.)</span>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Load Considerations */}
              <div className="bg-slate-700/30 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-white mb-3">Green Roof Load Considerations</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-400">15-25 PSF</div>
                    <div className="text-slate-400 text-sm">Extensive (Sedum)</div>
                    <div className="text-slate-500 text-xs">3-6" media, saturated</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">35-50 PSF</div>
                    <div className="text-slate-400 text-sm">Semi-Intensive</div>
                    <div className="text-slate-500 text-xs">6-12" media, saturated</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">80-150 PSF</div>
                    <div className="text-slate-400 text-sm">Intensive</div>
                    <div className="text-slate-500 text-xs">12-24"+ media, saturated</div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mt-4">
                  Always verify structural capacity before specifying green roof systems. Loads shown are approximate
                  and vary by media type and moisture content. Consult structural engineer.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            <InsulationCalculator />
          </div>
        )}

      </div>
    </div>
  );
}

// Insulation Calculator Component
function InsulationCalculator() {
  const [squareFeet, setSquareFeet] = useState<number>(10000);
  const [insulationType, setInsulationType] = useState<string>('polyiso');
  const [thickness, setThickness] = useState<number>(2);
  const [pricePerBF, setPricePerBF] = useState<number>(0.45);

  const rValues: Record<string, number> = {
    polyiso: 5.7,
    xps: 5.0,
    epsII: 4.2,
    epsI: 3.8,
    mineralWool: 3.7
  };

  const insulationNames: Record<string, string> = {
    polyiso: 'Polyisocyanurate',
    xps: 'XPS (Extruded Polystyrene)',
    epsII: 'EPS Type II',
    epsI: 'EPS Type I',
    mineralWool: 'Mineral Wool'
  };

  const boardFeet = squareFeet * thickness;
  const totalRValue = rValues[insulationType] * thickness;
  const materialCost = boardFeet * pricePerBF;
  const costPerSF = materialCost / squareFeet;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6">Insulation Calculator</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">Roof Area (Square Feet)</label>
            <input
              type="number"
              value={squareFeet}
              onChange={(e) => setSquareFeet(Number(e.target.value) || 0)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">Insulation Type</label>
            <select
              value={insulationType}
              onChange={(e) => setInsulationType(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.entries(insulationNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">Thickness (inches)</label>
            <select
              value={thickness}
              onChange={(e) => setThickness(Number(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6].map((t) => (
                <option key={t} value={t}>{t}"</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">Price per Board Foot ($)</label>
            <input
              type="number"
              step="0.01"
              value={pricePerBF}
              onChange={(e) => setPricePerBF(Number(e.target.value) || 0)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-700/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Calculation Results</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-600">
              <span className="text-slate-300">R-Value per inch:</span>
              <span className="text-white font-semibold">R-{rValues[insulationType]}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-600">
              <span className="text-slate-300">Total R-Value:</span>
              <span className="text-emerald-400 font-bold text-xl">R-{totalRValue.toFixed(1)}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-600">
              <span className="text-slate-300">Board Feet Required:</span>
              <span className="text-white font-semibold">{boardFeet.toLocaleString()} BF</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-600">
              <span className="text-slate-300">Cost per SF:</span>
              <span className="text-white font-semibold">${costPerSF.toFixed(2)}/SF</span>
            </div>

            <div className="flex justify-between items-center py-3 bg-emerald-500/10 rounded-lg px-4 mt-4">
              <span className="text-emerald-400 font-semibold">Estimated Material Cost:</span>
              <span className="text-emerald-400 font-bold text-2xl">${materialCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <p className="text-slate-500 text-xs mt-4">
            * Estimate only. Does not include labor, adhesives, fasteners, or waste factor.
            Pricing varies by region and market conditions.
          </p>
        </div>
      </div>

      {/* Code Compliance Check */}
      <div className="mt-8 pt-6 border-t border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Code Compliance Check</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { zone: 'Zone 1-3', req: 25, met: totalRValue >= 25 },
            { zone: 'Zone 4-5', req: 30, met: totalRValue >= 30 },
            { zone: 'Zone 6-7', req: 35, met: totalRValue >= 35 },
            { zone: 'Zone 8', req: 40, met: totalRValue >= 40 },
          ].map((item, i) => (
            <div
              key={i}
              className={`rounded-lg p-4 text-center ${
                item.met
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              <div className="text-slate-300 text-sm">{item.zone}</div>
              <div className="text-white font-semibold">R-{item.req} req.</div>
              <div className={`text-sm mt-1 ${item.met ? 'text-emerald-400' : 'text-red-400'}`}>
                {item.met ? '✓ Compliant' : '✗ Below code'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
