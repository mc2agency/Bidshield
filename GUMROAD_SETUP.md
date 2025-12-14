# Gumroad Integration Setup Guide

This guide explains how to set up and customize the Gumroad integration for MC2 Estimating Academy.

## Overview

The site uses Gumroad for payment processing and digital product delivery. The integration uses Gumroad's overlay checkout for a seamless user experience.

## Files

1. **`components/GumroadCheckoutButton.tsx`** - Main checkout button component
2. **`lib/gumroad-products.ts`** - Product ID configuration
3. **`components/GumroadButton.tsx`** - Basic Gumroad button (alternative)

## Setup Steps

### 1. Create Products on Gumroad

1. Go to [Gumroad.com](https://gumroad.com) and log in
2. Click "Create Product" for each product/course
3. Set up:
   - Product name
   - Description
   - Price
   - Upload files (templates, course access, etc.)
   - Delivery settings

### 2. Get Product Permalinks

For each product:
1. Go to product settings
2. Find the "Permalink" or "Share link"
3. The permalink format is: `https://gumroad.com/l/YOUR_PRODUCT_ID`
4. Copy the `YOUR_PRODUCT_ID` part

### 3. Update Product IDs

Edit `/lib/gumroad-products.ts` and replace the placeholder IDs:

```typescript
export const GUMROAD_PRODUCTS = {
  // Replace 'mc2-template-bundle' with your actual Gumroad product ID
  templateBundle: 'YOUR_ACTUAL_PRODUCT_ID',

  // Example with real ID:
  // templateBundle: 'estimatrix-bundle-2024',

  asphaltShingle: 'YOUR_PRODUCT_ID',
  // ... and so on
};
```

### 4. Using the Checkout Button

In any page component:

```tsx
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

// Basic usage
<GumroadCheckoutButton
  productKey="templateBundle"
  text="Buy Template Bundle - $129"
/>

// With variant
<GumroadCheckoutButton
  productKey="estimatingFundamentals"
  text="Enroll Now - $497"
  variant="large"
/>

// Different styles
<GumroadCheckoutButton
  productKey="bluebeamMastery"
  text="Get Bluebeam Course"
  variant="outline"
  showIcon={false}
/>
```

## Button Variants

- **`primary`** - Blue background, white text (default)
- **`secondary`** - White background, blue text
- **`outline`** - Transparent with blue border
- **`large`** - Bigger padding and text

## Testing

1. **Test Mode**: Gumroad offers test mode for products. Enable this while developing.
2. **Live Testing**: Use a test credit card in Gumroad checkout
3. **Verification**: Complete a test purchase to verify email delivery works

## Gumroad Overlay

The integration uses Gumroad's overlay checkout (modal popup):
- Customers stay on your site during checkout
- Better conversion rates
- Automatic email delivery after purchase
- Gumroad handles VAT/tax calculation

## Customization

### Custom Button Styling

You can pass custom CSS classes:

```tsx
<GumroadCheckoutButton
  productKey="templateBundle"
  className="w-full md:w-auto text-xl"
/>
```

### Adding New Products

1. Add the product ID to `GUMROAD_PRODUCTS` in `/lib/gumroad-products.ts`
2. Optionally add metadata to `PRODUCT_META`
3. Use the new product key in any component

```typescript
export const GUMROAD_PRODUCTS = {
  // ... existing products
  newProduct: 'your-new-product-id',
};
```

## Fees

Gumroad charges:
- **10% fee** on the current plan (includes payment processing)
- Consider upgrading to Gumroad+ for lower fees (2.9% + $0.30)

## Alternative: Phase 2 (Custom Stripe Integration)

For Phase 2, you may want to:
1. Use Stripe directly (lower fees: 2.9% + $0.30)
2. Build custom checkout with Next.js API routes
3. Implement membership management
4. Keep customer data in your own database

This would require:
- Stripe account setup
- API routes for checkout sessions
- Webhook handlers for payment events
- Customer dashboard
- Digital delivery system

## Support

- Gumroad Help: https://help.gumroad.com
- Test Mode: Enable in Gumroad settings
- Analytics: View sales in Gumroad dashboard

## Security

- All payments handled by Gumroad (PCI compliant)
- No credit card data touches your server
- HTTPS required (handled by Vercel)
- Secure file delivery through Gumroad

## Next Steps

1. Create all products on Gumroad
2. Update product IDs in config file
3. Test checkout flow
4. Set up email sequences in Gumroad
5. Configure webhook notifications (optional)
