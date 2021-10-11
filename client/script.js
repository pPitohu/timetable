const select = document.querySelector('.institution-select'),
    studentsBtn = document.querySelector('.students-btn'),
    teachersBtn = document.querySelector('.teachers-btn'),
    groupSelect = document.querySelector('.group-select'),
    groupFindBtn = document.querySelector('.group-find'),
    teacherSelect = document.querySelector('.teacher-select'),
    teacherFindBtn = document.querySelector('.teacher-find');

const API_SERVER = 'http://localhost:3000';

function dayToNormal(day) {
    switch (day) {
        case 1:
            return 'monday';
        case 2:
            return 'tuesday';
        case 3:
            return 'wednesday';
        case 4:
            return 'thursday';
        case 5:
            return 'friday';
        case 6:
            return 'saturday';
    }
}

function ruDayOfWeek(day) {
    switch (day) {
        case 'monday':
            return 'Понедельник';
        case 'tuesday':
            return 'Вторник';
        case 'wednesday':
            return 'Среда';
        case 'thursday':
            return 'Четверг';
        case 'friday':
            return 'Пятница';
        case 'saturday':
            return 'Суббота';
    }
}

function exists(lesson) {
    switch (lesson) {
        case undefined:
            return '-';
        case null:
            return '-';
        case '-x-':
            return '-';
        case '---':
            return '-';
        case '':
            return '-';
        case ' ':
            return '-';
        default:
            return lesson;
    }
}

let fakeTimeStart = [
    '8:30',
    '10:15',
    '12:10',
    '13:55',
    '15:50',
    '17:35',
    '19:20',
];
let fakeTimeEnd = [
    '10:05',
    '11:50',
    '13:45',
    '15:30',
    '17:25',
    '19:10',
    '20:55',
];
let fakeAudit = [
    401, 201, 205, 308, 307, 218, 221, 101, 103, 303, 304, 305, 301, 201, 404,
    405, 406, 415,
];

