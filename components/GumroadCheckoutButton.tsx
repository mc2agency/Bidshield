'use client';

import { useEffect } from 'react';
import { GumroadProductKey, getGumroadProductId } from '@/lib/gumroad-products';

interface GumroadCheckoutButtonProps {
  productKey: GumroadProductKey;
  text?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'large';
  showIcon?: boolean;
}

/**
 * Gumroad Checkout Button Component
 *
 * Uses the product key from the gumroad-products config to generate
 * the correct Gumroad overlay link.
 *
 * @example
 * <GumroadCheckoutButton
 *   productKey="templateBundle"
 *   text="Buy Template Bundle - $129"
 *   variant="primary"
 * />
 */
export default function GumroadCheckoutButton({
  productKey,
  text = 'Buy Now',
  className = '',
  variant = 'primary',
  showIcon = true
}: GumroadCheckoutButtonProps) {

  useEffect(() => {
    // Load Gumroad overlay script if not already loaded
    if (!document.querySelector('script[src="https://gumroad.com/js/gumroad.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://gumroad.com/js/gumroad.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const productId = getGumroadProductId(productKey);

  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer no-underline';

  const variantStyles = {
    primary: 'px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg',
    secondary: 'px-6 py-3 bg-white text-blue-900 hover:bg-blue-50 shadow-md hover:shadow-lg',
    outline: 'px-6 py-3 bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    large: 'px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 shadow-lg hover:shadow-xl text-lg'
  };

  const combinedClassName = `gumroad-button ${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <a
      className={combinedClassName}
      href={`https://gumroad.com/l/${productId}`}
      data-gumroad-single-product="true"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>{text}</span>
      {showIcon && <span className="text-lg">→</span>}
    </a>
  );
}
