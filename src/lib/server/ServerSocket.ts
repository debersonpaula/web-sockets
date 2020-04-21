import ws from 'ws';
import * as http from 'http';
import { IPacket } from '../interfaces/IPacket';
import { ClientConnection } from './ClientConnection';
import { TSocketData } from '../interfaces/TSocketData';

export class ServerSocket<T> {
  public onListening: () => void;
  public onError: (err: Error) => void;
  public onAddConnection: (req: http.IncomingMessage) => T;
  public onClose: (conn: ClientConnection<T>) => void;
  private _socket: ws.Server;
  private _listeners: {
    [command: string]: (conn: ClientConnection<T>, response: any) => void;
  } = {};

  // listen to a method
  public subscribe<R>(
    command: string,
    callback: (conn: ClientConnection<T>, response: R) => void
  ) {
    this._listeners[command] = callback;
  }

  // START SERVER
  public open(options: ws.ServerOptions) {
    this._socket = new ws.Server(options);
    // --- listening --------------------
    this._socket.on('listening', () => {
      if (this.onListening) {
        this.onListening();
      }
    });
    // --- error ------------------------
    this._socket.on('error', (err) => {
      if (this.onError) {
        this.onError(err);
      }
    });
    // --- connection -------------------
    this._socket.on('connection', (conn: CustomSocket<T>, req) => {
      const initialData = this.onAddConnection
        ? this.onAddConnection(req)
        : null;

      const client = new ClientConnection<T>(
        conn,
        initialData,
        this._receive.bind(this)
      );

      conn.client = client;

      conn.on('close', () => {
        if (this.onClose) {
          this.onClose(client);
        }
      });
    });
  }

  // SHUTDOWN SERVER
  public close() {
    if (this._socket) {
      this._socket.close();
    }
  }

  // LIST OF CLIENTS
  public get clients() {
    const clientList: ClientConnection<T>[] = [];
    this._socket.clients.forEach((conn: CustomSocket<T>) => {
      clientList.push(conn.client);
    });
    return clientList;
  }

  // RECEIVE DATA FROM ONMESSAGE EVENT
  private _receive(connection: ClientConnection<T>, data: TSocketData) {
    const receivedPackage: IPacket<any> = JSON.parse(data.toString());
    const command = this._listeners[receivedPackage.command];
    if (command) {
      command(connection, receivedPackage.data);
    }
  }
}

interface CustomSocket<T> extends ws {
  client: ClientConnection<T>;
}
