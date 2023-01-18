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
    leftAttempts: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('User', botUser);