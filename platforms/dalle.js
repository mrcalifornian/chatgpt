const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

let API = process.env.OPENAI;

exports.getImage = async (prompt) => {

    const configuration = new Configuration({
        apiKey: API,
    });

    const openai = new OpenAIApi(configuration);

    try {
        const response = await openai.createImage({
            prompt: prompt,
            n: 1,
            size: "512x512",
        });

        let image_url = response.data.data[0].url;
        return [true, image_url];
    } catch (error) {
        let message;
        if (error.response) {
            // console.log(error.response.status);
            message = error.response.data.error.message;
        } else {
            message = error.message;
        }
        return [false, message];
    }
}