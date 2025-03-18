const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Environment variable validation
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'FRONTEND_URL'
];

console.log('\nEnvironment configuration:', {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT || (process.env.NODE_ENV === 'production' ? 10000 : 5000),
  frontendUrl: process.env.FRONTEND_URL,
  hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
  hasStripePublishable: !!process.env.STRIPE_PUBLISHABLE_KEY,
  hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
  hasJwtSecret: !!process.env.JWT_SECRET,
  hasMongoUri: !!process.env.MONGO_URI
});

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('\nMissing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Initialize express app
const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const userDataRoutes = require('./routes/userData');
const blogRoutes = require('./routes/blog');
const paymentRoutes = require('./routes/payment');

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS
const allowedOrigins = [
  'http://localhost:5000',  // development
  'http://localhost:3000',  // development alternative port
  'http://127.0.0.1:5000',  // development
  'http://127.0.0.1:3000',  // development alternative port
  'https://calcutta-auction-tool.onrender.com',  // production
  'https://calcuttagenius.com',  // custom domain
  'http://calcuttagenius.com',   // custom domain without https
  'https://www.calcuttagenius.com',  // www subdomain
  'http://www.calcuttagenius.com'    // www subdomain without https
];

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || process.env.NODE_ENV === 'development') {
      console.log('Allowing request with no origin or in development mode');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Origin not allowed:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    
    console.log('Origin allowed:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['set-cookie']
}));

// Set cookie options
app.use((req, res, next) => {
  const originalCookie = res.cookie.bind(res);
  res.cookie = function(name, value, options = {}) {
    const isLocalhost = req.get('host')?.includes('localhost') || req.get('host')?.includes('127.0.0.1');
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const defaultOptions = {
      httpOnly: true,
      secure: !isLocalhost, // Only false for localhost
      sameSite: 'Lax', // Use Lax for all environments for better compatibility
      path: '/'
    };

    // Set domain only for production with custom domain
    if (req.get('host')?.includes('calcuttagenius.com')) {
      defaultOptions.domain = '.calcuttagenius.com';
    }

    // Log cookie settings in development
    if (isDevelopment) {
      console.log('Cookie settings:', {
        name,
        host: req.get('host'),
        isDevelopment,
        isLocalhost,
        options: { ...defaultOptions, ...options }
      });
    }

    return originalCookie(name, value, { ...defaultOptions, ...options });
  };
  res.clearCookie = res.clearCookie.bind(res);
  next();
});

// Add after other middleware setup, before routes
app.use((req, res, next) => {
  // Clear unrelated cookies
  const cookiesToClear = [
    'BGSGuillotineSession',
    'GuillotineMembership', 
    'guillotine_session',
    'guillotine_membership'
  ];
  
  cookiesToClear.forEach(cookieName => {
    if (req.cookies[cookieName]) {
      res.clearCookie(cookieName, { path: '/' });
      console.log(`Cleared unrelated cookie: ${cookieName}`);
    }
  });
  
  next();
});

