const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/payment/create-checkout-session
// @desc    Create a Stripe checkout session
// @access  Private
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.hasPaid) {
      return res.status(400).json({
        success: false,
        message: 'User has already paid'
      });
    }

    // Create or retrieve Stripe customer
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id
        }
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Calcutta Genius Full Access',
              description: 'One-time payment for full access to Calcutta Genius'
            },
            unit_amount: 1499, // $14.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: {
        userId: user.id
      },
      // Add promo code if provided
      ...(req.body.promoCode && {
        discounts: [{
          coupon: req.body.promoCode
        }]
      })
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (err) {
    console.error('Payment session error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error creating payment session'
    });
  }
});

// @route   POST api/payment/webhook
// @desc    Handle Stripe webhook events
// @access  Public
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;

    try {
      const user = await User.findById(userId);
      if (user) {
        user.hasPaid = true;
        user.paymentDate = new Date();
        await user.save();
      }
    } catch (err) {
      console.error('Error updating user payment status:', err);
      return res.status(500).json({ success: false });
    }
  }

  res.json({ received: true });
});

// @route   GET api/payment/status
// @desc    Get user's payment status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      hasPaid: user.hasPaid,
      paymentDate: user.paymentDate
    });
  } catch (err) {
    console.error('Error getting payment status:', err);
    res.status(500).json({
      success: false,
      message: 'Error getting payment status'
    });
  }
});

module.exports = router; 