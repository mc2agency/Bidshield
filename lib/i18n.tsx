'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.products': 'Products',
    'nav.tools': 'Tools',
    'nav.resources': 'Resources',
    'nav.pricing': 'Pricing',
    'nav.bidshield': 'BidShield',
    
    // Hero
    'hero.badge': 'Professional Roofing Estimating Tools',
    'hero.title1': 'Build Accurate Bids',
    'hero.title2': 'Faster Than Ever',
    'hero.subtitle': 'Professional estimating templates, calculators, and checklists used by top roofing contractors. Download and start using immediately.',
    'hero.cta1': 'View Templates',
    'hero.cta2': 'Get the Bundle',
    
    // Stats
    'stats.tools': 'Professional Tools',
    'stats.systems': 'Roofing Systems Covered',
    'stats.time': 'Estimate Time Saved',
    
    // Problem section
    'problem.title1': 'Tired of Spending 3 Hours on',
    'problem.title2': 'Every Estimate?',
    'problem.desc': "Most contractors waste hours calculating materials, forgetting cost items, and losing money on inaccurate estimates. There's a better way.",
    'problem.benefit1': 'Reduce estimate time from 3 hours to 10 minutes',
    'problem.benefit2': 'Never forget labor burden or general conditions again',
    'problem.benefit3': 'Professional proposals that win more bids',
    'problem.benefit4': 'Pre-built formulas handle all calculations automatically',
    
    // Bundle CTA
    'bundle.popular': 'Most Popular',
    'bundle.starting': 'Starting at',
    'bundle.onetime': 'One-time payment',
    'bundle.title': 'Complete Template Bundle',
    'bundle.feature1': 'All 8 Roofing System Templates',
    'bundle.feature2': 'Complete Estimating Checklist',
    'bundle.feature3': 'Professional Proposal Templates',
    'bundle.feature4': 'Lifetime Updates',
    'bundle.feature5': '30-Day Money-Back Guarantee',
    'bundle.cta': 'Get Instant Access',
    
    // Features
    'features.title': 'Everything You Need to Estimate Faster',
    'features.subtitle': 'Professional tools designed by estimators, for estimators. Download and start using immediately.',
    
    // BidShield
    'bidshield.new': 'NEW — BidShield PRO',
    'bidshield.title1': 'Templates for Quick Estimates.',
    'bidshield.title2': 'BidShield for Complete Bid Management.',
    'bidshield.desc': 'Go beyond templates. BidShield is the complete bid management system — 18-phase checklist, estimate validation, vendor tracking, and labor benchmarks. Never miss a line item again.',
    'bidshield.feature1': '16-Phase Checklist',
    'bidshield.feature1.desc': 'Every bid phase tracked',
    'bidshield.feature2': 'Estimate Validator',
    'bidshield.feature2.desc': 'Catch errors before submission',
    'bidshield.feature3': 'Quote Tracker',
    'bidshield.feature3.desc': 'Never miss an expiration',
    'bidshield.feature4': 'Labor Benchmarks',
    'bidshield.feature4.desc': 'Validate your hours',
    
    // Email capture
    'email.title': 'Download Our FREE Bid Review Checklist',
    'email.desc': 'The 18-phase checklist commercial roofing estimators use to catch scope gaps, missed addenda, and pricing errors before submission.',
    'email.note': 'No spam. Unsubscribe anytime.',
    
    // Final CTA
    'cta.title': 'Ready to Estimate Like a Pro?',
    'cta.desc': 'Get instant access to professional templates, calculators, and tools. Start saving time and winning more bids today.',
    'cta.guarantee': '30-day money-back guarantee • Instant download • Lifetime updates',
    
    // Products page
    'products.hero.title': 'Professional Roofing',
    'products.hero.title2': 'Estimating Templates',
    'products.hero.desc': 'Excel templates with built-in formulas for material takeoff, labor calculations, and professional proposals. Download and start estimating in minutes.',
    'products.bundle.title': 'Complete Template Bundle',
    'products.bundle.desc': 'Get all 8 roofing system templates at 57% off. Everything you need to estimate any roofing project.',
    'products.bundle.save': 'SAVE $133',
    'products.bundle.includes': 'Includes all 8 templates below',
    'products.bundle.cta': 'Get All 8 Templates — $99',
    'products.individual.title': 'Individual Templates',
    'products.individual.desc': 'Choose the templates you need for specific roofing systems.',
    'products.each': 'each',
    'products.template.sheets': '6 sheets included',
    'products.template.cta': 'Get Template',
    'products.whats.title': "What's Inside Each Template",
    'products.whats.desc': 'Every template includes these 6 professional sheets:',
    'products.sheet.dashboard': 'Project Dashboard',
    'products.sheet.dashboard.desc': 'Overview of project details, totals, and key metrics at a glance',
    'products.sheet.material': 'Material Takeoff',
    'products.sheet.material.desc': 'Complete material list with quantities, waste factors, and pricing',
    'products.sheet.labor': 'Labor Calculator',
    'products.sheet.labor.desc': 'Labor hours, crew sizes, and productivity calculations',
    'products.sheet.recap': 'Cost Recap',
    'products.sheet.recap.desc': 'Summary of all costs with markup and profit calculations',
    'products.sheet.proposal': 'Professional Proposal',
    'products.sheet.proposal.desc': 'Client-ready proposal template with your branding',
    'products.sheet.pricelist': 'Price List',
    'products.sheet.pricelist.desc': 'Editable material and labor price database',
    'products.faq.title': 'Frequently Asked Questions',
    'products.faq.q1': 'What software do I need?',
    'products.faq.a1': 'Microsoft Excel 2016 or newer, or Google Sheets (free). Works on PC and Mac.',
    'products.faq.q2': 'Can I customize the templates?',
    'products.faq.a2': "Yes! You can add your logo, adjust prices, change rates — the templates are fully editable Excel files.",
    'products.faq.q3': 'Do I get updates?',
    'products.faq.a3': "Yes — lifetime updates at no extra cost. We email you when improvements are made.",
    'products.faq.q4': 'What is the refund policy?',
    'products.faq.a4': "30-day money-back guarantee. If the templates don't save you time, we'll refund you.",
  },
  es: {
    // Nav
    'nav.products': 'Productos',
    'nav.tools': 'Herramientas',
    'nav.resources': 'Recursos',
    'nav.pricing': 'Precios',
    'nav.bidshield': 'BidShield',
    
    // Hero
    'hero.badge': 'Herramientas Profesionales de Estimación para Techos',
    'hero.title1': 'Crea Presupuestos Precisos',
    'hero.title2': 'Más Rápido que Nunca',
    'hero.subtitle': 'Plantillas profesionales de estimación, calculadoras y listas de verificación usadas por los mejores contratistas de techos. Descarga y comienza a usar inmediatamente.',
    'hero.cta1': 'Ver Plantillas',
    'hero.cta2': 'Obtener el Paquete',
    
    // Stats
    'stats.tools': 'Herramientas Profesionales',
    'stats.systems': 'Sistemas de Techos Cubiertos',
    'stats.time': 'Tiempo de Estimación Ahorrado',
    
    // Problem section
    'problem.title1': '¿Cansado de Pasar 3 Horas en',
    'problem.title2': 'Cada Presupuesto?',
    'problem.desc': 'La mayoría de los contratistas pierden horas calculando materiales, olvidando costos y perdiendo dinero en estimaciones inexactas. Hay una mejor manera.',
    'problem.benefit1': 'Reduce el tiempo de estimación de 3 horas a 10 minutos',
    'problem.benefit2': 'Nunca olvides la carga laboral o condiciones generales',
    'problem.benefit3': 'Propuestas profesionales que ganan más trabajos',
    'problem.benefit4': 'Fórmulas pre-construidas manejan todos los cálculos automáticamente',
    
    // Bundle CTA
    'bundle.popular': 'Más Popular',
    'bundle.starting': 'Desde',
    'bundle.onetime': 'Pago único',
    'bundle.title': 'Paquete Completo de Plantillas',
    'bundle.feature1': 'Las 8 Plantillas de Sistemas de Techos',
    'bundle.feature2': 'Lista de Verificación Completa',
    'bundle.feature3': 'Plantillas de Propuestas Profesionales',
    'bundle.feature4': 'Actualizaciones de Por Vida',
    'bundle.feature5': 'Garantía de 30 Días',
    'bundle.cta': 'Obtener Acceso Instantáneo',
    
    // Features
    'features.title': 'Todo lo que Necesitas para Estimar Más Rápido',
    'features.subtitle': 'Herramientas profesionales diseñadas por estimadores, para estimadores. Descarga y comienza a usar inmediatamente.',
    
    // BidShield
    'bidshield.new': 'NUEVO — BidShield PRO',
    'bidshield.title1': 'Plantillas para Estimaciones Rápidas.',
    'bidshield.title2': 'BidShield para Gestión Completa de Licitaciones.',
    'bidshield.desc': 'Ve más allá de las plantillas. BidShield es el sistema completo de gestión de licitaciones — lista de 16 fases, validación de estimaciones, seguimiento de proveedores y benchmarks de mano de obra.',
    'bidshield.feature1': 'Lista de 16 Fases',
    'bidshield.feature1.desc': 'Cada fase de licitación rastreada',
    'bidshield.feature2': 'Validador de Estimaciones',
    'bidshield.feature2.desc': 'Detecta errores antes de enviar',
    'bidshield.feature3': 'Rastreador de Cotizaciones',
    'bidshield.feature3.desc': 'Nunca pierdas una fecha límite',
    'bidshield.feature4': 'Benchmarks de Mano de Obra',
    'bidshield.feature4.desc': 'Valida tus horas',
    
    // Email capture
    'email.title': 'Descarga Nuestra Lista de Verificación GRATIS',
    'email.desc': 'Deja de perder dinero. Nuestra lista completa cubre cada categoría de costo para que nunca olvides un ítem en tu próximo presupuesto.',
    'email.note': 'Sin spam. Cancela cuando quieras.',
    
    // Final CTA
    'cta.title': '¿Listo para Estimar Como un Profesional?',
    'cta.desc': 'Obtén acceso instantáneo a plantillas profesionales, calculadoras y herramientas. Comienza a ahorrar tiempo y ganar más trabajos hoy.',
    'cta.guarantee': 'Garantía de 30 días • Descarga instantánea • Actualizaciones de por vida',
    
    // Products page
    'products.hero.title': 'Plantillas Profesionales de',
    'products.hero.title2': 'Estimación para Techos',
    'products.hero.desc': 'Plantillas de Excel con fórmulas integradas para cálculo de materiales, mano de obra y propuestas profesionales. Descarga y comienza a estimar en minutos.',
    'products.bundle.title': 'Paquete Completo de Plantillas',
    'products.bundle.desc': 'Obtén las 8 plantillas de sistemas de techos con 57% de descuento. Todo lo que necesitas para estimar cualquier proyecto.',
    'products.bundle.save': 'AHORRA $133',
    'products.bundle.includes': 'Incluye las 8 plantillas de abajo',
    'products.bundle.cta': 'Obtener las 8 Plantillas — $99',
    'products.individual.title': 'Plantillas Individuales',
    'products.individual.desc': 'Elige las plantillas que necesitas para sistemas específicos.',
    'products.each': 'cada una',
    'products.template.sheets': '6 hojas incluidas',
    'products.template.cta': 'Obtener Plantilla',
    'products.whats.title': 'Qué Incluye Cada Plantilla',
    'products.whats.desc': 'Cada plantilla incluye estas 6 hojas profesionales:',
    'products.sheet.dashboard': 'Panel del Proyecto',
    'products.sheet.dashboard.desc': 'Vista general de detalles del proyecto, totales y métricas clave',
    'products.sheet.material': 'Cálculo de Materiales',
    'products.sheet.material.desc': 'Lista completa de materiales con cantidades, factores de desperdicio y precios',
    'products.sheet.labor': 'Calculadora de Mano de Obra',
    'products.sheet.labor.desc': 'Horas de trabajo, tamaño de cuadrilla y cálculos de productividad',
    'products.sheet.recap': 'Resumen de Costos',
    'products.sheet.recap.desc': 'Resumen de todos los costos con margen y cálculo de ganancias',
    'products.sheet.proposal': 'Propuesta Profesional',
    'products.sheet.proposal.desc': 'Plantilla de propuesta lista para el cliente con tu marca',
    'products.sheet.pricelist': 'Lista de Precios',
    'products.sheet.pricelist.desc': 'Base de datos editable de precios de materiales y mano de obra',
    'products.faq.title': 'Preguntas Frecuentes',
    'products.faq.q1': '¿Qué software necesito?',
    'products.faq.a1': 'Microsoft Excel 2016 o más reciente, o Google Sheets (gratis). Funciona en PC y Mac.',
    'products.faq.q2': '¿Puedo personalizar las plantillas?',
    'products.faq.a2': '¡Sí! Puedes agregar tu logo, ajustar precios, cambiar tarifas — las plantillas son archivos Excel completamente editables.',
    'products.faq.q3': '¿Recibo actualizaciones?',
    'products.faq.a3': 'Sí — actualizaciones de por vida sin costo adicional. Te enviamos un email cuando hay mejoras.',
    'products.faq.q4': '¿Cuál es la política de reembolso?',
    'products.faq.a4': 'Garantía de 30 días. Si las plantillas no te ahorran tiempo, te devolvemos tu dinero.',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('mc2-language') as Language;
    if (saved && (saved === 'en' || saved === 'es')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mc2-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Simple toggle component
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
      title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
    >
      <span className={language === 'en' ? 'font-bold' : 'opacity-50'}>EN</span>
      <span className="text-slate-300">|</span>
      <span className={language === 'es' ? 'font-bold' : 'opacity-50'}>ES</span>
    </button>
  );
}
