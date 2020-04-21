import { ClientSocket } from '../lib/client/ClientSocket';

const user = document.getElementById('user') as HTMLInputElement;
const message = document.getElementById('message') as HTMLInputElement;
const send = document.getElementById('send');
const connect = document.getElementById('connect');
const messages = document.getElementById('messages');

function receiveMessage(msg: string) {
  const receivedMessage = document.createElement('p');
  receivedMessage.innerText = msg;
  messages.appendChild(receivedMessage);
}

const socket = new ClientSocket();
socket.onClose = () => receiveMessage('Disconnected from the server.');
socket.onError = () => receiveMessage('Error in the Server.');
socket.onOpen = () => {
  receiveMessage('Connected to the server.');
  socket.send('USER', user.value);
};
socket.subscribe<string>('MESSAGE', (data) => {
  receiveMessage(data);
});

connect.onclick = () => {
  if (user.value) {
    socket.open('ws://localhost:16000');
  } else {
    alert('user name required');
  }
};

send.onclick = () => {
  socket.send('MESSAGE', message.value);
};
