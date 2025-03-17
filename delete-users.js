require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

// MongoDB connection string from .env
const mongoURI = process.env.MONGO_URI;

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Define schemas
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String
});

const UserDataSchema = new mongoose.Schema({
    userId: String,
    teams: Array,
    payoutRules: Object,
    estimatedPotSize: Number
});

// Create models
const User = mongoose.model('User', UserSchema);
const UserData = mongoose.model('UserData', UserDataSchema);

async function deleteUserByEmail(email) {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Find the user first
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`No user found with email: ${email}`);
            return;
        }

        // Ask for confirmation
        rl.question(`Are you sure you want to delete user ${email} and their data? (yes/no): `, async (answer) => {
            if (answer.toLowerCase() === 'yes') {
                // Delete user data first (to maintain referential integrity)
                const userDataResult = await UserData.deleteOne({ userId: user._id });
                console.log(`Deleted user data for ${email}`);

                // Delete the user
                const userResult = await User.deleteOne({ email });
                console.log(`Deleted user ${email}`);

                console.log('User and their data have been deleted successfully');
            } else {
                console.log('Operation cancelled');
            }

            // Close connections
            rl.close();
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        });
    } catch (error) {
        console.error('Error:', error);
        rl.close();
        await mongoose.connection.close();
    }
}

// Run the deletion script
deleteUserByEmail('pwiddoss22@gmail.com'); 