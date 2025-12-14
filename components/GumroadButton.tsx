'use client';

import { useEffect } from 'react';

interface GumroadButtonProps {
  productId: string;
  text?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function GumroadButton({
  productId,
  text = 'Buy Now',
  className = '',
  variant = 'primary'
}: GumroadButtonProps) {

  useEffect(() => {
    // Load Gumroad overlay script
    const script = document.createElement('script');
    script.src = 'https://gumroad.com/js/gumroad.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const baseStyles = 'inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg',
    secondary: 'bg-white text-blue-900 hover:bg-blue-50 shadow-md hover:shadow-lg',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <a
      className={`gumroad-button ${combinedClassName}`}
      href={`https://gumroad.com/l/${productId}`}
      data-gumroad-single-product="true"
      target="_blank"
      rel="noopener noreferrer"
    >
      {text}
    </a>
  );
}
