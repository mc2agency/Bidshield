'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function MembershipPage() {
  const [showStickyButton, setShowStickyButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-700/50 rounded-full text-sm font-semibold">
              Unlimited Access • Everything Included
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Get Everything.
              <br />
              <span className="text-blue-300">Pay Once Per Month.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Access every course, template, and tool in MC2 Estimating Academy. No limits, no extra charges.
            </p>

            {/* Pricing Card */}
            <div className="max-w-xl mx-auto bg-white text-gray-900 rounded-2xl shadow-2xl p-8 mb-8">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 mb-2">MC2 Pro Membership</div>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-2xl text-gray-400 line-through">$197</span>
                  <span className="text-5xl font-bold text-blue-600">$97</span>
                  <span className="text-xl text-gray-600">/month</span>
                </div>
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  First Month Only - Save $100!
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <button className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg shadow-lg">
                  Start 7-Day Free Trial
                </button>
                <button className="flex-1 px-8 py-4 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-lg">
                  Pay Annually - Save $394
                </button>
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
              Everything You Need to Master Estimating
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              One membership gives you unlimited access to our entire library of courses, templates, and tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* All Courses */}
            <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-blue-600">📚</span> Access to ALL Courses
              </h3>
              <ul className="space-y-3">
                <IncludedItem name="Estimating Fundamentals Course" value="$497" />
                <IncludedItem name="Bluebeam Mastery Course" value="$147" />
                <IncludedItem name="AutoCAD for Submittals Course" value="$247" />
                <IncludedItem name="SketchUp Visualization Course" value="$97" />
                <IncludedItem name="Measurement Technology Course" value="$97" />
                <IncludedItem name="Construction Submittals Course" value="$197" />
                <IncludedItem name="Estimating Software Course" value="$197" />
              </ul>
              <div className="mt-6 pt-6 border-t border-blue-300">
                <p className="text-sm font-semibold text-blue-900">
                  Total Value: $1,479
                </p>
              </div>
            </div>

            {/* All Templates & Tools */}
            <div className="bg-green-50 rounded-xl p-8 border-2 border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-green-600">🛠️</span> All Templates & Tools
              </h3>
              <ul className="space-y-3">
                <IncludedItem name="Complete Template Bundle (5 Systems)" value="$129" />
                <IncludedItem name="Estimating Checklist" value="$29" />
                <IncludedItem name="Proposal Template Library" value="$79" />
                <IncludedItem name="Lead Generation Playbook" value="$39" />
                <IncludedItem name="Insurance & Compliance Guide" value="$49" />
                <IncludedItem name="OSHA Safety Guide" value="$39" />
                <IncludedItem name="Technology Setup Guide" value="$29" />
                <IncludedItem name="Green Roof System Templates" value="$79" />
              </ul>
              <div className="mt-6 pt-6 border-t border-green-300">
                <p className="text-sm font-semibold text-green-900">
                  Total Value: $472
                </p>
              </div>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="grid md:grid-cols-3 gap-6">
            <BenefitCard
              icon="💬"
              title="Monthly Live Q&A Sessions"
              description="Get your questions answered directly by industry experts in live monthly calls."
            />
            <BenefitCard
              icon="👥"
              title="Private Community Access"
              description="Connect with other estimators, share insights, and grow your network."
            />
            <BenefitCard
              icon="📊"
              title="Monthly Price List Updates"
              description="Stay current with the latest material and labor pricing for accurate estimates."
            />
            <BenefitCard
              icon="🚀"
              title="New Content as Released"
              description="2-3 new courses, templates, or tools added every month at no extra cost."
            />
            <BenefitCard
              icon="⚡"
              title="Priority Email Support"
              description="Get fast responses to your questions with priority member support."
            />
            <BenefitCard
              icon="📥"
              title="Downloadable Resources Library"
              description="Download and keep all templates, checklists, and guides for offline use."
            />
            <BenefitCard
              icon="🏆"
              title="Certificate Programs"
              description="Earn professional certificates to showcase your estimating expertise."
            />
            <BenefitCard
              icon="🎁"
              title="Exclusive Member Bonuses"
              description="Access to members-only webinars, case studies, and advanced techniques."
            />
            <BenefitCard
              icon="🔄"
              title="Lifetime Updates"
              description="All content updates and improvements included while you're a member."
            />
          </div>
        </div>
      </section>

      {/* Value Calculation */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">
            The Math is Simple
          </h2>
          <div className="bg-blue-800/50 rounded-2xl p-8 backdrop-blur">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-sm text-blue-200 mb-2">If Bought Separately</div>
                <div className="text-4xl font-bold text-red-400">$2,338</div>
              </div>
              <div>
                <div className="text-sm text-blue-200 mb-2">Your Price (First Month)</div>
                <div className="text-4xl font-bold text-green-400">$97</div>
              </div>
              <div>
                <div className="text-sm text-blue-200 mb-2">You Save</div>
                <div className="text-4xl font-bold text-yellow-400">$2,241</div>
              </div>
            </div>
            <p className="text-lg text-blue-100">
              Get everything for less than the cost of a single course. That's over 95% savings in your first month alone.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Path
            </h2>
            <p className="text-xl text-gray-600">
              Compare your options and see why MC2 Pro is the best value
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                <p className="text-gray-600">Learning Center Only</p>
              </div>
              <ul className="space-y-4 mb-8">
                <ComparisonItem included={true} text="Access to blog articles" />
                <ComparisonItem included={true} text="Free educational videos" />
                <ComparisonItem included={true} text="Basic calculators" />
                <ComparisonItem included={false} text="Premium courses" />
                <ComparisonItem included={false} text="Templates & tools" />
                <ComparisonItem included={false} text="Live Q&A sessions" />
                <ComparisonItem included={false} text="Community access" />
                <ComparisonItem included={false} text="Priority support" />
              </ul>
              <Link
                href="/learning"
                className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Browse Free Content
              </Link>
            </div>

            {/* Individual Products */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Individual Products</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$29-$497</div>
                <p className="text-gray-600">Pay per item</p>
              </div>
              <ul className="space-y-4 mb-8">
                <ComparisonItem included={true} text="Lifetime access to purchased items" />
                <ComparisonItem included={true} text="Download templates" />
                <ComparisonItem included={true} text="Course certificates" />
                <ComparisonItem included={false} text="Full library access" />
                <ComparisonItem included={false} text="Monthly updates" />
                <ComparisonItem included={false} text="Live Q&A sessions" />
                <ComparisonItem included={false} text="Community access" />
                <ComparisonItem included={false} text="Priority support" />
              </ul>
              <Link
                href="/products"
                className="block w-full text-center px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Browse Products
              </Link>
              <p className="mt-4 text-xs text-center text-gray-500">
                Total cost to buy all: $2,338+
              </p>
            </div>

            {/* MC2 Pro - Best Value */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-2xl p-8 border-4 border-yellow-400 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                  BEST VALUE
                </span>
              </div>
              <div className="text-center mb-6 text-white">
                <h3 className="text-2xl font-bold mb-2">MC2 Pro Membership</h3>
                <div className="text-4xl font-bold mb-2">$197<span className="text-xl">/mo</span></div>
                <p className="text-blue-100">First month only $97</p>
              </div>
              <ul className="space-y-4 mb-8 text-white">
                <ComparisonItem included={true} text="ALL courses & templates" light={true} />
                <ComparisonItem included={true} text="Full library access" light={true} />
                <ComparisonItem included={true} text="Monthly live Q&A" light={true} />
                <ComparisonItem included={true} text="Private community" light={true} />
                <ComparisonItem included={true} text="Monthly price updates" light={true} />
                <ComparisonItem included={true} text="New content monthly" light={true} />
                <ComparisonItem included={true} text="Priority support" light={true} />
                <ComparisonItem included={true} text="Certificate programs" light={true} />
              </ul>
              <button className="w-full px-6 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors text-lg shadow-lg">
                Start Free Trial
              </button>
              <p className="mt-4 text-xs text-center text-blue-100">
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
              Members Are Winning More Bids
            </h2>
            <p className="text-xl text-gray-600">
              See how MC2 Pro has transformed their estimating businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="The membership paid for itself after I landed my first commercial job using the Bluebeam course. I went from residential shingles to $250K TPO projects in 3 months."
              author="Mike Richardson"
              role="Owner, Richardson Roofing"
              roi="ROI: 127x in first quarter"
            />
            <TestimonialCard
              quote="I was spending 4-5 hours per estimate and still missing items. Now I'm down to 45 minutes and my accuracy has improved dramatically. Won 8 out of 10 last bids."
              author="Sarah Chen"
              role="Estimator, Apex Construction"
              roi="Time savings: 85%"
            />
            <TestimonialCard
              quote="The monthly Q&A sessions alone are worth the price. Being able to ask questions about real projects I'm working on has been invaluable. Best investment I've made."
              author="James Martinez"
              role="Estimating Manager, Summit Contractors"
              roi="Increased win rate from 32% to 58%"
            />
            <TestimonialCard
              quote="I bought individual courses before joining as a member. Wish I had just started with the membership - would have saved over $1,500 and had access to everything from day one."
              author="David Thompson"
              role="Independent Contractor"
              roi="Saved $1,500+ vs buying separately"
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
              answer="Yes, absolutely. There are no contracts or commitments. You can cancel your membership at any time from your account settings, and you'll retain access until the end of your current billing period."
            />
            <FAQItem
              question="Do I get to keep the content if I cancel?"
              answer="You'll have access to all content while you're an active member. If you cancel, you'll lose access to the courses and tools, but any templates or resources you've downloaded are yours to keep. Think of it like Netflix - you have access while subscribed."
            />
            <FAQItem
              question="Is there a discount for annual payment?"
              answer="Yes! Pay annually for $1,970/year (instead of $2,364) and save $394. That's like getting 2 months free. Annual members also get exclusive bonuses and first access to new content."
            />
            <FAQItem
              question="What's the refund policy?"
              answer="We offer a 30-day money-back guarantee, no questions asked. If MC2 Pro isn't right for you, just email us within 30 days of joining and we'll refund your payment in full. We want you to be completely satisfied."
            />
            <FAQItem
              question="How often is new content added?"
              answer="We add 2-3 new items every month - this could be new courses, updated templates, fresh case studies, or new tools. All updates are included in your membership at no extra charge. You'll be notified by email when new content is available."
            />
            <FAQItem
              question="What if I only need one or two courses?"
              answer="If you only need specific items, buying them individually might make sense. However, most contractors find they need multiple resources. The membership becomes more valuable than individual purchases after just 2-3 items, plus you get ongoing updates and support."
            />
            <FAQItem
              question="Is the 7-day free trial really free?"
              answer="Yes, completely free. We won't charge you anything during your 7-day trial. You'll get full access to everything. If you love it (we think you will), you'll be charged $97 for your first month after the trial ends. If not, cancel before the trial ends and pay nothing."
            />
            <FAQItem
              question="Can I use this for my whole team?"
              answer="Individual memberships are for single users. For teams of 3+ estimators, we offer corporate packages with volume discounts and team management features. Contact us at team@mc2estimating.com for custom pricing."
            />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <TrustBadge
              icon="💯"
              title="30-Day Money-Back"
              subtitle="Full refund guarantee"
            />
            <TrustBadge
              icon="🔓"
              title="Cancel Anytime"
              subtitle="No long-term contracts"
            />
            <TrustBadge
              icon="📋"
              title="No Commitments"
              subtitle="Month-to-month billing"
            />
            <TrustBadge
              icon="🔒"
              title="Secure Payment"
              subtitle="256-bit SSL encryption"
            />
          </div>
        </div>
      </section>

      {/* Not Ready Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Not Ready for a Membership?
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            No problem. Here are some other ways to get started:
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <AlternativeCard
              title="Free Learning Center"
              description="Start with our free blog articles, videos, and calculators."
              price="Free"
              href="/learning"
              buttonText="Browse Free Content"
            />
            <AlternativeCard
              title="Template Bundle"
              description="Get all 5 roofing system templates with estimating checklists."
              price="$129"
              href="/products/template-bundle"
              buttonText="Buy Templates"
            />
            <AlternativeCard
              title="Individual Courses"
              description="Purchase just the courses you need, one at a time."
              price="From $97"
              href="/courses"
              buttonText="View Courses"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Estimating Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of contractors who are estimating faster, winning more bids, and growing their businesses with MC2 Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button className="px-8 py-4 bg-white text-blue-900 rounded-lg font-bold hover:bg-blue-50 transition-colors text-lg shadow-lg">
              Start 7-Day Free Trial
            </button>
            <button className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-lg border-2 border-blue-600">
              Pay Annually - Save $394
            </button>
          </div>
          <p className="text-sm text-blue-200">
            First month $97 (then $197/mo) • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Sticky Button */}
      {showStickyButton && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-600 shadow-2xl z-40 py-4 transform transition-transform duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="font-bold text-gray-900">MC2 Pro Membership</div>
              <div className="text-sm text-gray-600">
                First month $97, then $197/month • Cancel anytime
              </div>
            </div>
            <button className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg">
              Start Free Trial
            </button>
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

// Component: Trust Badge
function TrustBadge({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="font-bold text-gray-900 text-sm">{title}</div>
      <div className="text-gray-600 text-xs">{subtitle}</div>
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
      <div className="text-2xl font-bold text-blue-600 mb-4">{price}</div>
      <Link
        href={href}
        className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
      >
        {buttonText}
      </Link>
    </div>
  );
}
