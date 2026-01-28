import StripeCheckoutButton from '@/components/StripeCheckoutButton';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Template {
  id: string;
  icon: string;
  title: string;
  fullTitle: string;
  description: string;
  longDescription: string;
  features: string[];
}

const TEMPLATES: Record<string, Template> = {
  'asphalt-shingle': {
    id: 'asphalt-shingle',
    icon: '🏠',
    title: 'Asphalt Shingle',
    fullTitle: 'Asphalt Shingle Roofing Estimator',
    description: '3-tab, architectural, and designer shingles with pitch multipliers',
    longDescription: 'Complete estimating template for residential and commercial asphalt shingle roofing. Includes material calculator with pitch multipliers, labor estimator with full overburden, and professional proposals.',
    features: [
      'Shingle material calculator with pitch multipliers (4/12–12/12)',
      'Underlayment, ice & water, drip edge, starter strip',
      'Flashing and ventilation components',
      'Waste factor calculator',
      'Crew-based labor with overburden',
    ],
  },
  'tpo': {
    id: 'tpo',
    icon: '🔷',
    title: 'TPO Single-Ply',
    fullTitle: 'TPO Single-Ply Roofing Estimator',
    description: 'Mechanically attached & fully adhered TPO membrane systems',
    longDescription: 'Professional TPO roofing estimator for commercial flat roofs. Handles mechanically attached and fully adhered systems with membrane, fasteners, adhesive, and flashing calculations.',
    features: [
      'Membrane width & roll calculations',
      'Mechanically attached vs fully adhered options',
      'Insulation & coverboard layers',
      'Termination bar, caulk, fasteners',
      'Penetration & flashing details',
    ],
  },
  'epdm': {
    id: 'epdm',
    icon: '⬛',
    title: 'EPDM Rubber',
    fullTitle: 'EPDM Roofing Estimator',
    description: 'Mechanically attached, fully adhered, and ballasted rubber roofing',
    longDescription: 'Complete EPDM rubber roofing estimator for commercial applications. Supports all attachment methods with detailed material and labor calculations.',
    features: [
      'Membrane sheet sizing & seam calculations',
      'Adhesive & seam tape quantities',
      'Termination bar and accessories',
      'Three attachment method options',
      'Penetration flashing details',
    ],
  },
  'metal': {
    id: 'metal',
    icon: '🔩',
    title: 'Metal Standing Seam',
    fullTitle: 'Metal Standing Seam Roofing Estimator',
    description: 'Standing seam, corrugated, and metal shingle systems',
    longDescription: 'Professional metal roofing estimator for standing seam, corrugated, and metal shingle systems. Panel calculator with custom widths and all trim components.',
    features: [
      'Panel calculator with custom widths & lengths',
      'Standing seam clip calculations',
      'Trim, ridge cap, valley, rake',
      'Underlayment and fasteners',
      'Color and gauge options',
    ],
  },
  'tile': {
    id: 'tile',
    icon: '🧱',
    title: 'Tile Roofing',
    fullTitle: 'Tile Roofing Estimator',
    description: 'Concrete, clay, and interlocking tile with breakage factors',
    longDescription: 'Complete tile roofing estimator for concrete, clay, and interlocking tile systems. Includes batten calculator and built-in breakage waste factors.',
    features: [
      'Tile quantity with 15% breakage built in',
      'Batten/lath calculator',
      'Underlayment and flashing',
      'Hip, ridge, and rake tiles',
      'Concrete, clay & interlocking options',
    ],
  },
  'bur': {
    id: 'bur',
    icon: '🔥',
    title: 'BUR (Built-Up)',
    fullTitle: 'BUR (Built-Up Roofing) Estimator',
    description: 'Hot-applied & cold-applied multi-ply roofing systems',
    longDescription: 'Professional built-up roofing estimator for hot and cold applied multi-ply systems. Calculates plies, felts, asphalt, and all components.',
    features: [
      'Multi-ply system calculations',
      'Hot-applied & cold-applied options',
      'Felts, asphalt/tar, gravel',
      'Base & cap sheet quantities',
      'Roof curb and penetration details',
    ],
  },
  'sbs': {
    id: 'sbs',
    icon: '📜',
    title: 'Siplast SBS Modified',
    fullTitle: 'Siplast SBS Modified Bitumen Estimator',
    description: 'Torch-applied & self-adhered modified bitumen systems',
    longDescription: 'Spec-accurate Siplast SBS modified bitumen estimator for commercial and institutional roofs. Torch-applied and self-adhered system options.',
    features: [
      'Siplast product line integration',
      'Parafor, Paradiene products',
      'Torch-applied & self-adhered options',
      'Primer and adhesive calculations',
      'Insulation & coverboard layers',
    ],
  },
  'spray-foam': {
    id: 'spray-foam',
    icon: '💨',
    title: 'Spray Foam Insulation',
    fullTitle: 'Spray Foam Insulation Estimator',
    description: 'Open-cell, closed-cell, and roof coating systems',
    longDescription: 'Complete spray foam insulation estimator for open-cell, closed-cell, and roof coating applications. Board-foot calculations with coating options.',
    features: [
      'Board-foot / thickness calculations',
      'Open-cell vs closed-cell options',
      'Foam kit/drum quantities',
      'Coating & top-coat layers',
      'Mesh and primer materials',
    ],
  },
};

