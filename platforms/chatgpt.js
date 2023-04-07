const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

const API = process.env.OPENAI;

const configuration = new Configuration({
    apiKey: API,
});

const openai = new OpenAIApi(configuration);

module.exports = async (user, prompt) => {
    try {

        let completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
            max_tokens: 400,
            user: user
        });

        let data = completion.data.choices[0].message.content;
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }

}