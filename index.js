// index.js
const express = require('express');
const axios = require('axios');

const app = express();
const port = 8008;

app.get('/numbers', async(req, res) => {
    try {
        const urls = req.query.url;
        if (!urls) {
            return res.status(400).json({ error: 'URLs not provided in the query parameters.' });
        }

        // Convert 'urls' to an array in case there's only one URL provided
        const urlList = Array.isArray(urls) ? urls : [urls];

        const responsePromises = urlList.map(async(url) => {
            try {
                const response = await axios.get(url);
                return response.data.numbers;
            } catch (error) {
                console.error(`Error fetching data from URL ${url}:`, error.message);
                return [];
            }
        });

        const responses = await Promise.allSettled(responsePromises);

        const mergedNumbers = responses.reduce((merged, response) => {
            if (response.status === 'fulfilled') {
                return merged.concat(response.value);
            }
            return merged;
        }, []);

        const uniqueNumbers = Array.from(new Set(mergedNumbers)).sort((a, b) => a - b);

        res.json({ numbers: uniqueNumbers });
    } catch (error) {
        console.error('Error processing the request:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});