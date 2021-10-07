const express = require('express');
const cors = require('cors');
const fs = require('fs');
//const util = require('util');
const parserHTML = require('node-html-parser');
const parserXML = require('fast-xml-parser');
const app = express();
const port = process.env.PORT || 3000;
//const readDir = util.promisify(fs.readdir)
app.use(
    cors({
        origin: 'http://localhost:5500',
    })
);

app.get('/', (req, res) => {
    fs.readFile('./../index.html', (err, data) => {
        res.writeHead(200);
        res.write(data);
        res.end();
    });
});

app.get('/api/table', async(req, res) => {
    const folders = await new Promise((resolve) =>
        fs.readdir('./../institutions', (err, data) => resolve(data))
    );
    console.log({ folders });

    let institutions = (
        await Promise.all(
            folders.map(async(item) => {
                return await new Promise((resolve, reject) => {
                    fs.readdir('./../institutions/' + item, (err, resp) => {
                        if (resp.length >= 1) resolve(`${item} -> ${resp}`);
                        else resolve(false);
                    });
                });
            })
        )
    ).filter(Boolean);

    console.log({ institutions });
    res.json({ institutions });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});