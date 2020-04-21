import crypto from 'crypto';
import { ServerSocket } from '../lib/server/ServerSocket';

const port = 16000;

interface IClient {
  _id: string;
  remoteAddress: string;
  name: string;
}

const server = new ServerSocket<IClient>();

// Event to Error
server.onError = (err) => {
  // tslint:disable-next-line: no-console
  console.log('Error', err);
};
// Event to Listening
server.onListening = () => {
  // tslint:disable-next-line: no-console
  console.log('Listening on port', port);
};
// Event for client before connection
server.onAddConnection = (req) => {
  return {
    _id: crypto.randomBytes(48).toString('hex'),
    remoteAddress: req.connection.remoteAddress,
    name: null,
  };
};
// Event to Close
server.onClose = (client) => {
  broadcast(`[${client.data.name}] disconnected`);
};
// Event to command USER
server.subscribe<string>('USER', (conn, resp) => {
  conn.data.name = resp;
  broadcast(`[${conn.data.name}] connected`);
});
// Event to command MESSAGE
server.subscribe<string>('MESSAGE', (conn, resp) => {
  broadcast(`[${conn.data.name}] says: ${resp}`);
});
// Start servers in the designed port
server.open({ port });

function broadcast(msg: string) {
  server.clients.forEach((client) => {
    if (client.isOpen()) {
      client.send('MESSAGE', msg);
    }
  });
}
