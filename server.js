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
let groups_data, doc;
// app.use(
//     cors({
//         origin: 'http://localhost:5500',
//     })
// );

app.use(express.static(path.join(__dirname, 'client')));

app.use(express.json());

async function getDayFile(day, filename, institutionName) {}

async function getFolders(institutionName) {
    let folders = await new Promise((resolve, reject) => {
        fs.readdir(`./institutions/${institutionName}`, (err, data) => {
            resolve(data);
        });
    });
    let sorter = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
    };
    folders.sort((a, b) => {
        return sorter[a] - sorter[b];
    });
    return folders;
}

app.get('/getListOfInstitutes', async(req, res) => {
    const folders = await new Promise(
        (resolve) => fs.readdir('./institutions', (err, data) => resolve(data)) // всевозможные уч заведения в папке
    );
    //console.log(folders);

    let institutions = (
        await Promise.all(
            folders.map(async(item) => {
                // item - название директории учебного заведения
                return await new Promise((resolve, reject) => {
                    fs.readdir(`./institutions/${item}`, (err, resp) => {
                        // resp -
                        if (
                            fs
                            .lstatSync(`./institutions/${item}`)
                            .isDirectory() &&
                            resp.length >= 1
                        )
                            resolve(item);
                        else resolve(false);
                    });
                });
            })
        )
    ).filter(Boolean);

    console.log(institutions);
    institutionCopy = institutions;
    res.status(200).json(institutions);
});

app.post('/setInstitute', async(req, res) => {
    searchingInstitute = req.body.name;
    console.log('set to ' + searchingInstitute);
    res.status(200).json({ success: true });
});

app.get('/loadGroups', async(req, res) => {
    getFolders(searchingInstitute)
        .then(async(folders) => {
            if (!folders) return console.log('no folders, /loadGroups');

            let f = await new Promise((resolveFolderData, rejectFolderData) =>
                fs.readdir(
                    `./institutions/${searchingInstitute}/${folders[0]}`,
                    (err, data) => {
                        if (!err) resolveFolderData(data);
                        else rejectFolderData(error);
                    }
                )
            );

            groups_data = (
                await Promise.all(
                    f.map(async(el) => {
                        return new Promise((resolve, reject) => {
                            if (el.includes('ttgen_groups_days_vertical')) {
                                resolve(el);
                            } else resolve(false);
                        });
                    })
                )
            ).filter(Boolean);
            doc = await new Promise((resolve, reject) => {
                fs.readFile(
                    `./institutions/${searchingInstitute}/${folders[0]}/${groups_data[0]}`, { encoding: 'utf-8' },
                    (err, data) => {
                        if (!err) {
                            resolve(data);
                        } else return console.log(err, 'GET - /loadGroups');
                    }
                );
            });
            let groups = await Promise.all(
                HTMLparser.parse(doc)
                .querySelectorAll('a[href^="#table"]')
                .map(async(el) => {
                    return await new Promise((resolve, reject) => {
                        resolve(el.text);
                    });
                })
            );
            res.status(200).json(groups);
        })
        .catch((err) => res.json({ error: err }));
});

app.get('/getGroupTimeTable', async(req, res) => {
    // в принципе все работает, но слишком много объектов, однако фиксить мне это лень.
    //console.log(req.query.group, req.query.today);
    getFolders(searchingInstitute).then(async(folders) => {
        let tt = await Promise.all(
            folders.map(async(el) => {
                return await new Promise((resolve, reject) => {
                    fs.readFile(
                        `./institutions/${searchingInstitute}/${el}/${groups_data[0]}`, { encoding: 'utf-8' },
                        async(err, data) => {
                            let dataToParse = HTMLparser.parse(data);
                            let ttInside = dataToParse
                                .querySelectorAll(
                                    `table > thead th[colspan="14"]`
                                )
                                .map((elem) => {
                                    if (elem.text === req.query.group) {
                                        let names = [];
                                        elem.closest('table')
                                            .querySelectorAll(
                                                'tbody tr:not(.foot) td'
                                            )
                                            .forEach((el) => {
                                                names.push({
                                                    lesson: el.innerHTML,
                                                    isPair: el.getAttribute(
                                                            'colspan'
                                                        ) ?
                                                        true :
                                                        false,
                                                });
                                            });
                                        //console.log(names);
                                        return names;
                                    } else return false;
                                });
                            ttInside = ttInside.filter(Boolean);
                            resolve({
                                lessons: ttInside,
                                pinned: el == req.query.today,
                                day: el,
                            });
                        }
                    );
                });
            })
        );

        //console.log(tt);
        res.status(200).json({ tt });
    });
});

app.get('/teachers-tt', async(req, res) => {
    getFolders(searchingInstitute).then(async(folders) => {
        if (!folders) return console.log('no folders, /loadGroups');

        let f = await new Promise((resolveFolderData, rejectFolderData) =>
            fs.readdir(
                `./institutions/${searchingInstitute}/${folders[0]}`,
                (err, data) => {
                    if (!err) resolveFolderData(data);
                    else rejectFolderData(error);
                }
            )
        );

        let xmlFile = (
            await Promise.all(
                f.map(async(el) => {
                    return new Promise((resolveInside, rejectInside) => {
                        if (el.includes('ttgen_teachers.xml')) {
                            resolveInside(el);
                        } else resolveInside(false);
                    });
                })
            )
        ).filter(Boolean);

        let xmlFileData = await new Promise((resolveData, rejectData) => {
            fs.readFile(
                `./institutions/${searchingInstitute}/${folders[0]}/${xmlFile[0]}`, { encoding: 'utf-8' },
                (err, data) => {
                    if (!err) {
                        resolveData(data);
                    } else rejectData(err, 'GET - /teachers-tt');
                }
            );
        });
        let parsedXml = XMLparser.parse(xmlFileData);
        let Teachers = [];
        console.log(parsedXml.Teachers_Timetable.Teacher);
        // find a way to parse it
        // parsedXml
        //     .querySelectorAll('Teacher')
        //     .forEach((el) => Teachers.push(el.getAttribute('name')));
        res.status(200).json({ teachers: Teachers });
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});