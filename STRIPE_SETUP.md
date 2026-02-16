# Stripe Integration Setup Guide

## Overview
Your DJ Request App now has a complete SaaS landing page with Stripe payment integration! Here's how to enable payments and start selling subscriptions.

## What's Included

### Landing Page Features
- ✅ Hero section with CTA buttons
- ✅ Features showcase (6 key features)
- ✅ How It Works section (3 simple steps)
- ✅ Pricing tiers (Starter $9, Pro $29, Enterprise $99)
- ✅ Footer with navigation links
- ✅ Black and purple theme
- ✅ Mobile responsive design

### Backend Integration
- ✅ Stripe Checkout session creation
- ✅ Customer Portal for subscription management
- ✅ Webhook endpoint for subscription events
- ✅ Stripe SDK installed

## Step-by-Step Setup

### 1. Create a Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete your account verification

### 2. Get Your API Keys
1. Go to Stripe Dashboard → Developers → API keys
2. Copy your **Publishable key** (starts with `pk_`)
3. Copy your **Secret key** (starts with `sk_`)

### 3. Create Products and Prices
1. Go to Stripe Dashboard → Products
2. Create 3 products matching your tiers:

**Starter Plan:**
- Name: DJ Request - Starter
- Price: $9/month (recurring)
- Copy the Price ID (starts with `price_`)

**Pro Plan:**
- Name: DJ Request - Pro
- Price: $29/month (recurring)
- Copy the Price ID (starts with `price_`)

**Enterprise Plan:**
- Name: DJ Request - Enterprise
- Price: $99/month (recurring)
- Copy the Price ID (starts with `price_`)

### 4. Configure Railway Environment Variables
1. Go to your Railway project
2. Click on your service → Variables tab
3. Add these variables:

```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx (get this in step 5)
```

### 5. Set Up Webhooks
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://dj-requests-production.up.railway.app/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to Railway as `STRIPE_WEBHOOK_SECRET`

### 6. Update Price IDs in Code
1. Open `client/src/pages/LandingPage.jsx`
2. Find the `plans` array (around line 42)
3. Replace the placeholder `priceId` values with your real Stripe Price IDs:

```javascript
const plans = [
  {
    name: 'Starter',
    price: 9,
    priceId: 'price_1Abc123...', // Replace with your Starter price ID
    // ...
  },
  {
    name: 'Pro',
    price: 29,
    priceId: 'price_1Def456...', // Replace with your Pro price ID
    // ...
  },
  {
    name: 'Enterprise',
    price: 99,
    priceId: 'price_1Ghi789...', // Replace with your Enterprise price ID
    // ...
  },
];
```

4. Commit and push:
```bash
git add client/src/pages/LandingPage.jsx
git commit -m "Update Stripe price IDs"
git push origin main
```

### 7. Enable Stripe Checkout (Optional - Client Side)
If you want to use Stripe.js for better checkout experience:

1. Install Stripe.js library:
```bash
cd client
npm install @stripe/stripe-js
```

2. Update `client/src/utils/stripe.js` to use Stripe.js:
```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export async function redirectToCheckout(priceId, userEmail = null) {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, customerEmail: userEmail }),
  });

  const { url } = await response.json();
  window.location.href = url; // Direct redirect to Stripe
}
```

3. Add `VITE_STRIPE_PUBLIC_KEY` to your `.env` file (for local development)

## Testing

### Test Mode
1. Use test API keys (start with `pk_test_` and `sk_test_`)
2. Use test credit cards from [Stripe Testing](https://stripe.com/docs/testing):
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

### Live Mode
1. Switch to live API keys in Railway
2. Your app is ready to accept real payments!

## What Happens When Someone Subscribes?

1. User clicks "Get Started" on a plan
2. Redirected to Stripe Checkout
3. Enters payment details
4. On successful payment:
   - `checkout.session.completed` webhook fires
   - You can update user's subscription status in database
   - User is redirected to `/dashboard`

## Next Steps

### Recommended Enhancements
1. **Add Subscription Status to Database**
   - Add `subscription_id`, `subscription_status`, `stripe_customer_id` to `djs` table
   - Update these fields in webhook handlers

2. **Restrict Features by Plan**
   - Check subscription tier before allowing certain actions
   - Limit event count for Starter plan (5/month)
   - Show upgrade prompts for Pro features

3. **Add Usage Tracking**
   - Track events created per month
   - Show usage stats in DJ dashboard
   - Send alerts when approaching limits

4. **Implement Grace Periods**
   - Allow 3-7 days after payment failure before downgrading
   - Send reminder emails

5. **Add Promo Codes**
   - Already enabled in checkout (`allow_promotion_codes: true`)
   - Create codes in Stripe Dashboard

## Support

For Stripe integration issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Discord](https://discord.gg/stripe)

For app issues:
- Check Railway logs
- Review webhook events in Stripe Dashboard

---

**Ready to launch?** Once you've completed these steps, your landing page will be live at:
`https://dj-requests-production.up.railway.app`

Happy selling! 💜🎵
