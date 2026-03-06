'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { BundleSchema, FAQSchema } from '@/components/ProductSchema';

const TEMPLATES = [
  { id: 'asphalt-shingle', icon: '🏘️', title: 'Asphalt Shingle', titleEs: 'Teja Asfáltica', description: '3-tab, architectural, and designer shingles with pitch multipliers', descEs: 'Tejas de 3 lengüetas, arquitectónicas y de diseño con multiplicadores de pendiente' },
  { id: 'tpo', icon: '⚪', title: 'TPO Single-Ply', titleEs: 'TPO Monocapa', description: 'Mechanically attached & fully adhered TPO membrane systems', descEs: 'Sistemas de membrana TPO adheridos mecánicamente y totalmente' },
  { id: 'epdm', icon: '⚫', title: 'EPDM Rubber', titleEs: 'Caucho EPDM', description: 'Mechanically attached, fully adhered, and ballasted rubber', descEs: 'Caucho adherido mecánicamente, totalmente adherido y lastrado' },
  { id: 'metal', icon: '🪨', title: 'Metal Standing Seam', titleEs: 'Metal Junta Alzada', description: 'Standing seam, corrugated, and metal shingle systems', descEs: 'Sistemas de junta alzada, corrugado y teja metálica' },
  { id: 'tile', icon: '🏛️', title: 'Tile Roofing', titleEs: 'Techo de Teja', description: 'Concrete, clay, and interlocking tile with breakage factors', descEs: 'Teja de concreto, arcilla y entrelazada con factores de rotura' },
  { id: 'bur', icon: '🪨', title: 'BUR (Built-Up)', titleEs: 'BUR (Multicapa)', description: 'Hot-applied & cold-applied multi-ply roofing systems', descEs: 'Sistemas multicapa aplicados en caliente y en frío' },
  { id: 'sbs', icon: '🛞', title: 'SBS Modified Bitumen', titleEs: 'SBS Modificado', description: 'Torch-applied & self-adhered modified bitumen', descEs: 'Betún modificado aplicado con soplete y autoadhesivo' },
  { id: 'spray-foam', icon: '🫧', title: 'Spray Foam Insulation', titleEs: 'Espuma en Spray', description: 'Open-cell, closed-cell, and roof coating systems', descEs: 'Sistemas de celda abierta, celda cerrada y recubrimiento' },
];

