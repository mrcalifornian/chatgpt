const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

let API = process.env.OPENAIW;

let davinci3 = "text-davinci-003";
let ada1 = "text-ada-001";
let babbage1 = "text-babbage-001";
let curie1 = "text-curie-001";


let chatGpt = async (sentText, cb) => {

    const configuration = new Configuration({
        apiKey: API,
    });

    const openai = new OpenAIApi(configuration);

    await openai.createCompletion({
        model: davinci3,
        prompt: sentText,
        max_tokens: 150,
        temperature: 0.9,
        n: 1
    }).then(response => {

        cb(response.data);

    }).catch(err => {
        API = process.env.OPENAIJ;
        cb(err);
        console.log(err);
    });

}

module.exports = chatGpt;