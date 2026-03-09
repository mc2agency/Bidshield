import Link from 'next/link';

export default function Footer() {
  const footerSections = [
    {
      title: 'BidShield',
      links: [
        { href: '/bidshield/dashboard', label: 'Dashboard' },
        { href: '/bidshield/pricing', label: 'Pricing' },
        { href: '/bidshield/demo', label: 'Try Demo' },
        { href: '/blog', label: 'Blog' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { href: '/products', label: 'Templates' },
        { href: '/updates', label: 'Product Updates' },
        { href: '/support', label: 'Support' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/privacy', label: 'Privacy Policy' },
      ],
    },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 overflow-hidden">
      {/* Ambient gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold text-white">BidShield</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Protecting contractors from costly bidding errors.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://www.linkedin.com/company/mc2-estimating" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
              </a>
            </div>
          </div>

          {/* Link sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} MC2 Estimating. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
