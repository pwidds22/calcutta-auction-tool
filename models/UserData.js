const mongoose = require('mongoose');

const UserDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teams: {
    type: Array,
    default: []
  },
  payoutRules: {
    roundOf64: { type: Number, default: 0.50 },
    roundOf32: { type: Number, default: 1.00 },
    sweet16: { type: Number, default: 2.50 },
    elite8: { type: Number, default: 4.00 },
    finalFour: { type: Number, default: 8.00 },
    champion: { type: Number, default: 16.00 },
    biggestUpset: { type: Number, default: 5 },
    highestSeed: { type: Number, default: 5 },
    largestMargin: { type: Number, default: 5 },
    customProp: { type: Number, default: 5 }
  },
  estimatedPotSize: {
    type: Number,
    default: 10000
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserData', UserDataSchema); 