// Serve static assets (css, images, js)
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Use routes - Important: Order matters!
// 1. First, register the raw body parser route for Stripe webhook
app.post('/api/payment/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  console.log('\nWebhook received:', {
    type: req.headers['stripe-signature'] ? 'Signed' : 'Unsigned',
    timestamp: new Date().toISOString()
  });

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('Webhook event constructed successfully:', {
      type: event.type,
      id: event.id,
      timestamp: new Date(event.created * 1000).toISOString()
    });
  } catch (err) {
    console.error('Webhook signature verification failed:', {
      error: err.message,
      signature: sig ? sig.substring(0, 20) + '...' : 'missing'
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('\nProcessing completed checkout session:', {
      id: session.id,
      customerEmail: session.customer_email,
      amount: session.amount_total,
      currency: session.currency,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Get the email from the session
      const stripeEmail = session.customer_email || (session.customer_details && session.customer_details.email);
      console.log('Looking up user by Stripe email:', stripeEmail);
      
      if (!stripeEmail) {
        console.error('No email found in session data:', {
          sessionId: session.id,
          hasCustomerDetails: !!session.customer_details
        });
        return res.status(400).json({ success: false, error: 'No email found in session data' });
      }
      
      // Try to find the user by the email from Stripe
      let user = await User.findOne({ email: stripeEmail });
      
      // If no user found with the Stripe email, check if there's a recent user with unpaid status
      if (!user) {
        console.log('No user found with Stripe email, checking recent unpaid users:', {
          stripeEmail,
          timestamp: new Date().toISOString()
        });
        
        // Look for users created in the last hour who haven't paid yet
        const recentUsers = await User.find({ 
          hasPaid: false,
          createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
        }).sort({ createdAt: -1 }); // Most recent first
        
        if (recentUsers.length > 0) {
          user = recentUsers[0]; // Use the most recently created unpaid user
          console.log('Found recent unpaid user:', {
            email: user.email,
            createdAt: user.createdAt,
            timeSinceCreation: Math.round((Date.now() - user.createdAt) / 1000 / 60) + ' minutes'
          });
        } else {
          console.error('No recent unpaid users found');
        }
      }
      
      if (user) {
        user.hasPaid = true;
        user.paymentDate = new Date();
        await user.save();
        console.log('Successfully marked user as paid:', {
          email: user.email,
          paymentDate: user.paymentDate,
          sessionId: session.id
        });
      } else {
        console.error('Could not find a user to mark as paid:', {
          sessionId: session.id,
          stripeEmail,
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({ received: true });
    } catch (err) {
      console.error('Error processing webhook:', {
        error: err.message,
        sessionId: session.id,
        timestamp: new Date().toISOString()
      });
      return res.status(500).json({ success: false });
    }
  } else {
    // Handle other event types
    console.log('Received webhook event:', {
      type: event.type,
      id: event.id,
      timestamp: new Date().toISOString()
    });
    res.json({ received: true });
  }
});

// 2. Then register the regular routes
app.use('/api/auth', (req, res, next) => {
  console.log('Auth request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    cookies: req.cookies
  });
  next();
}, authRoutes);

// 3. Register payment routes
app.use('/api/payment', (req, res, next) => {
  console.log('Payment route hit:', {
    method: req.method,
    path: req.path,
    url: req.url,
    body: req.body,
    cookies: req.cookies?.token ? 'token present' : 'no token',
    auth: req.headers.authorization ? 'auth present' : 'no auth'
  });
  next();
}, paymentRoutes);

app.use('/api/data', userDataRoutes);
app.use('/blog', blogRoutes);

// Define public and protected paths at the top level
const publicPaths = [
    '/',
    '/login',
    '/register',
    '/payment',
    '/payment-success',
    '/payment-cancel',
    '/api/auth/register',
    '/api/auth/login',
    '/api/payment/webhook',
    '/favicon.ico',
    '/css',
    '/img',
    '/js',
    '/robots.txt',
    '/sitemap.xml'
];

const protectedPages = [
    '/auction',
    '/profile'
];

// Payment check middleware
const checkPayment = async (req, res, next) => {
    console.log('\nPayment check middleware:', {
        path: req.path,
        cookies: req.cookies,
        headers: req.headers
    });

    // Skip payment check for public paths
    const isPublicPath = publicPaths.some(path => 
        req.path === path || 
        req.path.startsWith(path + '/') ||
        (req.path.startsWith('/api/') && publicPaths.includes(req.path))
    );

    if (isPublicPath) {
        console.log('Skipping payment check for public path:', req.path);
        return next();
    }

    // Get the token from cookies, authorization header, or query parameter
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token && req.query?.token) {
        token = req.query.token;
    }

    // Check if user is authenticated
    if (!token) {
        console.log('No token found in cookies, headers, or query, redirecting to login');
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            console.log('User not found in database, redirecting to login');
            return res.redirect('/login');
        }

        if (!user.hasPaid) {
            console.log('User has not paid, redirecting to payment');
            return res.redirect('/payment');
        }

        // Generate a new token to refresh the expiry
        const newToken = user.getSignedJwtToken();
        res.cookie('token', newToken);

        console.log('Payment check passed, proceeding to next middleware');
        req.user = user;
        next();
    } catch (err) {
        console.error('Payment check error:', err);
        res.redirect('/login');
    }
};

// Apply payment check middleware to protected routes only
app.use(async (req, res, next) => {
    const isProtectedPath = protectedPages.some(path => 
        req.path === path || 
        req.path.startsWith(path + '/')
    );

    if (isProtectedPath) {
        return checkPayment(req, res, next);
    }
    
    next();
});

// Serve public HTML files without .html extension
app.get(['/', '/home', '/home.html'], (req, res) => {
    res.sendFile(path.resolve(__dirname, 'home.html'));
});

app.get(['/login', '/login.html'], (req, res) => {
    res.sendFile(path.resolve(__dirname, 'login.html'));
});

app.get(['/register', '/register.html'], (req, res) => {
    res.sendFile(path.resolve(__dirname, 'register.html'));
});

app.get(['/payment', '/payment.html'], async (req, res) => {
    console.log('\nAccessing payment page:', {
        hasToken: !!req.cookies?.token,
        tokenValue: req.cookies?.token ? req.cookies.token.substring(0, 20) + '...' : 'missing',
        url: req.url,
        method: req.method,
        headers: {
            cookie: req.headers.cookie ? 'present' : 'missing',
            authorization: req.headers.authorization ? 'present' : 'missing'
        }
    });

    if (!req.cookies.token) {
        console.log('No token found, redirecting to login');
        return res.redirect('/login');
    }

    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            console.log('User not found, redirecting to login');
            return res.redirect('/login');
        }

        // If user has already paid, redirect to auction
        if (user.hasPaid) {
            console.log('User already paid, redirecting to auction:', user.email);
            return res.redirect('/auction');
        }

        // Set a fresh token cookie before serving the page
        const newToken = user.getSignedJwtToken();
        res.cookie('token', newToken, {
            httpOnly: false, // Allow JavaScript access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            path: '/',
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });

        console.log('Serving payment page for user:', {
            email: user.email,
            tokenSet: true,
            newTokenLength: newToken.length
        });

        // Serve the payment page
        res.sendFile(path.resolve(__dirname, 'payment.html'));
    } catch (err) {
        console.error('Payment page error:', err);
        res.redirect('/login');
    }
});

