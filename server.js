const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Initialize express app
const app = express();

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
    // allow requests with no origin (like mobile apps or curl requests)
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

// Serve static files from the current directory
app.use(express.static('./'));

// Import routes
const authRoutes = require('./routes/auth');
const userDataRoutes = require('./routes/userData');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/data', userDataRoutes);

// Authentication middleware for protected routes
const authMiddleware = (req, res, next) => {
  if (req.path === '/index.html' && !req.cookies.token) {
    return res.redirect('/home.html');
  }
  next();
};

app.use(authMiddleware);

// Serve home.html for the root route
app.get('/', (req, res) => {
  if (req.cookies.token) {
    res.redirect('/index.html');
  } else {
    res.sendFile(path.resolve(__dirname, 'home.html'));
  }
});

// Serve home.html for /home route
app.get('/home.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'home.html'));
});

// Protected route for the main application
app.get('/index.html', (req, res) => {
  if (!req.cookies.token) {
    res.redirect('/home.html');
  } else {
    res.sendFile(path.resolve(__dirname, 'index.html'));
  }
});

// Serve the main HTML file for any other route
app.get('*', (req, res) => {
  if (!req.cookies.token) {
    res.redirect('/home.html');
  } else {
    res.sendFile(path.resolve(__dirname, 'index.html'));
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