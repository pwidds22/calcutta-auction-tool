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

  console.log('\nCreating checkout session:', {
    userId: req.user?.id,
    userEmail: req.user?.email,
    hasToken: !!req.cookies?.token,
    hasAuthHeader: !!req.headers.authorization,
    authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'missing',
    origin: req.headers.origin,
    host: req.headers.host,
    stripeKey: process.env.STRIPE_SECRET_KEY ? 'present' : 'missing',
    nodeEnv: process.env.NODE_ENV
  });

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is not configured');
    }

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
        message: 'You have already purchased access to Calcutta Genius.'
      });
    }

    // Create or retrieve Stripe customer
    let customer;
    try {
      if (user.stripeCustomerId) {
        console.log('Retrieving existing Stripe customer:', user.stripeCustomerId);
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        console.log('Creating new Stripe customer for:', user.email);
        customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id
          }
        });
        user.stripeCustomerId = customer.id;
        await user.save();
      }
    } catch (stripeErr) {
      console.error('Stripe customer error:', {
        error: stripeErr.message,
        type: stripeErr.type,
        code: stripeErr.code,
        userEmail: user.email
      });
      return res.status(500).json({
        success: false,
        message: 'Error processing payment. Please try again or contact support.'
      });
    }

    // Create checkout session
    try {
      console.log('Creating Stripe checkout session for customer:', customer.id);
      const sessionConfig = {
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
        allow_promotion_codes: true, // Enable promo code field
        automatic_tax: { enabled: false }
      };

      // If a promo code is provided, validate it first
      if (req.body.promoCode) {
        try {
          // First try to find a promotion code
          const promotionCodes = await stripe.promotionCodes.list({
            code: req.body.promoCode,
            active: true,
            limit: 1
          });

          console.log('Searching for promotion code:', {
            requestedCode: req.body.promoCode,
            foundCodes: promotionCodes.data.length,
            firstCode: promotionCodes.data[0]?.id || 'none'
          });

          if (promotionCodes.data.length > 0) {
            const promotionCode = promotionCodes.data[0];
            console.log('Valid promotion code found:', {
              code: promotionCode.code,
              promoId: promotionCode.id,
              couponId: promotionCode.coupon.id,
              active: promotionCode.active,
              valid: promotionCode.valid
            });
            
            // Use the promotion code directly
            sessionConfig.discounts = [{
              promotion_code: promotionCode.id
            }];
          } else {
            // If no promotion code found, try to find a coupon
            const coupons = await stripe.coupons.list({
              limit: 100
            });
            
            console.log('Searching for coupon:', {
              requestedCode: req.body.promoCode,
              totalCoupons: coupons.data.length
            });

            const matchingCoupon = coupons.data.find(
              coupon => coupon.name?.toLowerCase() === req.body.promoCode.toLowerCase() ||
                       coupon.id.toLowerCase() === req.body.promoCode.toLowerCase()
            );

            if (matchingCoupon) {
              console.log('Valid coupon found:', {
                code: req.body.promoCode,
                couponId: matchingCoupon.id,
                couponName: matchingCoupon.name,
                valid: matchingCoupon.valid,
                active: !matchingCoupon.deleted
              });
              sessionConfig.discounts = [{
                coupon: matchingCoupon.id
              }];
            } else {
              console.log('No valid promotion code or coupon found:', {
                requestedCode: req.body.promoCode
              });
              throw new Error('Invalid or inactive promotion code');
            }
          }
        } catch (promoErr) {
          console.error('Promotion code validation error:', {
            code: req.body.promoCode,
            error: promoErr.message,
            stack: promoErr.stack
          });
          return res.status(400).json({
            success: false,
            message: 'Invalid promotion code. Please check and try again.'
          });
        }
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      console.log('Successfully created checkout session:', {
        sessionId: session.id,
        userEmail: user.email,
        customerId: customer.id,
        successUrl: session.success_url,
        cancelUrl: session.cancel_url,
        hasPromoCode: !!req.body.promoCode,
        promoCode: req.body.promoCode || 'none'
      });

      res.json({
        success: true,
        sessionId: session.id,
        url: session.url
      });
    } catch (checkoutErr) {
      console.error('Stripe checkout error:', {
        error: checkoutErr.message,
        type: checkoutErr.type,
        code: checkoutErr.code,
        param: checkoutErr.param,
        userEmail: user.email,
        customerId: customer.id
      });
      
      let errorMessage = 'Error processing payment. Please try again.';
      
      if (checkoutErr.type === 'StripeInvalidRequestError') {
        if (checkoutErr.param === 'coupon') {
          errorMessage = 'Invalid promo code. Please check and try again.';
        }
      }
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  } catch (err) {
    console.error('Payment session error:', {
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

module.exports = router; 