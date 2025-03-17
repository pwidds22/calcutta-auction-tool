const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function updateUserPayment(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with email:', email);
      process.exit(1);
    }

    console.log('\nCurrent user status:');
    console.log({
      email: user.email,
      hasPaid: user.hasPaid,
      paymentDate: user.paymentDate,
      createdAt: user.createdAt
    });

    // Update payment status
    user.hasPaid = true;
    user.paymentDate = new Date();
    await user.save();

    console.log('\nUpdated user status:');
    console.log({
      email: user.email,
      hasPaid: user.hasPaid,
      paymentDate: user.paymentDate,
      createdAt: user.createdAt
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateUserPayment('pwiddoss22@gmail.com'); 