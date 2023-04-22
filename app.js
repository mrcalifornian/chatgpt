const express = require('express');
const app = express();
require('dotenv').config();
const axios = require('axios');

const bot = require('./index');

app.get('/', (req, res) => {
    res.status(200).send('Server is alive!');
    console.log('Request received');
});

app.listen(process.env.PORT, () => {
    console.log(`Your app is running`);
    bot();
});

setInterval(() => {
    try {
        axios.get(process.env.CYCLIC_URL);
    } catch (error) {
        console.log('Error in interval');
    }
}, 20000);
