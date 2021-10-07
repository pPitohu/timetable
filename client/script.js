const select = document.querySelector('.institution-select'),
    studentsBtn = document.querySelector('.students-btn'),
    teachersBtn = document.querySelector('.teachers-btn'),
    groupSelect = document.querySelector('.group-select'),
    groupFindBtn = document.querySelector('.group-find');

const API_SERVER = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    fetch('/getListOfInstitutes')
        .then((res) => res.json())
        .then((data) => {
            //console.log(data);
            data.forEach(
                (el) =>
                    (select.innerHTML += `<option value="${el.name}">${el.name}</option>`)
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
            });
    };
    teachersBtn.onclick = () => {
        fetch('/teachers-tt')
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
            });
    };
    groupFindBtn.onclick = () => {
        fetch(
            `/getGroupTimeTable?group=${
                document.querySelectorAll('.group-select option[selected]')[1]
                    .value
            }`
        )
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
            });
    };
});