export default function ProductsContent() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <>
      <BundleSchema />
      <FAQSchema />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                {isEs ? 'Plantillas Profesionales de' : 'Professional Estimating'}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  {isEs ? 'Estimación' : 'Templates'}
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
                {isEs
                  ? '8 plantillas de sistemas de techos. Cálculo de materiales, mano de obra y propuestas profesionales.'
                  : '8 roofing system templates. Material takeoffs, labor calculators, and professional proposals.'}
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{isEs ? 'Acceso Instantáneo' : 'Instant Access'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Excel & Google Sheets</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{isEs ? 'Incluido en BidShield Pro' : 'Included with BidShield Pro'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BidShield Pro Callout */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-8 sm:p-12 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl">🛡️</span>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold">
                      {isEs ? 'Incluido gratis con BidShield Pro' : 'Included free with BidShield Pro'}
                    </h2>
                    <p className="text-emerald-100">
                      {isEs ? 'Todas las plantillas + 18 listas de verificación + puntuación de licitación' : 'All 8 templates + 18-phase checklists + bid readiness scoring'}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-lg text-emerald-100 mb-6">
                      {isEs
                        ? 'Todos los sistemas de techos cubiertos. Accede a todas las plantillas más la plataforma completa de estimación de BidShield por $149/mes.'
                        : 'Every roofing system covered. Access all templates plus the full BidShield estimating platform for $149/month.'}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-5xl font-bold">$149</span>
                        <span className="text-2xl text-emerald-200">{isEs ? '/mes' : '/month'}</span>
                      </div>
                      <p className="text-sm text-emerald-200">
                        {isEs ? 'Prueba gratis 14 días • Cancela cuando quieras' : '14-day free trial • Cancel anytime'}
                      </p>
                    </div>

                    <Link
                      href="/bidshield/pricing"
                      className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      {isEs ? 'Obtener BidShield Pro' : 'Get BidShield Pro'}
                    </Link>
                  </div>

                  <div>
                    <h3 className="font-bold text-xl mb-4">
                      {isEs ? 'Los 8 Sistemas Incluidos:' : 'All 8 Systems Included:'}
                    </h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {TEMPLATES.map(t => (
                        <li key={t.id} className="flex items-center gap-2 text-sm">
                          <span>{t.icon}</span>
                          <span>{isEs ? t.titleEs : t.title}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 pt-4 border-t border-emerald-500/30">
                      <h4 className="font-semibold mb-2">
                        {isEs ? 'Cada plantilla incluye:' : 'Every template includes:'}
                      </h4>
                      <ul className="space-y-1 text-sm text-emerald-100">
                        <li>✓ {isEs ? 'Calculadora de Materiales' : 'Material Takeoff Calculator'}</li>
                        <li>✓ {isEs ? 'Calculadora de Mano de Obra' : 'Labor Calculator with Overburden'}</li>
                        <li>✓ {isEs ? 'Resumen de Costos' : 'Cost Recap (Estimating Edge format)'}</li>
                        <li>✓ {isEs ? 'Propuesta Profesional' : 'Professional Customer Proposal'}</li>
                        <li>✓ {isEs ? 'Panel de Resumen' : 'Dashboard Summary'}</li>
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
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {isEs ? 'Los 8 Sistemas de Techos' : 'All 8 Roofing Systems'}
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                {isEs
                  ? 'Todos incluidos con BidShield Pro. Sin compras individuales.'
                  : 'All included with BidShield Pro. No separate purchases needed.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TEMPLATES.map(template => (
                <div
                  key={template.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-emerald-200 transition-all group"
                >
                  <div className="text-4xl mb-4">{template.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {isEs ? template.titleEs : template.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">{isEs ? template.descEs : template.description}</p>
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                    ✓ {isEs ? 'Incluido en Pro' : 'Included in Pro'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: isEs ? '¿Cómo accedo a las plantillas?' : 'How do I access the templates?',
                  a: isEs ? 'Con BidShield Pro tienes acceso inmediato a todas las plantillas desde tu panel de control.' : 'With BidShield Pro you get immediate access to all templates from your dashboard.',
                },
                {
                  q: isEs ? '¿Funcionan con Google Sheets?' : 'Do they work with Google Sheets?',
                  a: isEs ? 'Sí. Las plantillas funcionan con Microsoft Excel y Google Sheets. Todas las fórmulas son compatibles.' : 'Yes. The templates work with both Microsoft Excel and Google Sheets. All formulas are compatible.',
                },
                {
                  q: isEs ? '¿Hay garantía de devolución?' : 'Is there a money-back guarantee?',
                  a: isEs ? 'BidShield Pro incluye una prueba gratuita de 14 días. Sin tarjeta requerida para empezar.' : 'BidShield Pro includes a 14-day free trial. No card required to start.',
                },
                {
                  q: isEs ? '¿Puedo modificar las plantillas?' : 'Can I modify the templates?',
                  a: isEs ? 'Absolutamente. Las plantillas son completamente editables. Añade tu logo, modifica precios, personaliza todo.' : 'Absolutely. The templates are fully editable. Add your logo, modify pricing, customize everything.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              {isEs ? '¿Listo para Estimar Más Rápido?' : 'Ready to Estimate Faster?'}
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              {isEs
                ? 'Todas las plantillas incluidas con BidShield Pro. Empieza gratis hoy.'
                : 'All templates included with BidShield Pro. Start free today.'}
            </p>
            <Link
              href="/bidshield/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              {isEs ? 'Ver BidShield Pro — $149/mes' : 'See BidShield Pro — $149/month'}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
