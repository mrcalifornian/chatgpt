const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

let API = process.env.OPENAIW;

exports.getImage = async (prompt, cb) => {

    const configuration = new Configuration({
        apiKey: API,
    });

    const openai = new OpenAIApi(configuration);

    try {
        const response = await openai.createImage({
            prompt: prompt,
            n: 1,
            size: "256x256",
        });

        let image_url = response.data.data[0].url;
        cb([true, image_url]);
    } catch (error) {
        let message;
        if (error.response) {
            // console.log(error.response.status);
            message = error.response.data.error.message;
        } else {
            message = error.message;
        }
        cb([false, message]);
    }
}