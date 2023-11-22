/* eslint-disable prettier/prettier */
const username = localStorage.getItem('name');

if (!username) {
  window.location.replace('/');
  throw new Error('Username is required');
}

const lblStatusOnline  = document.querySelector('#status-online');
const lblStatusOffline = document.querySelector('#status-offline'); 

const usersUlElement = document.querySelector('ul'); 

const usernameDiv = document.querySelector('.name');
const form = document.querySelector('form');
const input = document.querySelector('input');
const chatElement = document.querySelector('#chat');

const renderUsers = (users) => {
    usersUlElement.innerHTML = '';
    console.log(users);
    users.forEach((user) => {
        if (user.id === socket.id) {
            usernameDiv.innerText = user.name;
        }

        const liElement = document.createElement('li');
        liElement.innerText = user.name;
        usersUlElement.appendChild(liElement);
    })
}

const renderMessage = (payload) => {
    const {userId, message, name} = payload;

    const divElement = document.createElement('div');
    divElement.classList.add('message');

    if (userId !== socket.id) {
        divElement.classList.add('incoming');
    }

    divElement.innerHTML = `
        <small>${name}</small>
        <p>${message}</p>
    `;

    chatElement.appendChild(divElement);

    chatElement.scrollTop = chatElement.scrollHeight;
}


form.addEventListener('submit', (event) => {
    event.preventDefault();

    const message = input.value;
    socket.emit('send-message', message);
});

const socket = io({
    auth: {
        token: 'ABC-123',
        name: username
    }
});

socket.on('connect', () => {
    console.log('conectado');
    lblStatusOnline.classList.remove('hidden');
    lblStatusOffline.classList.add('hidden');
});

socket.on('disconnect', () => {
    console.log('desconectado');
    lblStatusOnline.classList.add('hidden');
    lblStatusOffline.classList.remove('hidden');
});

socket.on('welcome-message', (data) => console.log(data));

socket.on('on-clients-change', renderUsers);

socket.on('on-message', renderMessage);