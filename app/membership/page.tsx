'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function MembershipPage() {
  const [showStickyButton, setShowStickyButton] = useState(false);
  const ticking = useRef(false);

  const updateScrollState = useCallback(() => {
    setShowStickyButton(window.scrollY > 600);
    ticking.current = false;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateScrollState);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateScrollState]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm font-semibold">
              Complete Tool Vault Access
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Get Every Tool.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">One Monthly Access Fee.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Access the complete MC2 tool vault - all templates, calculators, and resources. Plus ongoing updates.
            </p>

            {/* Pricing Card */}
            <div className="max-w-xl mx-auto bg-white text-gray-900 rounded-2xl shadow-2xl p-8 mb-8">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 mb-2">MC2 Pro Access</div>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-2xl text-gray-400 line-through">$197</span>
                  <span className="text-5xl font-bold text-emerald-600">$97</span>
                  <span className="text-xl text-gray-600">/month</span>
                </div>
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  First Month Only - Save $100!
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <GumroadCheckoutButton
                  productKey="mc2ProMonthly"
                  text="Start 7-Day Free Trial"
                  variant="primary"
                  className="flex-1 text-lg shadow-lg"
                />
                <GumroadCheckoutButton
                  productKey="mc2ProYearly"
                  text="Pay Annually - Save $394"
                  variant="secondary"
                  className="flex-1 text-lg"
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Then $197/month • Cancel anytime • 30-day money-back guarantee
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>30-day money-back</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No contracts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete Tool Vault Access
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              One subscription gives you access to our entire library of templates, calculators, and resources.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* All Templates */}
            <div className="bg-emerald-50 rounded-xl p-8 border-2 border-emerald-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-emerald-600">📊</span> All Estimating Templates
              </h3>
              <ul className="space-y-3">
                <IncludedItem name="Complete Template Bundle (5 Systems)" value="$129" />
                <IncludedItem name="Green Roof System Template" value="$79" />
                <IncludedItem name="SBS Modified Template" value="$39" />
                <IncludedItem name="Restoration Coating Template" value="$39" />
                <IncludedItem name="Estimating Checklist" value="$29" />
                <IncludedItem name="Proposal Template Library" value="$79" />
                <IncludedItem name="Material Calculators" value="$49" />
              </ul>
              <div className="mt-6 pt-6 border-t border-emerald-300">
                <p className="text-sm font-semibold text-emerald-900">
                  Total Value: $443
                </p>
              </div>
            </div>

            {/* All Guides & Tools */}
            <div className="bg-teal-50 rounded-xl p-8 border-2 border-teal-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-teal-600">🛠️</span> All Guides & Resources
              </h3>
              <ul className="space-y-3">
                <IncludedItem name="Lead Generation Playbook" value="$39" />
                <IncludedItem name="Insurance & Compliance Guide" value="$49" />
                <IncludedItem name="OSHA Safety Guide" value="$39" />
                <IncludedItem name="Technology Setup Guide" value="$29" />
                <IncludedItem name="Bluebeam Configuration Pack" value="$147" />
                <IncludedItem name="AutoCAD Submittal Templates" value="$247" />
                <IncludedItem name="SketchUp Component Library" value="$97" />
              </ul>
              <div className="mt-6 pt-6 border-t border-teal-300">
                <p className="text-sm font-semibold text-teal-900">
                  Total Value: $647
                </p>
              </div>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="grid md:grid-cols-3 gap-6">
            <BenefitCard
              icon="📥"
              title="Instant Downloads"
              description="Download any template or tool immediately. All files are yours to keep and use."
            />
            <BenefitCard
              icon="🔄"
              title="Ongoing Updates"
              description="Get updated versions automatically. We refresh pricing and improve tools regularly."
            />
            <BenefitCard
              icon="📊"
              title="New Tools Monthly"
              description="2-3 new templates, calculators, or guides added every month at no extra cost."
            />
            <BenefitCard
              icon="💬"
              title="Monthly Q&A Sessions"
              description="Get your questions answered directly in live monthly sessions."
            />
            <BenefitCard
              icon="⚡"
              title="Priority Support"
              description="Get fast responses to your questions with priority member support."
            />
            <BenefitCard
              icon="👥"
              title="Private Community"
              description="Connect with other contractors, share insights, and get feedback."
            />
          </div>
        </div>
      </section>

      {/* Value Calculation */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">
            The Math is Simple
          </h2>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-sm text-slate-300 mb-2">If Bought Separately</div>
                <div className="text-4xl font-bold text-red-400">$1,090</div>
              </div>
              <div>
                <div className="text-sm text-slate-300 mb-2">Your Price (First Month)</div>
                <div className="text-4xl font-bold text-green-400">$97</div>
              </div>
              <div>
                <div className="text-sm text-slate-300 mb-2">You Save</div>
                <div className="text-4xl font-bold text-yellow-400">$993</div>
              </div>
            </div>
            <p className="text-lg text-slate-300">
              Get everything for less than the cost of a single bundle. That&apos;s over 90% savings in your first month alone.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Option
            </h2>
            <p className="text-xl text-gray-600">
              Compare your options and see why MC2 Pro is the best value
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Individual Products */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Individual Tools</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$29-$129</div>
                <p className="text-gray-600">One-time purchase</p>
              </div>
              <ul className="space-y-4 mb-8">
                <ComparisonItem included={true} text="Lifetime access to purchased items" />
                <ComparisonItem included={true} text="Download templates immediately" />
                <ComparisonItem included={true} text="Lifetime updates included" />
                <ComparisonItem included={false} text="Full vault access" />
                <ComparisonItem included={false} text="New tools as released" />
                <ComparisonItem included={false} text="Monthly Q&A sessions" />
                <ComparisonItem included={false} text="Priority support" />
              </ul>
              <Link
                href="/products"
                className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Browse Tools
              </Link>
            </div>

            {/* Template Bundle */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Template Bundle</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$129</div>
                <p className="text-gray-600">One-time purchase</p>
              </div>
              <ul className="space-y-4 mb-8">
                <ComparisonItem included={true} text="All 5 roofing templates" />
                <ComparisonItem included={true} text="Estimating checklist" />
                <ComparisonItem included={true} text="Proposal templates" />
                <ComparisonItem included={true} text="Lifetime updates" />
                <ComparisonItem included={false} text="Additional templates" />
                <ComparisonItem included={false} text="Business guides" />
                <ComparisonItem included={false} text="Priority support" />
              </ul>
              <GumroadCheckoutButton
                productKey="templateBundle"
                text="Get Bundle - $129"
                variant="secondary"
                className="w-full"
              />
            </div>

            {/* MC2 Pro - Best Value */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl shadow-2xl p-8 text-white relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                  BEST VALUE
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">MC2 Pro Access</h3>
                <div className="text-4xl font-bold mb-2">$197<span className="text-xl">/mo</span></div>
                <p className="text-emerald-100">First month only $97</p>
              </div>
              <ul className="space-y-4 mb-8">
                <ComparisonItem included={true} text="ALL templates & tools" light={true} />
                <ComparisonItem included={true} text="Complete vault access" light={true} />
                <ComparisonItem included={true} text="Monthly Q&A sessions" light={true} />
                <ComparisonItem included={true} text="Private community" light={true} />
                <ComparisonItem included={true} text="Monthly updates" light={true} />
                <ComparisonItem included={true} text="New tools as released" light={true} />
                <ComparisonItem included={true} text="Priority support" light={true} />
              </ul>
              <GumroadCheckoutButton
                productKey="mc2ProMonthly"
                text="Start Free Trial"
                variant="secondary"
                className="w-full text-lg shadow-lg"
              />
              <p className="mt-4 text-xs text-center text-emerald-100">
                Cancel anytime • 30-day guarantee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              See how MC2 tools have helped contractors work faster
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="The templates paid for themselves on my first commercial bid. I went from spending 4 hours per estimate to under an hour."
              author="Mike Richardson"
              role="Owner, Richardson Roofing"
              roi="Time savings: 75%"
            />
            <TestimonialCard
              quote="I was missing line items on every estimate. The checklist alone has probably saved me thousands in forgotten costs."
              author="Sarah Chen"
              role="Estimator, Apex Construction"
              roi="Improved accuracy: 95%+"
            />
            <TestimonialCard
              quote="The monthly Q&A sessions are incredibly valuable. Being able to ask questions about real projects has been game-changing."
              author="James Martinez"
              role="Estimating Manager, Summit Contractors"
              roi="Win rate: +26%"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes, absolutely. There are no contracts or commitments. You can cancel your access at any time from your account settings, and you'll retain access until the end of your current billing period."
            />
            <FAQItem
              question="Do I get to keep the files if I cancel?"
              answer="Yes! Any templates or resources you've downloaded are yours to keep forever. You just won't have access to download new files or receive updates after cancellation."
            />
            <FAQItem
              question="Is there a discount for annual payment?"
              answer="Yes! Pay annually for $1,970/year (instead of $2,364) and save $394. That's like getting 2 months free."
            />
            <FAQItem
              question="What's the refund policy?"
              answer="We offer a 30-day money-back guarantee, no questions asked. If MC2 Pro isn't right for you, just email us within 30 days of joining and we'll refund your payment in full."
            />
            <FAQItem
              question="How often is new content added?"
              answer="We add 2-3 new items every month - new templates, updated calculators, or new guides. All updates are included in your access at no extra charge."
            />
            <FAQItem
              question="What if I only need a few templates?"
              answer="If you only need a few specific items, purchasing them individually might make sense. However, if you need 3+ tools, MC2 Pro access is usually more cost-effective."
            />
            <FAQItem
              question="Is the 7-day free trial really free?"
              answer="Yes, completely free. You'll get full access to everything during your trial. If you love it, you'll be charged $97 for your first month after the trial ends. If not, cancel before the trial ends and pay nothing."
            />
            <FAQItem
              question="Can I use this for my whole team?"
              answer="Individual access is for single users. For teams of 3+ estimators, we offer volume licensing with team management features. Contact us at team@mc2estimating.com for custom pricing."
            />
          </div>
        </div>
      </section>

      {/* Not Ready Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Not Ready for Pro Access?
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            No problem. Start with individual tools:
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <AlternativeCard
              title="Template Bundle"
              description="Get all 5 roofing system templates with estimating checklists."
              price="$129"
              href="/products/template-bundle"
              buttonText="Get Bundle"
            />
            <AlternativeCard
              title="Individual Templates"
              description="Purchase just the templates you need, one at a time."
              price="From $29"
              href="/products"
              buttonText="Browse Tools"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Access the Complete Tool Vault?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of contractors using MC2 tools to build accurate bids faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <GumroadCheckoutButton
              productKey="mc2ProMonthly"
              text="Start 7-Day Free Trial"
              variant="large"
              className="shadow-lg"
            />
            <GumroadCheckoutButton
              productKey="mc2ProYearly"
              text="Pay Annually - Save $394"
              variant="outline"
              className="text-lg"
            />
          </div>
          <p className="text-sm text-slate-400">
            First month $97 (then $197/mo) • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Sticky Button */}
      {showStickyButton && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-emerald-600 shadow-2xl z-40 py-4 transform transition-transform duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="font-bold text-gray-900">MC2 Pro Access</div>
              <div className="text-sm text-gray-600">
                First month $97, then $197/month • Cancel anytime
              </div>
            </div>
            <GumroadCheckoutButton
              productKey="mc2ProMonthly"
              text="Start Free Trial"
              variant="primary"
              className="w-full sm:w-auto shadow-lg"
            />
          </div>
        </div>
      )}
    </main>
  );
}

