export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-slate-300">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12 border border-gray-200">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 mb-8">
                MC2 Estimating (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our website and services.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">1. Information We Collect</h2>

              <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">1.1 Information You Provide</h3>
              <p className="text-gray-700 mb-4">
                We collect information you voluntarily provide when you:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Create an account:</strong> Name, email address, password, company name</li>
                <li><strong>Make a purchase:</strong> Billing information (processed securely through Stripe)</li>
                <li><strong>Contact us:</strong> Contact form submissions, support requests, feedback</li>
                <li><strong>Use our products:</strong> Usage tracking, preferences, access history</li>
                <li><strong>Subscribe to our newsletter:</strong> Email address, preferences</li>
              </ul>

              <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">1.2 Information Collected Automatically</h3>
              <p className="text-gray-700 mb-4">
                When you access our website, we automatically collect:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Device information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage data:</strong> Pages viewed, time spent, navigation paths</li>
                <li><strong>Cookies and tracking:</strong> See Section 3 for cookie policy</li>
                <li><strong>Referral information:</strong> How you found our website</li>
              </ul>

              <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">1.3 Information from Third Parties</h3>
              <p className="text-gray-700 mb-4">
                We may receive information from:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Stripe:</strong> Payment processing, order fulfillment data</li>
                <li><strong>Analytics providers:</strong> Google Analytics, usage statistics</li>
                <li><strong>Social media:</strong> If you choose to link social accounts</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use collected information for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Providing services:</strong> Account management, product access, content delivery</li>
                <li><strong>Processing transactions:</strong> Order fulfillment, billing, receipts</li>
                <li><strong>Customer support:</strong> Responding to inquiries, troubleshooting issues</li>
                <li><strong>Improving our services:</strong> Analyzing usage, fixing bugs, adding features</li>
                <li><strong>Marketing communications:</strong> Newsletters, product updates, promotions (with consent)</li>
                <li><strong>Legal compliance:</strong> Meeting legal obligations, enforcing our terms</li>
                <li><strong>Security:</strong> Preventing fraud, protecting against malicious activity</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">3. Cookies and Tracking Technologies</h2>

              <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">3.1 Types of Cookies We Use</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Essential cookies:</strong> Required for website functionality (login, cart)</li>
                <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Marketing cookies:</strong> Track effectiveness of advertising campaigns</li>
                <li><strong>Preference cookies:</strong> Remember your settings and choices</li>
              </ul>

              <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">3.2 Managing Cookies</h3>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings. Note that disabling certain
                cookies may affect website functionality.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">4. How We Share Your Information</h2>
              <p className="text-gray-700 mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Service providers:</strong> Stripe (payments), email providers, hosting services</li>
                <li><strong>Analytics partners:</strong> Google Analytics (anonymized data)</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business transfers:</strong> In connection with merger, sale, or acquisition</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>We do NOT sell your personal information to third parties.</strong>
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure payment processing through Stripe (PCI-DSS compliant)</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Data backup and disaster recovery procedures</li>
              </ul>
              <p className="text-gray-700 mb-4">
                However, no method of transmission over the internet is 100% secure. While we strive
                to protect your data, we cannot guarantee absolute security.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Provide services and support</li>
                <li>Comply with legal obligations (tax records, etc.)</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can request deletion of your account and data at any time (see Section 8).
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">7. Your Privacy Rights</h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Limit how we use your information</li>
                <li><strong>Objection:</strong> Object to certain data processing activities</li>
              </ul>

              <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">California Residents (CCPA)</h3>
              <p className="text-gray-700 mb-4">
                California residents have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information (we don't sell data)</li>
                <li>Right to deletion of personal information</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>

              <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">European Residents (GDPR)</h3>
              <p className="text-gray-700 mb-4">
                If you're in the European Economic Area, you have rights under GDPR including access,
                rectification, erasure, data portability, and the right to lodge a complaint with
                your supervisory authority.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">8. Exercising Your Rights</h2>
              <p className="text-gray-700 mb-4">
                To exercise your privacy rights, contact us at:
              </p>
              <div className="bg-emerald-50 rounded-lg p-6 border-2 border-emerald-200 mb-4">
                <p className="text-gray-800 mb-2"><strong>Privacy Requests:</strong></p>
                <p className="text-gray-700">Email: privacy@mc2estimating.com</p>
                <p className="text-gray-700">Subject line: "Privacy Request - [Your Request Type]"</p>
              </div>
              <p className="text-gray-700 mb-4">
                We will respond to verified requests within 30 days.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">9. Marketing Communications</h2>
              <p className="text-gray-700 mb-4">
                We may send you:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Product updates and usage tips</li>
                <li>New product announcements</li>
                <li>Special offers and promotions</li>
                <li>Industry news and tips</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can unsubscribe at any time by clicking "Unsubscribe" in any email or contacting us.
                Note: You'll still receive transactional emails (receipts, account notifications).
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">10. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our services are not directed to individuals under 18 years of age. We do not knowingly
                collect personal information from children. If you believe we have collected information
                from a child, please contact us immediately.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">11. Third-Party Links</h2>
              <p className="text-gray-700 mb-4">
                Our website may contain links to third-party websites (social media, etc.).
                We are not responsible for the privacy practices of these external sites. Please review
                their privacy policies.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">12. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your own.
                We ensure appropriate safeguards are in place for international transfers.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">13. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of significant
                changes by email or by posting a notice on our website. The "Last updated" date at the
                top indicates when the policy was last revised.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">14. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                For questions about this Privacy Policy or our data practices, contact us:
              </p>
              <div className="bg-emerald-50 rounded-lg p-6 border-2 border-emerald-200">
                <p className="text-gray-800 mb-2"><strong>MC2 Estimating (BidShield)</strong></p>
                <p className="text-gray-700">Email: privacy@mc2estimating.com</p>
                <p className="text-gray-700">Support: support@mc2estimating.com</p>
                <p className="text-gray-700">Phone: (800) 555-1234</p>
              </div>

              <div className="mt-12 p-6 bg-gray-100 rounded-lg border-2 border-gray-300">
                <p className="text-sm text-gray-600">
                  <strong>Summary:</strong> We collect information to provide and improve our services.
                  We do not sell your personal information. You have rights to access, correct, and delete
                  your data. We use industry-standard security measures to protect your information.
                  For questions or to exercise your rights, contact privacy@mc2estimating.com.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
