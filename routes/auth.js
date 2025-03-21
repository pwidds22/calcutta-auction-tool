const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const UserData = require('../models/UserData');
const { protect } = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ 
          success: false,
          message: 'User already exists' 
        });
      }

      // Create user
      user = await User.create({
        email,
        password
      });

      // Create default user data with empty teams array
      await UserData.create({
        user: user.id,
        teams: [],
        payoutRules: {
          roundOf64: 0.50,
          roundOf32: 1.00,
          sweet16: 2.50,
          elite8: 4.00,
          finalFour: 8.00,
          champion: 16.00,
          biggestUpset: 5,
          highestSeed: 5,
          largestMargin: 5,
          customProp: 5
        },
        estimatedPotSize: 10000
      });

      // Store email in localStorage for display
      res.cookie('userEmail', email, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: false
      });

      sendTokenResponse(user, 201, res, req);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  }
);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    try {
      console.log('\nLogin attempt:', {
        email: req.body.email,
        headers: req.headers,
        cookies: req.cookies,
        env: {
          nodeEnv: process.env.NODE_ENV,
          hasJwtSecret: !!process.env.JWT_SECRET
        }
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Login validation failed:', errors.array());
        return res.status(400).json({ 
          success: false,
          message: 'Invalid input',
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      try {
        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
          console.log('Login failed: User not found -', email);
          return res.status(401).json({ 
            success: false,
            message: 'Invalid credentials' 
          });
        }

        console.log('User found:', {
          id: user._id,
          email: user.email,
          hasPaid: user.hasPaid
        });

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
          console.log('Login failed: Password mismatch -', email);
          return res.status(401).json({ 
            success: false,
            message: 'Invalid credentials' 
          });
        }

        // Create token
        console.log('Generating token...');
        const token = user.getSignedJwtToken();
        console.log('Token generated:', token.substring(0, 20) + '...');

        // Let the global cookie middleware handle the cookie settings
        return res
          .status(200)
          .cookie('token', token)
          .json({
            success: true,
            token,
            user: {
              id: user._id,
              email: user.email,
              hasPaid: user.hasPaid,
              paymentDate: user.paymentDate
            }
          });

      } catch (err) {
        console.error('Database or token error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error during authentication',
          error: err.message,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
      }
    } catch (err) {
      console.error('Outer error handler:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   POST api/auth/logout
// @desc    Log user out / clear cookie
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @route   PUT api/auth/update-profile
// @desc    Update user password
// @access  Private
router.put('/update-profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password'
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, req) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: false, // Allow JavaScript access for client-side token handling
    secure: process.env.NODE_ENV === 'production',
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

  // Log cookie being set
  console.log('Setting auth token cookie:', {
    host: req.get('host'),
    options,
    tokenLength: token.length
  });

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token, // Include token in response for client-side handling
      user: {
        id: user._id,
        email: user.email,
        hasPaid: user.hasPaid,
        paymentDate: user.paymentDate
      }
    });
};

module.exports = router; 