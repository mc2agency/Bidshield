import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with BidShield tools and templates. Documentation, FAQs, and contact support.',
  keywords: 'BidShield support, estimating tools help, template support, customer service',
  alternates: { canonical: 'https://www.bidshield.co/support' },
};

export default function SupportPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              How Can We
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Help You?</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto">
              Find answers in our documentation or reach out to our support team.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Help Options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <HelpCard
              icon="📖"
              title="Documentation"
              description="Step-by-step guides for using each template and tool."
              href="#documentation"
              linkText="View Docs"
            />
            <HelpCard
              icon="❓"
              title="FAQs"
              description="Quick answers to the most common questions."
              href="#faq"
              linkText="Browse FAQs"
            />
            <HelpCard
              icon="✉️"
              title="Contact Support"
              description="Can't find what you need? Email our team directly."
              href="/contact"
              linkText="Get in Touch"
            />
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section id="documentation" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tool Documentation
            </h2>
            <p className="text-xl text-slate-600">
              Walkthrough guides for getting the most out of your tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DocCard
              title="Template Bundle Setup"
              description="How to download, install, and configure your roofing templates."
              sections={['Download & extraction', 'Excel setup', 'Customizing for your business', 'Entering your pricing']}
            />
            <DocCard
              title="Estimating Checklist Usage"
              description="Guide to using the comprehensive estimating checklist effectively."
              sections={['Checklist overview', 'Customizing line items', 'Project-specific adjustments', 'Common missed items']}
            />
            <DocCard
              title="Proposal Templates"
              description="Creating professional proposals that win more bids."
              sections={['Template selection', 'Customization tips', 'Scope of work language', 'Terms and conditions']}
            />
            <DocCard
              title="Material Calculators"
              description="Using built-in calculators for accurate material takeoffs."
              sections={['Waste factor settings', 'Coverage rate tables', 'Unit conversions', 'Quantity verification']}
            />
            <DocCard
              title="Labor Worksheets"
              description="Configuring labor burden and productivity rates."
              sections={['Burden calculation', 'Crew productivity', 'Regional adjustments', 'Overtime factors']}
            />
            <DocCard
              title="Troubleshooting"
              description="Common issues and how to resolve them quickly."
              sections={['Excel compatibility', 'Formula errors', 'Printing issues', 'Data recovery']}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <FAQItem
              question="What format are the templates in?"
              answer="All templates are in Microsoft Excel format (.xlsx), compatible with Excel 2016 and later, as well as Google Sheets. They work on both Windows and Mac."
            />
            <FAQItem
              question="Can I customize the templates for my business?"
              answer="Yes, all templates are fully editable. You can add your company logo, adjust pricing, add or remove line items, and customize formulas to match your workflow."
            />
            <FAQItem
              question="How do I download my purchase?"
              answer="After purchase, you'll receive an email with download links. You can also access your purchases anytime by logging into your account dashboard."
            />
            <FAQItem
              question="Do updates require a new purchase?"
              answer="No, all purchases include lifetime updates. When we release an updated version, you can download it for free using the same link or from your dashboard."
            />
            <FAQItem
              question="Can I use the templates on multiple computers?"
              answer="Yes, you can install and use the templates on all computers within your business. The license is per-business, not per-device."
            />
            <FAQItem
              question="What if I need help with a specific project?"
              answer="For project-specific questions, you can email our support team. BidShield Pro members also have access to monthly Q&A sessions for personalized guidance."
            />
            <FAQItem
              question="How do I request a refund?"
              answer="Email support@bidshield.co within 30 days of purchase. We offer a no-questions-asked refund policy on all products."
            />
            <FAQItem
              question="Do you offer phone support?"
              answer="We provide email support for all customers and priority email support for BidShield Pro members. Phone consultations are available for enterprise customers."
            />
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Our support team typically responds within 24 hours on business days.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-colors"
          >
            Contact Support
          </Link>
          <p className="mt-6 text-slate-400">
            Email: support@bidshield.co
          </p>
        </div>
      </section>
    </main>
  );
}

function HelpCard({ icon, title, description, href, linkText }: { icon: string; title: string; description: string; href: string; linkText: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center hover:shadow-lg transition-shadow">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700"
      >
        {linkText}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}

function DocCard({ title, description, sections }: { title: string; description: string; sections: string[] }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm mb-4">{description}</p>
      <ul className="space-y-2">
        {sections.map((section, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {section}
          </li>
        ))}
      </ul>
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
