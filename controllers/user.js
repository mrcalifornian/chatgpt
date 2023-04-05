const User = require('../models/user');
const chatgpt = require('../platforms/chatgpt');
const dalle = require('../platforms/dalle');

exports.getAllUsers = async () => {
    try {
        let users = await User.find();
        return users;
    } catch (error) {
        console.log(error);
        return [];
    }
}

exports.getUserData = async (userId) => {
    try {
        let user = await User.findOne({ userId: userId });
        if (user) {
            return user;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

exports.createNewUser = async (userId, username, fullName) => {
    try {
        let date = new Date().toLocaleDateString();

        const newUser = new User({
            userId: userId,
            username: username,
            fullName: fullName,
            leftAttempts: 0,
            dailyAttempts: 10,
            lastTime: date
        });

        return await newUser.save();
    } catch (error) {
        console.log(error);
    }
}

exports.sendMessage = async (mode, userId, message) => {
    try {
        await resetDaily(userId);

        let user = await User.findOne({ userId: userId });

        if (user.dailyAttempts == 0) {
            if (user.leftAttempts == 0) {
                return false;
            } else {
                user.leftAttempts -= 1;
            }
        } else {
            user.dailyAttempts -= 1;
        }

        if (mode === 'image') {
            await user.save();
            return await dalle.getImage(message);
        }

        let response = await chatgpt(user.fullName, message);

        user.prompts.push({
            prompt: message,
            response: response,
        });

        await user.save();
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

exports.referralInvited = async (userId) => {
    try {
        console.log(userId, typeof userId);
        let user = await User.findOne({ userId: userId });
        if (user.leftAttempts == undefined) {
            console.log('was undefined for ', userId);
            user.leftAttempts = 5;
        } else {
            user.leftAttempts += 5;
        }

        await user.save();
        console.log(userId, 'invited new friend');

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.checkAttempts = async (userId) => {
    try {
        let user = await User.findOne({ userId: userId });

        return { daily: user.dailyAttempts, total: user.leftAttempts };

    } catch (error) {
        console.log(error);

    }
}

let resetDaily = async (userId) => {
    try {
        let date = new Date().toLocaleDateString();
        let user = await User.findOne({ userId: userId });

        if (user.dailyAttempts == undefined) {
            console.log('reset for someone');
            user.dailyAttempts = 10;
            user.lastTime = date;
            await user.save();
        }

        if (daysDifference(user.lastTime) > 1) {
            user.dailyAttempts = 10;
            user.lastTime = date;
            await user.save();
        }

    } catch (error) {
        console.log(error);
    }
}

function daysDifference(inputDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    const currentDate = new Date();
    const inputDateTime = new Date(inputDate);

    const timeDifference = inputDateTime.getTime() - currentDate.getTime();
    const daysDifference = Math.round(Math.abs((timeDifference / oneDay)) - 1);

    return daysDifference;
}
