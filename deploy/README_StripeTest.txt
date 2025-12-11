=== STRIPE TEST MODE ===

Use these card numbers to test Stripe payments (test mode only):
- 4242 4242 4242 4242 — Successful payment
- 4000 0000 0000 9995 — Payment declined
- 4000 0000 0000 0341 — CVC check fails

Any 3-digit CVC and any future expiration date will work.

Set your STRIPE_SECRET_KEY in .env to your test key from Stripe dashboard.
