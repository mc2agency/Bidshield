# Gumroad Integration Setup Guide

## Overview

This guide shows you how to set up Gumroad to sell courses, products, and memberships on MC2 Estimating Academy.

---

## Step 1: Create Gumroad Products

### A. Courses ($147-$497)

Go to https://gumroad.com/products/new and create:

1. **Bluebeam Mastery** - $147
   - Product permalink: `bluebeam-mastery`
   - Type: Digital product
   - Deliverable: Link to course (your site dashboard)

2. **Estimating Fundamentals** - $497
   - Product permalink: `estimating-fundamentals`

3. **Measurement Technology** - $197
   - Product permalink: `measurement-technology`

4. **Construction Submittals** - $197
   - Product permalink: `construction-submittals`

5. **AutoCAD Submittals** - $147
   - Product permalink: `autocad-submittals`

6. **Estimating Software** - $97
   - Product permalink: `estimating-software`

7. **SketchUp Visualization** - $127
   - Product permalink: `sketchup-visualization`

### B. Products ($39-$197)

1. **TPO/PVC/EPDM Template** - $39
   - Product permalink: `tpo-template`
   - Type: Digital download
   - Upload: Excel file

2. **Asphalt Shingle Template** - $39
   - Product permalink: `asphalt-shingle-template`

3. **Metal Roofing Template** - $39
   - Product permalink: `metal-roofing-template`

4. **Template Bundle** - $129
   - Product permalink: `template-bundle`

5. **Estimating Checklist** - $29
   - Product permalink: `estimating-checklist`

6. **Proposal Templates** - $79
   - Product permalink: `proposal-templates`

### C. Membership ($197/mo)

1. **MC2 Pro Membership** - $197/month
   - Product permalink: `mc2-pro-membership`
   - Type: Subscription (recurring)
   - Billing: Monthly
   - Description: All-access pass to courses + products

---

## Step 2: Set Up Webhook

### In Gumroad Dashboard:

1. Go to **Settings** → **Advanced**
2. Find **Ping URL** section
3. Add your webhook URL:
   ```
   https://mc2estimating-1.vercel.app/api/webhooks/gumroad
   ```
   (Replace with your actual domain)

4. Click **Save**

### Test the Webhook:

1. Click **Send test ping** button
2. Check your server logs
3. Should see: "Gumroad webhook endpoint is active"

---

## Step 3: Product Configuration

For each product, configure:

### Delivery Method

**For Courses:**
- Content: Link to dashboard
- Message:
  ```
  Thank you for purchasing {product}!

  Access your course here:
  https://mc2estimating.com/dashboard

  If you don't have an account yet, create one with this email address to see your purchase.

  Questions? Reply to this email.
  ```

**For Products (Templates):**
- Content: File attachment (Excel/PDF)
- Also include link to dashboard for re-downloads

**For Membership:**
- Content: Link to dashboard
- Recurring billing enabled
- Cancel anytime option

---

## Step 4: Connect Products to Your Site

Update your course/product pages with Gumroad buy buttons:

### Example: Bluebeam Course Page

```tsx
<a
  href="https://gumroad.com/l/bluebeam-mastery"
  className="btn btn-primary"
  data-gumroad-single-product="true"
>
  Buy Course - $147
</a>

<script src="https://gumroad.com/js/gumroad.js"></script>
```

### Example: Template Product Page

```tsx
<a
  href="https://gumroad.com/l/tpo-template"
  className="btn btn-primary"
  data-gumroad-single-product="true"
>
  Buy Template - $39
</a>
```

---

## Step 5: Test Purchase Flow

### End-to-End Test:

1. **Make Test Purchase**
   - Go to product page
   - Click "Buy Now"
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout

2. **Check Webhook**
   - Webhook should fire
   - Check Convex dashboard → Purchases table
   - Should see new purchase record

3. **Create Account**
   - Sign up with same email used in test purchase
   - Go to dashboard
   - Should see purchased course/product

4. **Verify Access**
   - Try to access course content
   - Should work immediately

---

## Step 6: Email Configuration

### In Gumroad:

1. Go to each product → **Email settings**
2. Customize confirmation email:

**Subject:** Your {product} is ready!

**Body:**
```
Hi there!

Thanks for purchasing {product} from MC2 Estimating Academy.

🎯 Access your purchase:
https://mc2estimating.com/dashboard

📧 Login with this email: {email}

If you don't have an account yet:
1. Create one at mc2estimating.com/sign-up
2. Use THIS email address: {email}
3. Your purchase will automatically appear in your dashboard

Questions? Just reply to this email.

- MC2 Estimating Team
```

---

## Webhook Payload Reference

When someone buys, Gumroad sends this data:

```json
{
  "seller_id": "your_seller_id",
  "product_id": "bluebeam-mastery",
  "product_name": "Bluebeam Mastery Course",
  "product_permalink": "bluebeam-mastery",
  "email": "customer@example.com",
  "price": "147",
  "currency": "USD",
  "sale_id": "abc123",
  "order_id": "xyz789",
  "subscription_id": null,
  "recurrence": null,
  "refunded": "false",
  "disputed": "false"
}
```

---

## Product ID Mapping

Make sure these match in your code:

| Gumroad Permalink | Internal Product ID | Type |
|-------------------|---------------------|------|
| `bluebeam-mastery` | `bluebeam-mastery` | course |
| `estimating-fundamentals` | `estimating-fundamentals` | course |
| `tpo-template` | `tpo-template` | product |
| `mc2-pro-membership` | `mc2-pro-membership` | membership |

If permalinks don't match, update in:
- `app/api/webhooks/gumroad/route.ts` → `PRODUCT_MAPPING`
- `convex/gumroad.ts` → Course/membership ID arrays

---

## Troubleshooting

### Webhook Not Firing

1. Check URL is correct in Gumroad settings
2. Send test ping from Gumroad
3. Check server logs
4. Verify HTTPS (required)

### Purchase Not Showing in Dashboard

1. Check Convex → Purchases table for record
2. Verify email matches exactly
3. Try logging out and back in
4. Check browser console for errors

### Access Not Granted

1. Check product ID mapping in code
2. Verify webhook received purchase
3. Check user's `purchasedCourses` array in Convex
4. Try syncing manually via Convex dashboard

---

## Revenue Tracking

View sales in:
- **Gumroad Dashboard**: Sales analytics, payouts
- **Convex Dashboard**: Purchase records, user access
- **Your Analytics**: Track conversions, customer lifetime value

---

## Next Steps After Setup

1. **Test all product types:**
   - Buy a course → Verify access
   - Buy a product → Download works
   - Subscribe to membership → All courses unlock

2. **Set up email sequences:**
   - Welcome email after purchase
   - Onboarding series for courses
   - Monthly content for members

3. **Monitor conversions:**
   - Track which products sell best
   - A/B test pricing
   - Optimize checkout flow

4. **Add upsells:**
   - Offer bundle on product pages
   - Membership upsell on course checkout
   - One-time offers after purchase

---

## Support

If something isn't working:
1. Check server logs for webhook errors
2. Verify Convex data in dashboard
3. Test with different email address
4. Contact Gumroad support for payment issues

**Ready to launch!** 🚀
