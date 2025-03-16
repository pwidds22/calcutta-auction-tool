const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const UserData = require('../models/UserData');

// @route   GET api/data
// @desc    Get user data
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let userData = await UserData.findOne({ user: req.user.id });

    if (!userData) {
      // Create default user data if none exists
      userData = await UserData.create({
        user: req.user.id
      });
    }

    res.json({
      success: true,
      data: userData
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT api/data
// @desc    Update user data
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    const { teams, payoutRules, estimatedPotSize } = req.body;
    
    // Build userData object
    const userDataFields = {};
    if (teams) userDataFields.teams = teams;
    if (payoutRules) userDataFields.payoutRules = payoutRules;
    if (estimatedPotSize) userDataFields.estimatedPotSize = estimatedPotSize;
    userDataFields.updatedAt = Date.now();

    let userData = await UserData.findOne({ user: req.user.id });

    if (userData) {
      // Update
      userData = await UserData.findOneAndUpdate(
        { user: req.user.id },
        { $set: userDataFields },
        { new: true }
      );
    } else {
      // Create
      userDataFields.user = req.user.id;
      userData = await UserData.create(userDataFields);
    }

    res.json({
      success: true,
      data: userData
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 