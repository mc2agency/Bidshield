import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | MC2 Estimating',
  description: 'Simple, transparent pricing for professional roofing estimating tools. Choose individual templates or get everything with MC2 Pro access.',
  keywords: 'roofing templates pricing, estimating tools cost, MC2 Pro pricing',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Simple, Transparent
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Pricing</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto">
              Pay once for individual tools, or get everything with MC2 Pro access.
              No hidden fees, no surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Individual Templates */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-slate-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Individual Tools</h3>
                <div className="text-4xl font-bold text-slate-900 mb-2">$29-$79</div>
                <p className="text-slate-600">One-time payment</p>
              </div>
              <ul className="space-y-4 mb-8">
                <PricingItem included={true} text="Single template or tool" />
                <PricingItem included={true} text="Instant download" />
                <PricingItem included={true} text="Lifetime updates" />
                <PricingItem included={true} text="30-day money-back guarantee" />
                <PricingItem included={false} text="Full tool vault access" />
                <PricingItem included={false} text="Priority support" />
              </ul>
              <Link
                href="/products"
                className="block w-full text-center px-6 py-4 bg-slate-100 text-slate-900 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Browse Tools
              </Link>
            </div>

            {/* Template Bundle */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-8 text-white relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                  BEST VALUE
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Template Bundle</h3>
                <div className="text-4xl font-bold mb-2">$129</div>
                <p className="text-emerald-100">One-time payment</p>
              </div>
              <ul className="space-y-4 mb-8">
                <PricingItem included={true} text="All 5 roofing system templates" light={true} />
                <PricingItem included={true} text="Estimating checklist" light={true} />
                <PricingItem included={true} text="Proposal templates" light={true} />
                <PricingItem included={true} text="Material calculators" light={true} />
                <PricingItem included={true} text="Lifetime updates" light={true} />
                <PricingItem included={true} text="30-day money-back guarantee" light={true} />
              </ul>
              <GumroadCheckoutButton
                productKey="templateBundle"
                text="Get the Bundle"
                variant="secondary"
                className="w-full text-lg"
              />
            </div>

            {/* MC2 Pro */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-slate-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">MC2 Pro Access</h3>
                <div className="text-4xl font-bold text-slate-900 mb-2">$197<span className="text-xl">/mo</span></div>
                <p className="text-slate-600">First month $97</p>
              </div>
              <ul className="space-y-4 mb-8">
                <PricingItem included={true} text="Complete tool vault access" />
                <PricingItem included={true} text="All templates & calculators" />
                <PricingItem included={true} text="Priority support" />
                <PricingItem included={true} text="Monthly updates" />
                <PricingItem included={true} text="New tools as released" />
                <PricingItem included={true} text="Cancel anytime" />
              </ul>
              <GumroadCheckoutButton
                productKey="mc2ProMonthly"
                text="Start Free Trial"
                variant="primary"
                className="w-full text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Individual Product Pricing */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Individual Tool Pricing
            </h2>
            <p className="text-xl text-slate-600">
              Purchase exactly what you need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PriceCard title="Roofing System Templates" price="$39" description="Individual templates for TPO, shingle, metal, tile, or spray foam" />
            <PriceCard title="Estimating Checklist" price="$29" description="Comprehensive checklist to never miss a cost item" />
            <PriceCard title="Proposal Templates" price="$79" description="Professional proposal templates for 8 roofing systems" />
            <PriceCard title="Lead Generation Guide" price="$39" description="Complete playbook for finding construction leads" />
            <PriceCard title="Insurance & Compliance Guide" price="$49" description="Everything about contractor insurance requirements" />
            <PriceCard title="OSHA Safety Guide" price="$39" description="Safety compliance requirements for roofing" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Pricing Questions
            </h2>
          </div>

          <div className="space-y-6">
            <FAQItem
              question="Can I upgrade from individual tools to MC2 Pro?"
              answer="Yes! When you upgrade to MC2 Pro, you get access to the complete tool vault. Your previous purchases are not credited, but most users find the Pro access provides far more value than individual purchases."
            />
            <FAQItem
              question="Is there a discount for annual payment?"
              answer="Yes, pay annually for $1,970/year (instead of $2,364) and save $394. That's like getting 2 months free."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal through our secure payment processor."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="Yes, all purchases come with a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of contractors using MC2 tools to build accurate bids faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-colors"
            >
              Browse All Tools
            </Link>
            <GumroadCheckoutButton
              productKey="templateBundle"
              text="Get Template Bundle - $129"
              variant="large"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function PricingItem({ included, text, light = false }: { included: boolean; text: string; light?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      {included ? (
        <svg className={`w-5 h-5 flex-shrink-0 ${light ? 'text-emerald-200' : 'text-emerald-500'}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <span className={`text-sm ${!included && !light ? 'text-slate-400' : ''}`}>{text}</span>
    </li>
  );
}

function PriceCard({ title, price, description }: { title: string; price: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <span className="text-xl font-bold text-emerald-600">{price}</span>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-6">
      <h3 className="font-bold text-slate-900 mb-2">{question}</h3>
      <p className="text-slate-600">{answer}</p>
    </div>
  );
}
