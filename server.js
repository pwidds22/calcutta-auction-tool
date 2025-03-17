const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize express app
const app = express();

// Raw body for Stripe webhooks
app.post('/api/payment/webhook', express.raw({type: 'application/json'}), async (req, res) => {
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
    
    try {
      // Find user by email
      const userEmail = session.customer_details.email;
      const user = await User.findOne({ email: userEmail });
      
      if (user) {
        user.hasPaid = true;
        user.paymentDate = new Date();
        await user.save();
        console.log(`User ${userEmail} marked as paid`);
      } else {
        console.error(`No user found with email ${userEmail}`);
      }
    } catch (err) {
      console.error('Error updating user payment status:', err);
      return res.status(500).json({ success: false });
    }
  }

  res.json({ received: true });
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS
const allowedOrigins = [
  'http://localhost:5000',  // development
  'https://calcutta-auction-tool.onrender.com',  // production
  'https://calcuttagenius.com',  // custom domain
  'http://calcuttagenius.com'  // custom domain without https
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
}));

// Set cookie options
app.use((req, res, next) => {
  const originalCookie = res.cookie.bind(res);
  res.cookie = function(name, value, options = {}) {
    const defaultOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      domain: '.calcuttagenius.com'
    };
    return originalCookie(name, value, { ...defaultOptions, ...options });
  };
  res.clearCookie = res.clearCookie.bind(res);
  next();
});

// Serve static assets (css, images, js)
app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/js', express.static('js'));

// Import routes
const authRoutes = require('./routes/auth');
const userDataRoutes = require('./routes/userData');

// Use routes
app.use('/api/auth', (req, res, next) => {
  console.log('Auth request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    cookies: req.cookies
  });
  next();
}, authRoutes);

app.use('/api/data', userDataRoutes);

// Payment check middleware
const checkPayment = async (req, res, next) => {
  console.log('\nPayment check middleware:', {
    path: req.path,
    cookies: req.cookies,
    headers: req.headers
  });

  // Skip payment check for these routes
  const publicPaths = [
    '/home.html',  // Remove '/' to prevent matching /index.html
    '/login.html',
    '/register.html',
    '/payment.html',
    '/payment-success.html',
    '/payment-cancel.html',
    '/api/auth/register',
    '/api/auth/login',
    '/api/payment/webhook',
    '/favicon.ico',
    '/css',
    '/img',
    '/js'
  ];

  if (publicPaths.some(path => req.path === path || req.path.startsWith('/api/') && publicPaths.includes(req.path))) {
    console.log('Skipping payment check for public path:', req.path);
    return next();
  }

  // Check if user is authenticated
  if (!req.cookies.token) {
    console.log('No token found in cookies, redirecting to home');
    return res.redirect('/home.html');
  }

  try {
    const token = req.cookies.token;
    console.log('Token found:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);

    const user = await User.findById(decoded.id);
    console.log('User found:', {
      id: user?._id,
      email: user?.email,
      hasPaid: user?.hasPaid,
      paymentDate: user?.paymentDate
    });

    if (!user) {
      console.log('User not found in database, redirecting to home');
      return res.redirect('/home.html');
    }

    if (!user.hasPaid) {
      console.log('User has not paid, redirecting to payment');
      return res.redirect('/payment.html');
    }

    console.log('Payment check passed, proceeding to next middleware');
    req.user = user;
    next();
  } catch (err) {
    console.error('Payment check error:', err);
    res.redirect('/home.html');
  }
};

// Root route handler - move this after the payment check middleware
app.get('/', (req, res) => {
  res.redirect('/home.html');
});

// Protected HTML routes
const protectedPages = [
  'index.html',
  'auction.html',
  'teams.html',
  'profile.html',
  'dashboard.html',
  'team-odds.html'
];

// Apply payment check middleware to ALL routes except public ones
app.use(async (req, res, next) => {
  // Skip if it's a public path
  if (publicPaths.some(path => req.path === path || req.path.startsWith('/api/') && publicPaths.includes(req.path))) {
    return next();
  }
  
  // Apply payment check to everything else
  return checkPayment(req, res, next);
});

// Serve protected pages
protectedPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    console.log('Serving protected page:', page);
    res.set('Content-Type', 'text/html');
    res.sendFile(path.resolve(__dirname, page));
  });
});

// Serve public HTML files
app.get('/home.html', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.resolve(__dirname, 'home.html'));
});

app.get('/login.html', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.resolve(__dirname, 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.resolve(__dirname, 'register.html'));
});

// Serve payment pages
app.get('/payment.html', async (req, res) => {
  if (!req.cookies.token) {
    return res.redirect('/home.html');
  }

  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.redirect('/home.html');
    }

    // If user has already paid, redirect to index
    if (user.hasPaid) {
      console.log('User already paid, redirecting to index:', user.email);
      return res.redirect('/index.html');
    }

    res.set('Content-Type', 'text/html');
    res.sendFile(path.resolve(__dirname, 'payment.html'));
  } catch (err) {
    console.error('Payment page error:', err);
    res.redirect('/home.html');
  }
});

app.get('/payment-success.html', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.resolve(__dirname, 'payment-success.html'));
});

app.get('/payment-cancel.html', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.resolve(__dirname, 'payment-cancel.html'));
});

// Catch-all route - MUST be last
app.get('*', (req, res) => {
  res.redirect('/home.html');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    
    // Start server
    const PORT = process.env.NODE_ENV === 'production' ? 10000 : 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }); 