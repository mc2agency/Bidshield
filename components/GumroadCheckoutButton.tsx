'use client';

import WaitlistButton from './WaitlistButton';
import { GumroadProductKey } from '@/lib/gumroad-products';

interface GumroadCheckoutButtonProps {
  productKey: GumroadProductKey;
  text?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'large';
  showIcon?: boolean;
}

/**
 * GumroadCheckoutButton — currently shows a waitlist form
 * since Gumroad products aren't live yet.
 * When products go live, swap back to actual Gumroad links.
 */
export default function GumroadCheckoutButton({
  text = 'Coming Soon — Join Waitlist',
  className = '',
  variant = 'primary',
}: GumroadCheckoutButtonProps) {
  return (
    <WaitlistButton
      text={text}
      className={className}
      variant={variant}
    />
  );
}
