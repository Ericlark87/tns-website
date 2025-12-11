import React from 'react';
import api from '../api';

export default function Checkout() {
  const handleCheckout = async () => {
    try {
      const response = await api.post('/stripe/create-checkout-session', {
        items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: 'Sample Product' },
              unit_amount: 2000
            },
            quantity: 1
          }
        ]
      });

      const data = response.data;

      if (data && data.url) {
        window.location.href = data.url;
      } else {
        alert('Stub checkout: no URL returned from backend.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Error starting checkout (stub backend).');
    }
  };

  return (
    <div className="p-4 bg-slate-800 rounded border border-slate-700 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Checkout</h2>
      <p className="text-slate-300 text-sm mb-4">
        This is a stub checkout. The backend will eventually call Stripe; right now it just
        returns a fake URL so the flow is wired.
      </p>
      <button
        onClick={handleCheckout}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition text-sm font-semibold"
      >
        Buy Now ($20)
      </button>
    </div>
  );
}
