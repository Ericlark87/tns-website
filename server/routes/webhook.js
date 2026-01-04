//server>routes>webhook.js
import express from 'express';
import Stripe from 'stripe';
import bodyParser from 'body-parser';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe requires raw body for webhooks
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event types
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment success:', session);
    // Update DB, activate subscription, etc.
  }

  res.json({ received: true });
});

export default router;