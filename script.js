const btn = document.querySelector('button'),
    p = document.querySelector('p');

const API_SERVER = 'http://localhost:3000';
btn.onclick = () => {
    fetch(API_SERVER + '/api/table?text=show-me-this')
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            p.innerHTML = data.institutions;
        });
};