// URL aliases for old routes
const ALIASES: Record<string, string> = {
  'tpo-template': 'tpo',
  'sbs-template': 'sbs',
  'metal-roofing': 'metal',
  'tile-roofing': 'tile',
};

export async function generateStaticParams() {
  return Object.keys(TEMPLATES).map(id => ({ templateId: id }));
}

export async function generateMetadata({ params }: { params: Promise<{ templateId: string }> }): Promise<Metadata> {
  const { templateId } = await params;
  const resolvedId = ALIASES[templateId] || templateId;
  const template = TEMPLATES[resolvedId];
  
  if (!template) {
    return { title: 'Template Not Found' };
  }

  return {
    title: `${template.fullTitle} | MC2 Estimating`,
    description: template.longDescription,
  };
}

export default async function TemplatePage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  const resolvedId = ALIASES[templateId] || templateId;
  const template = TEMPLATES[resolvedId];

  if (!template) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <Link href="/products" className="hover:text-white">Products</Link>
            <span>/</span>
            <span>{template.title}</span>
          </div>
          
          <div className="flex items-start gap-6">
            <span className="text-6xl">{template.icon}</span>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">{template.fullTitle}</h1>
              <p className="text-xl text-slate-300 max-w-2xl">
                {template.longDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Features */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">What's Included</h2>
                <ul className="space-y-3">
                  {template.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Template Sheets */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Template Sheets</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-emerald-600 mb-1">📊 Material Takeoff</h3>
                    <p className="text-sm text-slate-600">Auto-calculates all materials with waste factors</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-emerald-600 mb-1">👷 Labor Calculator</h3>
                    <p className="text-sm text-slate-600">Crew-based with full overburden tracking</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-emerald-600 mb-1">💰 Cost Recap</h3>
                    <p className="text-sm text-slate-600">Estimating Edge format breakdown</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-emerald-600 mb-1">📄 Customer Proposal</h3>
                    <p className="text-sm text-slate-600">Print-ready professional format</p>
                  </div>
                </div>
              </div>

              {/* Compatibility */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Compatibility</h2>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    Microsoft Excel 2016+
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    Google Sheets (free)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    PC and Mac
                  </li>
                </ul>
              </div>
            </div>

            {/* Right - Purchase Box */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 sticky top-24">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-slate-900">$29</span>
                  <p className="text-sm text-slate-600 mt-1">One-time payment</p>
                </div>

                <StripeCheckoutButton
                  productId={template.id}
                  text="Buy Template — $29"
                  variant="large"
                  className="w-full mb-4"
                />

                <ul className="space-y-2 text-sm text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    Instant download
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    Lifetime updates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    30-day money-back guarantee
                  </li>
                </ul>

                {/* Bundle Upsell */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 mb-3">
                    💡 <strong>Save $133</strong> — get all 8 templates for $99
                  </p>
                  <Link
                    href="/products/template-bundle"
                    className="block w-full text-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    View Bundle
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
