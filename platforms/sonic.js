const request = require('request');
require('dotenv').config();

let KEY = process.env.SONICKEY;

let Sonic = (sentText, cb) => {

    const options = {
        method: 'POST',
        url: process.env.SONICURL,
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'X-API-KEY': KEY
        },
        body: { enable_google_results: 'true', enable_memory: false, input_text: sentText },
        json: true
    };

    request(options, (err, response, body) => {
        if (err) throw new Error(err);
        if (body.detail) {
            KEY = process.env.SONICKEY2;
        }
        cb(body);
    });
}

module.exports = Sonic;
