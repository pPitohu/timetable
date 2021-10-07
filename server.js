const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const HTMLparser = require('node-html-parser');
const XMLparser = require('fast-xml-parser');
const app = express();
const port = process.env.PORT || 3000;
let searchingInstitute, institutionCopy;
// app.use(
//     cors({
//         origin: 'http://localhost:5500',
//     })
// );

app.use(express.static(path.join(__dirname, 'client')));

app.use(express.json());

app.get('/getListOfInstitutes', async (req, res) => {
    const folders = await new Promise((resolve) =>
        fs.readdir('./institutions', (err, data) => resolve(data))
    );
    //console.log(folders);

    let institutions = (
        await Promise.all(
            folders.map(async (item) => {
                return await new Promise((resolve, reject) => {
                    fs.readdir('./institutions/' + item, (err, resp) => {
                        if (
                            fs
                                .lstatSync(`./institutions/${item}`)
                                .isDirectory() &&
                            resp.length >= 1
                        )
                            resolve({ name: item, [item]: resp });
                        else resolve(false);
                    });
                });
            })
        )
    ).filter(Boolean);

    //console.log(institutions);
    institutionCopy = institutions;
    res.status(200).json(institutions);
});

app.post('/setInstitute', async (req, res) => {
    searchingInstitute = req.body.name;
    console.log('set to ' + searchingInstitute);
    res.status(200).json({ success: true });
});

app.get('/loadGroups', async (req, res) => {
    let filename;
    institutionCopy.forEach((el) => {
        if (el.name == searchingInstitute) {
            let arr = el[el.name]; // заменить на fs.readdir и читать любую из директорий, если там есть файл с группами, то возвращать его

            for (let i = 0; i < arr.length; i++) {
                if (arr[i].includes('groups_days_vertical'))
                    return (filename = arr[i]);
            }
        }
    });
    if (!filename) return res.status(404).json({ error: true });
    let groups_data = await new Promise((resolve, reject) => {
        fs.readFile(
            `./institutions/${searchingInstitute}/${filename}`,
            { encoding: 'utf-8' },
            (err, data) => {
                if (!err) {
                    resolve(data);
                } else return console.log(err, 'GET - /loadGroups');
            }
        );
    });
    let groups = await Promise.all(
        HTMLparser.parse(groups_data)
            .querySelectorAll('a[href^="#table"]')
            .map(async (el) => {
                return await new Promise((resolve, reject) => {
                    resolve(el.text);
                });
            })
    );
    res.status(200).json(groups);
});

app.get('/getGroupTimeTable', async (req, res) => {
    // дописать получение расписания группы
    console.log(req.query.group);
    res.status(200).json({ groupTimeTable: true });
});

app.get('/teachers-tt', async (req, res) => {
    res.status(200).json({ teachers: true });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
