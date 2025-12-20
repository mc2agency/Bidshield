'use client';

import { useEffect, useRef, memo } from 'react';
import { GumroadProductKey, getGumroadProductId } from '@/lib/gumroad-products';

// Track script loading state globally to prevent multiple loads
let gumroadScriptLoaded = false;
let gumroadScriptLoading = false;

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
function GumroadCheckoutButton({
  productKey,
  text = 'Buy Now',
  className = '',
  variant = 'primary',
  showIcon = true
}: GumroadCheckoutButtonProps) {
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only load script once globally across all instances
    if (gumroadScriptLoaded || gumroadScriptLoading || hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;
    gumroadScriptLoading = true;

    const script = document.createElement('script');
    script.src = 'https://gumroad.com/js/gumroad.js';
    script.async = true;
    script.onload = () => {
      gumroadScriptLoaded = true;
      gumroadScriptLoading = false;
    };
    script.onerror = () => {
      gumroadScriptLoading = false;
    };
    document.body.appendChild(script);
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

// Memoize the component to prevent unnecessary re-renders when parent re-renders
export default memo(GumroadCheckoutButton);
