const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        minlength: 4,
        maxlength: 20,
        match: [/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    language: {
        type: String,
        enum: ['en', 'kn'],
        default: 'en'
    },
    psychology: {
        mbti: {
            type: String,
            enum: ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
                'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']
            
        },
        lastUpdated: Date
    },
    chatInteractions: [{
        timestamp: { type: Date, default: Date.now },
        message: String,
        sentiment: Number,
        language: { // Can also track per-message language if needed
            type: String,
            enum: ['en', 'kn'],
            default: 'en'
        }
    }]
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model('User', userSchema);
