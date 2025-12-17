import Link from 'next/link';

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm font-semibold">
              Get In Touch
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Contact
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Us</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300">
              Questions about our courses, products, or membership? We're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-slate-200 hover:border-emerald-500 hover:shadow-2xl transition-all">
                <div className="text-5xl mb-4">📧</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Email Support</h3>
                <p className="text-slate-600 mb-4">
                  General inquiries and course support
                </p>
                <a
                  href="mailto:support@mc2estimating.com"
                  className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                >
                  support@mc2estimating.com
                </a>
                <p className="text-sm text-slate-500 mt-4">
                  Response time: 24-48 hours
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-slate-200 hover:border-emerald-500 hover:shadow-2xl transition-all">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Live Chat</h3>
                <p className="text-slate-600 mb-4">
                  Quick questions and technical support
                </p>
                <button className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                  Start Live Chat
                </button>
                <p className="text-sm text-slate-500 mt-4">
                  Available: Mon-Fri, 9am-5pm EST
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-slate-200 hover:border-emerald-500 hover:shadow-2xl transition-all">
                <div className="text-5xl mb-4">📞</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Phone Support</h3>
                <p className="text-slate-600 mb-4">
                  MC2 Pro members only
                </p>
                <a
                  href="tel:+18005551234"
                  className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                >
                  (800) 555-1234
                </a>
                <p className="text-sm text-slate-500 mt-4">
                  Mon-Fri, 9am-5pm EST
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-2 border-slate-200">
              <h2 className="text-3xl font-bold mb-8 text-center">Send Us a Message</h2>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="ABC Roofing Company"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select a subject...</option>
                    <option value="course">Course Question</option>
                    <option value="product">Product Question</option>
                    <option value="membership">Membership Question</option>
                    <option value="corporate">Corporate Training</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Tell us how we can help..."
                  ></textarea>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="newsletter"
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="newsletter" className="text-sm text-gray-700">
                    Subscribe to our newsletter for free estimating tips, industry news, and special offers.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>

                <p className="text-sm text-gray-500 text-center">
                  * Required fields. We typically respond within 24-48 hours.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <FAQItem
                question="What's the difference between buying individual courses and MC2 Pro membership?"
                answer="Individual courses give you lifetime access to specific training. MC2 Pro membership ($197/month) gives you unlimited access to ALL courses, products, and templates, plus ongoing updates and member-only content. If you plan to take 2+ courses, membership is more cost-effective."
              />
              <FAQItem
                question="Do you offer corporate training for my team?"
                answer="Yes! We offer customized corporate training packages for roofing contractors, estimating departments, and construction companies. Contact us for a custom quote based on team size and training needs."
              />
              <FAQItem
                question="Can I get a refund if I'm not satisfied?"
                answer="Digital products and individual courses have a 30-day money-back guarantee. MC2 Pro membership can be canceled anytime - we'll refund the current month if you cancel within the first 14 days of joining."
              />
              <FAQItem
                question="How do I access courses after purchase?"
                answer="After purchase through Gumroad, you'll receive immediate access to download digital products or access course content. You'll also receive a confirmation email with your login credentials and access instructions."
              />
              <FAQItem
                question="Do you offer student or volume discounts?"
                answer="We offer discounts for students with valid .edu email addresses (20% off) and volume discounts for corporate training (3+ seats). Contact us for details."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Still have questions? We're here to help you find the right training solution for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Explore MC2 Pro Membership →
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg border-2 border-blue-600"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 hover:border-blue-400 transition-all">
      <h3 className="text-lg font-bold text-gray-900 mb-3">{question}</h3>
      <p className="text-gray-700">{answer}</p>
    </div>
  );
}
