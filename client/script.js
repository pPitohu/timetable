const select = document.querySelector('.institution-select'),
    studentsBtn = document.querySelector('.students-btn'),
    teachersBtn = document.querySelector('.teachers-btn'),
    groupSelect = document.querySelector('.group-select'),
    groupFindBtn = document.querySelector('.group-find');

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
        fetch('/loadGroups')
            .then((res) => res.json())
            .then((data) => {
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
                document.querySelector('.group-select-wrapper').style.display =
                    'block';
            });
    };
    teachersBtn.onclick = () => {
        fetch('/teachers-tt')
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                document.querySelector(
                    '.teacher-select-wrapper'
                ).style.display = 'block';
            });
    };
    groupFindBtn.onclick = () => {
        document.querySelector('.timetable-table').innerHTML = '';
        let date = new Date();
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
                    document.querySelector('.timetable-table').innerHTML += `
                    <h2 class="w-50 mx-auto">Day: ${data[i].day}</h2>
                    <table
                    class="table table-bordered align-middle students-table w-50 mx-auto"
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
                    </table>`;
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
                                        <th scope="row">${i}</th>
                                        <td>Mark</td>
                                        <td>${exists(lessonSubject)}</td>
                                        <td>${exists(lessonTeacher)}</td>
                                        <td>${exists(lessonClass)}</td>
                                    </tr>
                            `;
                        }
                    }
                }
            });
    };
});