function randomInteger(min, max) {
    let rand = min + Math.random() * (max - min);
    return Math.round(rand);
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/getListOfInstitutes')
        .then((res) => res.json())
        .then((data) => {
            //console.log(data);
            data.forEach(
                (el) =>
                (select.innerHTML += `<option value="${el}">${el}</option>`)
            );
            select.onchange = (e) => {
                fetch(`/setInstitute`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name: select.value }),
                    })
                    .then((res) => res.json())
                    .then((data) => {
                        console.log('institute set - ' + data.success);
                        studentsBtn.removeAttribute('disabled');
                        teachersBtn.removeAttribute('disabled');
                    });
            };
        });
    studentsBtn.onclick = () => {
        document.querySelector('.error_wrapper').innerHTML = '';
        studentsBtn.innerHTML = `<div class="spinner-border spinner-border-sm mx-5" role="status"></div>`;
        document.querySelector('.timetable-table').style.display = 'none';
        fetch('/loadGroups')
            .then((res) => res.json())
            .then((data) => {
                document.querySelector('.timetable-table').innerHTML =
                    '<div class="pinned"></div>';
                document.querySelector(
                    '.teacher-select-wrapper'
                ).style.display = 'none';
                console.log(data);
                data.forEach(
                    (el) =>
                    (groupSelect.innerHTML += `<option value="${el}">${el}</option>`)
                );
                groupSelect.onchange = (e) => {
                    groupFindBtn.removeAttribute('disabled');
                    document
                        .querySelectorAll('.group-select option')
                        .forEach((el, i) => {
                            if (i != 0) el.removeAttribute('selected');
                            if (groupSelect.value == el.value)
                                el.setAttribute('selected', '');
                        });
                };
                studentsBtn.innerHTML = 'Расписание для учащихся';
                document.querySelector('.group-select-wrapper').style.display =
                    'flex';
            })
            .catch((err) => {
                studentsBtn.innerHTML = 'Расписание для учащихся';
                document.querySelector(
                    '.teacher-select-wrapper'
                ).style.display = 'none';
                document.querySelector('.group-select-wrapper').style.display =
                    'none';
                document.querySelector(
                    '.error_wrapper'
                ).innerHTML = `<div style="color: red; display: block; margin: 1rem;">Произошла ошибка, вероятно, файл не найден</div>`;
            });
    };
    groupFindBtn.onclick = () => {
        document.querySelector('.timetable-table').innerHTML =
            '<div class="pinned"></div>';
        let date = new Date();
        document.querySelector('.error_wrapper').innerHTML = '';
        groupFindBtn.innerHTML = `<div class="spinner-border spinner-border-sm mx-3" role="status"></div>`;
        fetch(
                `/getGroupTimeTable?group=${
                document.querySelectorAll('.group-select option[selected]')[1]
                    .value
            }&today=${dayToNormal(date.getDay())}`
            )
            .then((res) => res.json())
            .then((group_tt) => {
                console.log(group_tt);
                let data = group_tt.tt;
                for (let i = 0; i < data.length; i++) {
                    let dataLessons = data[i].lessons[0];
                    let isPinned = data[i].pinned;
                    if (isPinned) {
                        document.querySelector(
                            '.timetable-table .pinned'
                        ).innerHTML += `
                    
                    <h2 class="w-75 mx-auto">${ruDayOfWeek(data[i].day)}</h2>
                    <table
                    class="table table-bordered table-hover align-middle students-table w-75 mx-auto"
                    style="text-align: center;"
                >
                    <thead class="table-success">
                        <tr>
                            <th scope="col">Начало</th>
                            <th scope="col">Конец</th>
                            <th scope="col">Предмет</th>
                            <th scope="col">Преподаватель</th>
                            <th scope="col">Аудитория</th>
                        </tr>
                    </thead>
                    <tbody class="day-table-body"></tbody>
                    </table>
                    `;
                    } else {
                        document.querySelector(
                            '.timetable-table'
                        ).innerHTML += `
                    
                    <h2 class="w-75 mx-auto">${ruDayOfWeek(data[i].day)}</h2>
                    <table
                    class="table table-bordered table-hover align-middle students-table w-75 mx-auto"
                    style="text-align: center;"
                >
                    <thead class="table-success">
                        <tr>
                            <th scope="col">Начало</th>
                            <th scope="col">Конец</th>
                            <th scope="col">Предмет</th>
                            <th scope="col">Преподаватель</th>
                            <th scope="col">Аудитория</th>
                        </tr>
                    </thead>
                    <tbody class="day-table-body"></tbody>
                    </table>
                    `;
                    }
                    for (let j = 0; j < dataLessons.length; j++) {
                        console.log(dataLessons[j].lesson);
                        let lesson = dataLessons[j].lesson.split('<br>'),
                            lessonSubject = lesson[0],
                            lessonTeacher = lesson[1],
                            lessonClass = lesson[2];
                        if (!(exists(dataLessons[j].lesson) == '-')) {
                            document.querySelectorAll('.day-table-body')[
                                i
                            ].innerHTML += `
                                    <tr>
                                        <th scope="row">${fakeTimeStart[j]}</th>
                                        <td>${fakeTimeEnd[j]}</td>
                                        <td>${exists(lessonSubject)}</td>
                                        <td>${exists(lessonTeacher)}</td>
                                        <td>${
                                            fakeAudit[
                                                randomInteger(
                                                    0,
                                                    fakeAudit.length - 1
                                                )
                                            ]
                                        }</td>
                                        </tr>
                                        `;
                            //<td>${exists(lessonClass)}</td>
                        }
                    }
                }
                groupFindBtn.innerHTML = 'Поиск';
                document.querySelector('.timetable-table').style.display =
                    'block';
            })
            .catch((err) => {
                groupFindBtn.innerHTML = 'Поиск';
                document.querySelector(
                    '.teacher-select-wrapper'
                ).style.display = 'none';
                document.querySelector('.group-select-wrapper').style.display =
                    'none';
                document.querySelector(
                    '.error_wrapper'
                ).innerHTML = `<div style="color: red; display: block; margin: 1rem;">Произошла ошибка, вероятно, файл не найден</div>`;
            });
    };
    teachersBtn.onclick = () => {
        document.querySelector('.error_wrapper').innerHTML = '';
        teachersBtn.innerHTML = `<div class="spinner-border spinner-border-sm mx-5" role="status"></div>`;
        document.querySelector('.timetable-table').style.display = 'none';
        fetch('/loadTeachers')
            .then((res) => res.json())
            .then((data) => {
                document.querySelector('.timetable-table').innerHTML =
                    '<div class="pinned"></div>';
                console.log(data);
                document.querySelector('.group-select-wrapper').style.display =
                    'none';
                document.querySelector(
                    '.teacher-select-wrapper'
                ).style.display = 'flex';
                data.teachers.forEach((el) => {
                    teacherSelect.innerHTML += `<option value="${el}">${el}</option>`;
                });
                teacherSelect.onchange = () => {
                    teacherFindBtn.removeAttribute('disabled');
                    document
                        .querySelectorAll('.teacher-select option')
                        .forEach((el, i) => {
                            if (i != 0) el.removeAttribute('selected');
                            if (teacherSelect.value == el.value)
                                el.setAttribute('selected', '');
                        });
                };
                teachersBtn.innerHTML = 'Расписание для преподавателей';
            })
            .catch((err) => {
                teachersBtn.innerHTML = 'Расписание для преподавателей';
                document.querySelector(
                    '.teacher-select-wrapper'
                ).style.display = 'none';
                document.querySelector('.group-select-wrapper').style.display =
                    'none';
                document.querySelector(
                    '.error_wrapper'
                ).innerHTML = `<div style="color: red; display: block; margin: 1rem;">Произошла ошибка, вероятно, файл не найден</div>`;
            });
    };
    teacherFindBtn.onclick = () => {
        let date = new Date();
        document.querySelector('.error_wrapper').innerHTML = '';
        teacherFindBtn.innerHTML = `<div class="spinner-border spinner-border-sm mx-3" role="status"></div>`;

        fetch(
                `getTeacherTimeTable?teacher=${
                document.querySelectorAll('.teacher-select option[selected]')[1]
                    .value
            }&today=${dayToNormal(date.getDay())}`
            )
            .then((res) => res.json())
            .then((teacher_tt) => {
                document.querySelector('.timetable-table').innerHTML =
                    '<div class="pinned"></div>';
                console.log(teacher_tt);
                let data = teacher_tt.tt;
                for (let i = 0; i < data.length; i++) {
                    let dataLessons = data[i].hours[0];
                    let isPinned = data[i].pinned;

                    if (isPinned) {
                        document.querySelector(
                            '.timetable-table .pinned'
                        ).innerHTML += `
                    
                    <h2 class="w-75 mx-auto">${ruDayOfWeek(data[i].day)}</h2>
                    <table
                    class="table table-bordered table-hover align-middle students-table w-75 mx-auto"
                    style="text-align: center;"
                >
                    <thead class="table-success">
                        <tr>
                            <th scope="col">Начало</th>
                            <th scope="col">Конец</th>
                            <th scope="col">Предмет</th>
                            <th scope="col">Преподаватель</th>
                            <th scope="col">Аудитория</th>
                            <th scope="col">Группа</th>
                            </tr>
                            </thead>
                            <tbody class="day-table-body"></tbody>
                            </table>
                            `;
                    } else {
                        document.querySelector(
                            '.timetable-table'
                        ).innerHTML += `
                    
                    <h2 class="w-75 mx-auto">${ruDayOfWeek(data[i].day)}</h2>
                    <table
                    class="table table-bordered table-hover align-middle students-table w-75 mx-auto"
                    style="text-align: center;"
                >
                    <thead class="table-success">
                        <tr>
                            <th scope="col">Начало</th>
                            <th scope="col">Конец</th>
                            <th scope="col">Предмет</th>
                            <th scope="col">Преподаватель</th>
                            <th scope="col">Аудитория</th>
                            <th scope="col">Группа</th>
                        </tr>
                    </thead>
                    <tbody class="day-table-body"></tbody>
                    </table>
                    `;
                    }

                    for (let j = 0; j < dataLessons.length; j++) {
                        console.log(dataLessons[j].lesson);
                        let lesson = dataLessons[j].lesson.split('<br>'),
                            lessonGroup = lesson[0],
                            lessonSubject = lesson[1],
                            lessonClass = lesson[2],
                            lessonTeacher = teacherSelect.value;
                        if (!(exists(dataLessons[j].lesson) == '-')) {
                            document.querySelectorAll('.day-table-body')[
                                i
                            ].innerHTML += `
                            <tr>
                                        <th scope="row">${fakeTimeStart[j]}</th>
                                        <td>${fakeTimeEnd[j]}</td>
                                        <td>${exists(lessonSubject)}</td>
                                        <td>${exists(lessonTeacher)}</td>
                                        <td>${
                                            fakeAudit[
                                                randomInteger(
                                                    0,
                                                    fakeAudit.length - 1
                                                )
                                            ]
                                            //    exists(lessonClass)
                                        }</td>
                                        <td>${exists(lessonGroup)}</td>
                                        </tr>
                                        `;
                        }
                    }
                }
                teacherFindBtn.innerHTML = 'Поиск';
                document.querySelector('.timetable-table').style.display =
                    'block';
            })
            .catch((err) => {
                teacherFindBtn.innerHTML = 'Поиск';
                document.querySelector(
                    '.teacher-select-wrapper'
                ).style.display = 'none';
                document.querySelector('.group-select-wrapper').style.display =
                    'none';
                document.querySelector(
                    '.error_wrapper'
                ).innerHTML = `<div style="color: red; display: block; margin: 1rem;">Произошла ошибка, вероятно, файл не найден</div>`;
            });
    };
});