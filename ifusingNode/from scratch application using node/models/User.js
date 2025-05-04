const mongoose = require('mongoose');
const crypto = require('crypto');
const MemoryStore = require('./MemoryStore');

// Mongoose Schema definition
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Instance methods
userSchema.methods.toPublicJSON = function() {
    const user = this.toObject ? this.toObject() : this;
    delete user.password;
    return user;
};

userSchema.methods.generateVerificationToken = function() {
    this.verificationToken = crypto.randomBytes(32).toString('hex');
    this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return this.verificationToken;
};

userSchema.methods.generatePasswordResetToken = function() {
    this.resetPasswordToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    return this.resetPasswordToken;
};

// Create a wrapper that will use either MongoDB or MemoryStore
class UserModel {
    constructor() {
        try {
            this.model = mongoose.model('User', userSchema);
            this.usingMongoDB = true;
        } catch (error) {
            this.store = MemoryStore;
            this.usingMongoDB = false;
            console.info('Using in-memory store for User model');
        }
    }

    async findOne(query) {
        if (this.usingMongoDB) {
            return this.model.findOne(query);
        }
        return this.store.findOne(query);
    }

    async findById(id) {
        if (this.usingMongoDB) {
            return this.model.findById(id);
        }
        return this.store.findById(id);
    }

    async create(userData) {
        if (this.usingMongoDB) {
            return this.model.create(userData);
        }
        const user = new this.store.User(userData);
        return user.save();
    }
}

module.exports = new UserModel();