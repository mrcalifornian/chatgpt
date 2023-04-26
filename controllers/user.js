import User from '../models/user.js';
import dalle from "../platforms/dalle.js";
import { ctx } from "../index.js";
import bing from '../platforms/bing.js';

export const getAllUsers = async () => {
    try {
        let users = await User.find();
        return users;
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const getUserData = async (userId) => {
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

export const createNewUser = async (userId, username, fullName) => {
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

export const sendMessage = async (mode, userId, message, username, first_name, messageId) => {
    try {
        await resetDaily(userId);

        let user = await User.findOne({ userId: userId });

        if (!user) {
            return "/start";
        }


        if (user.dailyAttempts == 0) {
            if (user.leftAttempts == 0) {
                return false;
            } else {
                user.leftAttempts -= 1;
            }
        } else {
            user.dailyAttempts -= 1;
        }
        user.username = username;
        user.fullName = first_name;

        if (mode === 'image') {
            await user.save();
            return await dalle(message);
        }

        let response = await bing(message, ctx, messageId, userId);

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

export const referralInvited = async (userId) => {
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
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export const checkAttempts = async (userId, cb) => {
    try {
        let user = await User.findOne({ userId: userId });

        cb({ daily: user.dailyAttempts, total: user.leftAttempts });

    } catch (error) {
        console.log(error);

    }
}

let resetDaily = async (userId) => {
    try {
        let date = new Date().toLocaleDateString();
        let user = await User.findOne({ userId: userId });
        if (user) {

            if (user.dailyAttempts == undefined) {
                user.dailyAttempts = 10;
                user.lastTime = date;
                await user.save();
            }

            if (daysDifference(user.lastTime) >= 1) {
                user.dailyAttempts = 10;
                user.lastTime = date;
                await user.save();
            }

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
    const daysDifference = Math.round(Math.abs((timeDifference / oneDay)));

    return daysDifference;
}