app.get(['/payment-success', '/payment-success.html'], (req, res) => {
    res.sendFile(path.resolve(__dirname, 'payment-success.html'));
});

app.get(['/payment-cancel', '/payment-cancel.html'], (req, res) => {
    res.sendFile(path.resolve(__dirname, 'payment-cancel.html'));
});

// Serve protected pages
app.get(['/auction', '/auction.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/profile', '/profile.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

// Root route handler - redirect to auction for authenticated users, home for others
app.get('/', async (req, res) => {
    if (!req.cookies.token) {
        return res.redirect('/home');
    }

    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.hasPaid) {
            return res.redirect('/home');
        }

        res.redirect('/auction');
    } catch (err) {
        console.error('Root route error:', err);
        res.redirect('/home');
    }
});

// Catch-all route - MUST be last
app.get('*', (req, res, next) => {
    // Don't redirect API calls or static files
    if (req.path.startsWith('/api/') || 
        req.path.startsWith('/css/') || 
        req.path.startsWith('/js/') || 
        req.path.startsWith('/img/')) {
        return next();
    }
    
    // Check if the request is for a known page but with .html
    const knownPages = ['/', '/login', '/register', '/payment', '/payment-success', '/payment-cancel', '/auction', '/profile'];
    const requestedPath = req.path.replace('.html', '');
    
    if (knownPages.includes(requestedPath)) {
        return res.redirect(requestedPath);
    }
    
    console.log('Catch-all route hit:', req.path);
    res.redirect('/');
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