// Stripe integration utilities

/**
 * Redirect to Stripe Checkout
 * @param {string} priceId - Stripe Price ID
 * @param {string} userEmail - User's email (optional)
 */
export async function redirectToCheckout(priceId, userEmail = null) {
  try {
    // In production, this would call your backend to create a Checkout session
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerEmail: userEmail,
        successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`,
      }),
    });

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    // You'll need to load Stripe.js and use it here
    // const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    // await stripe.redirectToCheckout({ sessionId });

    console.log('Checkout session created:', sessionId);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create a Customer Portal session for managing subscription
 */
export async function redirectToCustomerPortal() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('dj_token')}`,
      },
      body: JSON.stringify({
        returnUrl: `${window.location.origin}/dashboard`,
      }),
    });

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}
