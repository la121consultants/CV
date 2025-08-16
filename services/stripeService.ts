import { loadStripe } from '@stripe/stripe-js';

// **SECURITY WARNING**
// Storing API keys on the client-side is insecure and should NOT be done in a production environment.
// This is for demonstration purposes only. In a real application, the Stripe object would be
// created on your server, and you would only use the Publishable Key on the client.

// This function redirects the user to Stripe Checkout.
export const redirectToCheckout = async (priceId: string) => {
  const publishableKey = localStorage.getItem('stripePublishableKey');
  
  if (!publishableKey) {
    throw new Error('Stripe is not configured. Please contact the administrator.');
  }

  const stripe = await loadStripe(publishableKey);
  if (!stripe) {
    throw new Error('Failed to initialize Stripe. Please try again.');
  }

  const result = await stripe.redirectToCheckout({
    lineItems: [{ price: priceId, quantity: 1 }],
    mode: priceId.includes('sub') ? 'subscription' : 'payment', // Simple check for subscription vs one-time
    successUrl: window.location.href, // Redirect back to the app on success
    cancelUrl: window.location.href, // Redirect back to the app on cancellation
  });

  if (result.error) {
    // This error will be displayed to the user by the calling component.
    throw new Error(result.error.message);
  }
};
