const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

// Initialize express app
const app = express();

// Raw body for Stripe webhooks
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
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
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Payment check middleware
const checkPayment = async (req, res, next) => {
  // Skip payment check for these routes
  const publicPaths = [
    '/',
    '/home.html',
    '/payment.html',
    '/payment-success.html',
    '/payment-cancel.html',
    '/api/auth/register',
    '/api/auth/login',
    '/favicon.ico'
  ];

  if (publicPaths.includes(req.path) || req.path.startsWith('/img/') || req.path.startsWith('/css/')) {
    return next();
  }

  // Check if user is authenticated
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

    if (!user.hasPaid) {
      return res.redirect('/payment.html');
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Payment check error:', err);
    res.redirect('/home.html');
  }
};

// Serve static files AFTER the payment check
app.use(checkPayment);
app.use(express.static('./'));

// Import routes
const authRoutes = require('./routes/auth');
const userDataRoutes = require('./routes/userData');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/data', userDataRoutes);

// Serve home.html for the root route
app.get('/', (req, res) => {
  if (req.cookies.token) {
    const token = req.cookies.token;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      User.findById(decoded.id).then(user => {
        if (user && user.hasPaid) {
          res.redirect('/index.html');
        } else {
          res.redirect('/payment.html');
        }
      });
    } catch (err) {
      res.sendFile(path.resolve(__dirname, 'home.html'));
    }
  } else {
    res.sendFile(path.resolve(__dirname, 'home.html'));
  }
});

// Serve payment.html for /payment route
app.get('/payment.html', (req, res) => {
  if (!req.cookies.token) {
    res.redirect('/home.html');
  } else {
    res.sendFile(path.resolve(__dirname, 'payment.html'));
  }
});

// Protected route for the main application
app.get('/index.html', (req, res) => {
  if (!req.cookies.token) {
    res.redirect('/home.html');
  } else {
    const token = req.cookies.token;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      User.findById(decoded.id).then(user => {
        if (user && user.hasPaid) {
          res.sendFile(path.resolve(__dirname, 'index.html'));
        } else {
          res.redirect('/payment.html');
        }
      });
    } catch (err) {
      res.redirect('/home.html');
    }
  }
});

// Catch-all route
app.get('*', (req, res) => {
  if (!req.cookies.token) {
    res.redirect('/home.html');
  } else {
    const token = req.cookies.token;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      User.findById(decoded.id).then(user => {
        if (user && user.hasPaid) {
          res.sendFile(path.resolve(__dirname, 'index.html'));
        } else {
          res.redirect('/payment.html');
        }
      });
    } catch (err) {
      res.redirect('/home.html');
    }
  }
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