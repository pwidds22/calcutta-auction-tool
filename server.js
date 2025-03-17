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
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/js', express.static(path.join(__dirname, 'js')));

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

// Define public and protected paths at the top level
const publicPaths = [
  '/home.html',
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
  '/js',
  '/robots.txt'
];

const protectedPages = [
  '/index.html',
  '/auction.html',
  '/teams.html',
  '/profile.html',
  '/dashboard.html',
  '/team-odds.html'
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

  // Get the token from cookies or authorization header
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if user is authenticated
  if (!token) {
    console.log('No token found in cookies or headers, redirecting to login');
    return res.redirect('/login.html');
  }

  try {
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
      console.log('User not found in database, redirecting to login');
      return res.redirect('/login.html');
    }

    if (!user.hasPaid) {
      console.log('User has not paid, redirecting to payment');
      return res.redirect('/payment.html');
    }

    // Generate a new token to refresh the expiry
    const newToken = user.getSignedJwtToken();
    
    // Set cookie options
    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/'
    };

    // Get the domain from the request host
    const host = req.get('host');
    if (host) {
      // If it's a custom domain, include the domain in cookie options
      if (host.includes('calcuttagenius.com')) {
        options.domain = '.calcuttagenius.com';
      }
    }

    // Set the refreshed token
    res.cookie('token', newToken, options);

    console.log('Payment check passed, proceeding to next middleware');
    req.user = user;
    next();
  } catch (err) {
    console.error('Payment check error:', err);
    res.redirect('/login.html');
  }
};

// Apply payment check middleware to ALL routes except public ones
app.use(async (req, res, next) => {
  const isPublicPath = publicPaths.some(path => 
    req.path === path || 
    req.path.startsWith(path + '/') ||
    (req.path.startsWith('/api/') && publicPaths.includes(req.path))
  );

  if (isPublicPath) {
    return next();
  }
  
  return checkPayment(req, res, next);
});

// Serve protected pages - MUST come after payment check middleware
protectedPages.forEach(page => {
  app.get(page, (req, res) => {
    console.log('Serving protected page:', page);
    try {
      const filePath = path.join(__dirname, page.substring(1));
      console.log('Attempting to serve file:', filePath);
      if (!res.headersSent) {
        res.set('Content-Type', 'text/html');
        res.sendFile(filePath, (err) => {
          if (err) {
            console.error('Error serving file:', err);
            if (!res.headersSent) {
              res.status(500).send('Error serving file');
            }
          }
        });
      }
    } catch (err) {
      console.error('Error in protected page route:', err);
      if (!res.headersSent) {
        res.status(500).send('Server error');
      }
    }
  });
});

// Serve public HTML files - MUST come after protected pages
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

// Root route handler - MUST come after all other routes
app.get('/', (req, res) => {
  res.redirect('/home.html');
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
  console.log('Catch-all route hit:', req.path);
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