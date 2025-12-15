import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';
import { GumroadProductKey } from '@/lib/gumroad-products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products & Templates | MC2 Estimating Academy',
  description: 'Professional roofing estimating templates, checklists, and business guides. Excel templates for asphalt shingle, TPO, metal, tile, and spray foam roofing systems.',
  keywords: 'roofing templates, estimating checklist, proposal templates, roofing estimate template, construction templates',
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Professional Estimating
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Tools & Templates</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Everything you need to create accurate estimates, win more bids, and run a professional contracting business.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Instant Download</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Lifetime Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>30-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product - Template Bundle */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative">
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                BEST VALUE
              </div>
              <div className="p-8 sm:p-12 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl">📦</span>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold">Complete Template Bundle</h2>
                    <p className="text-blue-100">Save $200+ when you buy the bundle</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <div>
                    <p className="text-lg text-blue-100 mb-6">
                      Get all 5 roofing system templates, estimating checklist, and proposal library in one complete package.
                      Everything you need to estimate any roofing project professionally.
                    </p>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold">$129</span>
                        <span className="text-2xl text-blue-200 line-through">$329</span>
                      </div>
                      <p className="text-sm text-blue-200">One-time payment • Save $200</p>
                    </div>

                    <GumroadCheckoutButton
                      productKey="templateBundle"
                      text="Buy Template Bundle - $129"
                      variant="large"
                      className="w-full sm:w-auto"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-xl mb-4">What's Included:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>All 5 Roofing System Templates (Asphalt, TPO/PVC/EPDM, Metal, Tile, Spray Foam)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Complete Estimating Checklist - Never miss a cost item</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Professional Proposal Template Library (8 system templates)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Material takeoff calculators with waste factors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Labor estimators with burden calculations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>General conditions breakdown templates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Lifetime updates and improvements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>30-day money-back guarantee</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Templates */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Individual Roofing System Templates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Need just one system? Purchase individual templates for the roofing systems you specialize in.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard
              icon="🏠"
              title="Asphalt Shingle Template"
              price="$39"
              description="Complete estimating template for residential and commercial asphalt shingle roofing projects."
              productKey="asphaltShingle"
              features={[
                "Shingle material calculator with waste",
                "Underlayment and ice/water shield",
                "Starter strip and ridge cap calculations",
                "Labor rates by pitch and complexity",
                "Pitch multiplier charts included"
              ]}
            />

            <ProductCard
              icon="🏢"
              title="TPO/PVC/EPDM Template"
              price="$39"
              description="Single-ply roofing systems template for flat and low-slope commercial roofs."
              productKey="tpoTemplate"
              features={[
                "Membrane calculations by attachment type",
                "Insulation layer takeoffs",
                "Fastener pattern calculators",
                "Flashing and edge detail quantities",
                "Seam and penetration calculations"
              ]}
            />

            <ProductCard
              icon="🔩"
              title="Metal Roofing Template"
              price="$39"
              description="Standing seam and corrugated metal roofing estimation system."
              productKey="metalRoofing"
              features={[
                "Panel coverage calculations",
                "Standing seam vs corrugated options",
                "Trim and flashing takeoff",
                "Fastener quantities by system",
                "Underlayment and accessories"
              ]}
            />

            <ProductCard
              icon="🏛️"
              title="Tile Roofing Template"
              price="$39"
              description="Clay and concrete tile roofing estimation for residential and commercial projects."
              productKey="tileRoofing"
              features={[
                "Tile coverage per square calculations",
                "Batten and lath material takeoff",
                "Mortar and adhesive quantities",
                "Hip and ridge tile calculations",
                "Labor rates by tile type"
              ]}
            />

            <ProductCard
              icon="💨"
              title="Spray Foam Insulation Template"
              price="$39"
              description="SPF roofing and insulation system estimation template."
              productKey="sprayFoam"
              features={[
                "Spray foam coverage calculators",
                "Coating application rates",
                "Multi-layer system breakdown",
                "R-value and thickness planning",
                "Material yield calculations"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Additional Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Business Tools & Guides
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional resources to help you run a successful contracting business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard
              icon="✅"
              title="Estimating Checklist"
              price="$29"
              description="Never miss a cost item again with this comprehensive estimating checklist."
              productKey="estimatingChecklist"
              features={[
                "Complete line-item checklist",
                "Material, labor, and equipment sections",
                "General conditions breakdown",
                "Common missed items highlighted",
                "Customizable for your business"
              ]}
            />

            <ProductCard
              icon="📄"
              title="Proposal Template Library"
              price="$79"
              description="Professional proposal templates for 8 different roofing systems."
              productKey="proposalTemplates"
              features={[
                "8 system-specific proposal templates",
                "Cover letter templates (3 versions)",
                "Scope of work language library",
                "Payment terms and warranty templates",
                "Exclusions and assumptions checklist"
              ]}
            />

            <ProductCard
              icon="📋"
              title="Lead Generation Guide"
              price="$39"
              description="Complete playbook for finding and tracking construction leads."
              productKey="leadGenGuide"
              features={[
                "BuildingConnected tutorial",
                "Dodge and PlanHub strategies",
                "Government bidding (SAM.gov guide)",
                "GC relationship building system",
                "Lead tracking spreadsheet template"
              ]}
            />

            <ProductCard
              icon="🛡️"
              title="Insurance & Compliance Guide"
              price="$49"
              description="Everything you need to know about contractor insurance and compliance."
              productKey="insuranceGuide"
              features={[
                "Complete insurance requirements guide",
                "Certificate of Insurance templates",
                "Additional Insured requirements",
                "Workers Comp and EMR explained",
                "Compliance checklist by state"
              ]}
            />

            <ProductCard
              icon="⚠️"
              title="OSHA Safety Guide"
              price="$39"
              description="OSHA compliance and safety requirements for roofing contractors."
              productKey="oshaGuide"
              features={[
                "OSHA 10/30 hour training guide",
                "Fall protection requirements",
                "Site safety checklist",
                "PPE requirements by task",
                "Competent person training outline"
              ]}
            />

            <ProductCard
              icon="💻"
              title="Technology Setup Guide"
              price="$29"
              description="Complete technology stack setup for professional estimators."
              productKey="techSetupGuide"
              features={[
                "Computer specifications guide",
                "Software recommendations and budget",
                "Large format printer (plotter) guide",
                "Backup and data security setup",
                "Internet and cloud storage needs"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Bundles Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete Bundles
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Save big with our bundled packages. Get everything you need at a fraction of the individual cost.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <BundleCard
              title="Starter Bundle"
              price="$297"
              originalPrice="$404"
              savings="Save $107"
              description="Perfect for getting started with professional estimating."
              productKey="starterBundle"
              features={[
                "Complete Template Bundle ($129)",
                "Estimating Checklist ($29)",
                "Lead Generation Guide ($39)",
                "Technology Setup Guide ($29)",
                "OSHA Safety Guide ($39)",
                "Insurance & Compliance Guide ($49)",
                "Proposal Template Library ($79)",
                "Lifetime updates included"
              ]}
              highlighted={false}
            />

            <BundleCard
              title="Professional Bundle"
              price="$797"
              originalPrice="$1,491"
              savings="Save $694"
              description="Everything in Starter Bundle plus all premium courses."
              productKey="professionalBundle"
              features={[
                "Everything in Starter Bundle",
                "Estimating Fundamentals Course ($497)",
                "Bluebeam Mastery Course ($147)",
                "Submittals Course ($197)",
                "Estimating Software Course ($197)",
                "Measurement Technology ($97)",
                "SketchUp Visualization ($97)",
                "Priority email support"
              ]}
              highlighted={true}
            />

            <BundleCard
              title="Complete Academy"
              price="$997"
              originalPrice="$1,985"
              savings="Save $988"
              description="Ultimate package - every product and course we offer."
              productKey="completeAcademy"
              features={[
                "Everything in Professional Bundle",
                "AutoCAD for Submittals ($247)",
                "Private community access",
                "Monthly live Q&A sessions",
                "Priority support",
                "All future courses included",
                "Certificate of completion",
                "Lifetime access to everything"
              ]}
              highlighted={false}
            />
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Need custom training for your team?
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Contact Us for Corporate Training
            </Link>
            <p className="text-sm text-gray-500 mt-2">Custom packages starting at $5,000</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <FAQItem
              question="What format are the templates in?"
              answer="All templates are provided in Microsoft Excel format (.xlsx) for maximum compatibility and ease of use. They work on both Windows and Mac, and are also compatible with Google Sheets if you prefer cloud-based solutions."
            />

            <FAQItem
              question="Can I customize the templates for my business?"
              answer="Absolutely! All templates are fully editable and designed to be customized with your company information, pricing, and local market rates. We encourage you to adapt them to your specific business needs."
            />

            <FAQItem
              question="Do you offer refunds?"
              answer="Yes, we offer a 30-day money-back guarantee on all products. If you're not satisfied for any reason, simply contact us within 30 days of purchase for a full refund, no questions asked."
            />

            <FAQItem
              question="How quickly will I receive my purchase?"
              answer="Instantly! After completing your purchase, you'll immediately receive a download link via email. You can start using your templates and guides right away."
            />

            <FAQItem
              question="Are the templates updated regularly?"
              answer="Yes! When you purchase any product, you get lifetime access to all future updates and improvements at no additional cost. We regularly update templates based on industry changes and customer feedback."
            />

            <FAQItem
              question="Can I use these templates for unlimited projects?"
              answer="Yes, once you purchase a template or bundle, you can use it for as many projects as you need within your own business. The only restriction is that you cannot resell or redistribute the templates to others."
            />

            <FAQItem
              question="What's the difference between products and courses?"
              answer="Products (templates, guides, checklists) are downloadable resources you can use immediately. Courses include video lessons, step-by-step training, and more in-depth education. Both are valuable - products give you tools, courses teach you how to use them effectively."
            />
          </div>
        </div>
      </section>

      {/* Money-Back Guarantee Badge */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              30-Day Money-Back Guarantee
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              We're confident you'll love our products. If you're not completely satisfied within 30 days,
              we'll refund your purchase - no questions asked.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Instant Download</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Lifetime Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Email Support</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>No Subscription</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Estimating Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of contractors who save time and increase accuracy with our professional templates and tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GumroadCheckoutButton
              productKey="templateBundle"
              text="Get Template Bundle - $129"
              variant="large"
            />
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-lg border-2 border-blue-600"
            >
              View All Courses
            </Link>
          </div>
          <p className="mt-6 text-sm text-blue-200">
            Questions? <Link href="/contact" className="underline hover:text-white">Contact us</Link> - we're here to help!
          </p>
        </div>
      </section>
    </main>
  );
}

// Product Card Component
function ProductCard({
  icon,
  title,
  price,
  description,
  features,
  productKey = 'templateBundle',
}: {
  icon: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  productKey?: GumroadProductKey;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-blue-500 flex flex-col">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <div className="text-3xl font-bold text-blue-600 mb-4">{price}</div>
      <p className="text-gray-600 mb-6 flex-grow">{description}</p>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <GumroadCheckoutButton
        productKey={productKey}
        text="Buy Now"
        variant="primary"
        className="w-full"
      />
    </div>
  );
}

// Bundle Card Component
function BundleCard({
  title,
  price,
  originalPrice,
  savings,
  description,
  features,
  highlighted,
  productKey = 'starterBundle',
}: {
  title: string;
  price: string;
  originalPrice: string;
  savings: string;
  description: string;
  features: string[];
  highlighted: boolean;
  productKey?: GumroadProductKey;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 border-2 ${
      highlighted ? 'border-blue-600 ring-4 ring-blue-100' : 'border-gray-200'
    } relative flex flex-col`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
          MOST POPULAR
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>

        <div className="mb-2">
          <span className="text-4xl font-bold text-blue-600">{price}</span>
        </div>
        <div className="text-sm text-gray-500 line-through mb-1">{originalPrice}</div>
        <div className="text-green-600 font-semibold">{savings}</div>
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <GumroadCheckoutButton
        productKey={productKey}
        text={`Get ${title}`}
        variant="primary"
        className="w-full"
      />
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
