const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Log all payment requests
router.use((req, res, next) => {
  console.log('\nPayment request:', {
    method: req.method,
    path: req.path,
    headers: {
      'content-type': req.headers['content-type'],
      'cookie': req.headers['cookie'] ? 'present' : 'missing',
      'authorization': req.headers['authorization'] ? 'present' : 'missing'
    },
    cookies: {
      hasToken: !!req.cookies?.token,
      tokenLength: req.cookies?.token?.length
    },
    query: req.query
  });
  next();
});

// @route   POST api/payment/create-checkout-session
// @desc    Create a Stripe checkout session
// @access  Private
router.post('/create-checkout-session', protect, async (req, res) => {
  // Add CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      console.error('User not found:', {
        userId: req.user.id,
        userEmail: req.user.email
      });
      return res.status(404).json({
        success: false,
        message: 'User not found. Please try logging in again.'
      });
    }

    if (user.hasPaid) {
      console.log('User already paid:', user.email);
      return res.status(400).json({
        success: false,
        message: 'You have already purchased access to Calcutta Edge.'
      });
    }

    // Instead of creating a checkout session, return the Payment Link URL
    const paymentLinkUrl = 'https://buy.stripe.com/bIYdSv0I83XwbQY7ss';
    
    console.log('Redirecting to Payment Link:', {
      userEmail: user.email,
      paymentLinkUrl: paymentLinkUrl
    });

    res.json({
      success: true,
      url: paymentLinkUrl
    });

  } catch (err) {
    console.error('Payment link error:', {
      error: err.message,
      stack: err.stack,
      userEmail: req.user?.email,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again or contact support.'
    });
  }
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

// Webhook handling for successful payments
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', {
        sessionId: session.id,
        customerId: session.customer,
        paymentStatus: session.payment_status,
        amount: session.amount_total,
        customerEmail: session.customer_details?.email
      });

      try {
        // Find user by email
        const userEmail = session.customer_details?.email;
        if (!userEmail) {
          console.error('No email found in session:', session.id);
          break;
        }

        const user = await User.findOne({ email: userEmail.toLowerCase() });
        if (!user) {
          console.error('User not found for email:', userEmail);
          break;
        }

        // Update user payment status
        user.hasPaid = true;
        user.paymentDate = new Date();
        await user.save();

        console.log('Updated user payment status:', {
          userId: user.id,
          email: user.email,
          paymentDate: user.paymentDate
        });
      } catch (err) {
        console.error('Error updating user payment status:', {
          error: err.message,
          sessionId: session.id,
          customerEmail: session.customer_details?.email
        });
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router; 