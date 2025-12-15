import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold text-white mb-4">MC2 Estimating</div>
            <p className="text-sm text-gray-400">
              Professional construction estimating training for roofing contractors and estimators.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-white mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products/template-bundle" className="hover:text-white">Template Bundle</Link></li>
              <li><Link href="/products/estimating-checklist" className="hover:text-white">Estimating Checklist</Link></li>
              <li><Link href="/products/proposal-templates" className="hover:text-white">Proposal Templates</Link></li>
              <li><Link href="/membership" className="hover:text-white">MC2 Pro Membership</Link></li>
            </ul>
          </div>

          {/* Learning */}
          <div>
            <h3 className="font-semibold text-white mb-4">Learning</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses/estimating-fundamentals" className="hover:text-white">Estimating Fundamentals</Link></li>
              <li><Link href="/courses/bluebeam-mastery" className="hover:text-white">Bluebeam Mastery</Link></li>
              <li><Link href="/learning/roofing-systems" className="hover:text-white">Roofing Systems</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} MC2 Estimating Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
