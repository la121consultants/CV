
import React, { useState } from 'react';
import { X, Crown, CreditCard, Loader2, AlertCircle } from 'lucide-react';

// Static Stripe Payment Links as requested by the user.
const ONETIME_PAYMENT_LINK = 'https://buy.stripe.com/eVq3cveBvbISgDF9Mqdwc0m';
const SUBSCRIPTION_PAYMENT_LINK = 'https://buy.stripe.com/00w7sLgJD3cm0EH5wadwc0n';

interface UsageLimitModalProps {
  onClose: () => void;
  isUpgradeFlow?: boolean;
}

export const UsageLimitModal: React.FC<UsageLimitModalProps> = ({ onClose, isUpgradeFlow }) => {
  const [loading, setLoading] = useState<'none' | 'onetime' | 'sub'>('none');
  const [error, setError] = useState<string | null>(null);
  
  const handleCheckout = (type: 'onetime' | 'sub') => {
    setError(null);
    setLoading(type);

    const url = type === 'onetime' ? ONETIME_PAYMENT_LINK : SUBSCRIPTION_PAYMENT_LINK;

    if (!url) {
        setError("The payment link is not configured. Please contact the administrator.");
        setLoading('none');
        return;
    }

    // Redirect to the Stripe payment page.
    window.location.href = url;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative transform transition-all duration-300 ease-out scale-95 animate-fadeInScale">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center">
           <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-light mb-4">
            <Crown className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {isUpgradeFlow ? 'Upgrade to Pro' : 'Free Quota Reached'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            {isUpgradeFlow 
              ? "Unlock unlimited reviews and refinements by choosing a plan below. Get the professional edge you need!"
              : "You've used your free actions. To continue generating or refining your CV, please choose one of the options below."
            }
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Pay per CV Option */}
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-primary transition-all shadow-lg hover:shadow-xl hover:border-primary-hover">
               <div className="flex items-center mb-3">
                 <CreditCard className="h-8 w-8 text-secondary mr-3" />
                 <h4 className="font-bold text-xl text-gray-800">Pay as you Go</h4>
               </div>
               <p className="text-4xl font-extrabold text-gray-900 mb-3">
                £1.00<span className="text-lg font-medium text-gray-500">/per CV</span>
              </p>
              <p className="text-gray-600 mb-4 h-12">
                Perfect for a one-time application. Get one more expertly tailored CV.
              </p>
              <button
                onClick={() => handleCheckout('onetime')}
                disabled={loading !== 'none'}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-secondary text-white font-bold text-lg rounded-lg shadow-md hover:bg-secondary-hover focus:outline-none focus:ring-4 focus:ring-orange-300 transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-wait"
              >
                {loading === 'onetime' ? <Loader2 className="animate-spin h-6 w-6"/> : 'Purchase One CV' }
              </button>
            </div>

            {/* Subscription Option */}
             <div className="bg-primary-light p-6 rounded-lg border-2 border-primary transition-all shadow-lg hover:shadow-xl hover:border-primary-hover">
               <div className="flex items-center mb-3">
                 <Crown className="h-8 w-8 text-yellow-500 mr-3" />
                 <h4 className="font-bold text-xl text-gray-800">Go Unlimited</h4>
               </div>
               <p className="text-4xl font-extrabold text-gray-900 mb-3">
                £4.99<span className="text-lg font-medium text-gray-500">/month</span>
              </p>
              <p className="text-gray-600 mb-4 h-12">
                Get unlimited CV reviews, priority support, and access to new features.
              </p>
              <button
                onClick={() => handleCheckout('sub')}
                disabled={loading !== 'none'}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold text-lg rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-wait"
              >
                {loading === 'sub' ? <Loader2 className="animate-spin h-6 w-6"/> : 'Subscribe Now' }
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-100 border border-red-200 text-red-800 p-3 rounded-lg flex items-center text-sm">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0"/>
                <span><strong>Error:</strong> {error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
