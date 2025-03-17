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

async function deleteAllUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Ask for confirmation
        rl.question('Are you sure you want to delete ALL users and their data? (yes/no): ', async (answer) => {
            if (answer.toLowerCase() === 'yes') {
                // Delete all user data first (to maintain referential integrity)
                const userDataResult = await UserData.deleteMany({});
                console.log(`Deleted ${userDataResult.deletedCount} user data records`);

                // Delete all users
                const userResult = await User.deleteMany({});
                console.log(`Deleted ${userResult.deletedCount} users`);

                console.log('All users and their data have been deleted successfully');
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
deleteAllUsers(); 