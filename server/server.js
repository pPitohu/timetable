const express = require('express');
const cors = require('cors');
const fs = require('fs');
const parserHTML = require('node-html-parser');
const parserXML = require('fast-xml-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(
    cors({
        origin: 'http://localhost:5500',
    })
);

app.get('/api/table', (req, res) => {
    return new Promise((resolve, reject) => {
        let institutions = [];
        fs.readdir('./../institutions', (err, data) => {
            for (let i = 0; i < data.length; i++) {
                fs.readdir('./../institutions/' + data[i], (err, resp) => {
                    if (resp.length != 0) {
                        console.log(resp);
                        institutions.push(`${data[i]} -> ${resp}`);
                    }
                });
            }
        });
        resolve(res.json({ institutions: institutions }));
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});