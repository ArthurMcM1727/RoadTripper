const mongoose = require('mongoose');

const connectDB = async () => {
    // List of MongoDB URIs to try, in order
    const uris = [
        process.env.MONGODB_URI,  // Try local first
        'mongodb+srv://demo-user:demo-password-123@cluster0.mongodb.net/auth-demo?retryWrites=true&w=majority' // Fallback to Atlas
    ];

    for (const uri of uris) {
        try {
            const conn = await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.info(`MongoDB Connected: ${conn.connection.host}`);
            return; // Connection successful, exit function
        } catch (error) {
            console.info(`Failed to connect to ${uri.split('@')[1] || 'localhost'}: ${error.message}`);
            // Continue to next URI if this one fails
        }
    }

    // If we get here, all connection attempts failed
    console.error('Failed to connect to any MongoDB instance');
    console.info('Using in-memory storage as fallback');
    return false;
};

module.exports = connectDB;