// Component: Included Item
function IncludedItem({ name, value }: { name: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-gray-700">
        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">{name}</span>
      </span>
      <span className="text-sm font-semibold text-gray-500">{value}</span>
    </li>
  );
}

// Component: Benefit Card
function BenefitCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

// Component: Comparison Item
function ComparisonItem({ included, text, light = false }: { included: boolean; text: string; light?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      {included ? (
        <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${light ? 'text-green-300' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <span className={`text-sm ${!included && !light ? 'text-gray-400' : ''}`}>{text}</span>
    </li>
  );
}

// Component: Testimonial Card
function TestimonialCard({ quote, author, role, roi }: { quote: string; author: string; role: string; roi: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-gray-700 mb-4 italic">&ldquo;{quote}&rdquo;</p>
      <div className="border-t pt-4">
        <p className="font-bold text-gray-900">{author}</p>
        <p className="text-sm text-gray-600">{role}</p>
        <p className="text-sm text-green-600 font-semibold mt-2">{roi}</p>
      </div>
    </div>
  );
}

// Component: FAQ Item
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-gray-900">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-700">
          {answer}
        </div>
      )}
    </div>
  );
}

// Component: Alternative Card
function AlternativeCard({
  title,
  description,
  price,
  href,
  buttonText
}: {
  title: string;
  description: string;
  price: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 text-sm">{description}</p>
      <div className="text-2xl font-bold text-emerald-600 mb-4">{price}</div>
      <Link
        href={href}
        className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
      >
        {buttonText}
      </Link>
    </div>
  );
}
