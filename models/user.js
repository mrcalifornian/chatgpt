const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let botUser = new Schema({
    userId: {
        type: Number,
        required: true
    },
    username: {
        type: String
    },
    fullName: {
        type: String
    },
    operation: String,
    leftAttempts: {
        type: Number,
        required: true
    },
    dailyAttempts: Number,
    lastTime: String,
    prompts: [
        {
            prompt: String,
            response: String
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('User', botUser);