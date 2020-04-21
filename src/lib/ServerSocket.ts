import ws from 'ws';
import * as http from 'http';
import { IPacket } from './IPacket';

export class ServerSocket<T> {
  public onListening: () => void;
  public onError: (err: Error) => void;
  public onAddConnection: (req: http.IncomingMessage) => T;
  public onMessage: (conn: CustomSocket<T>, message: ws.Data) => void;
  public onClose: (conn: CustomSocket<T>) => void;
  private _socket: ws.Server;
  private _listeners: {
    [command: string]: (conn: CustomSocket<T>, responseData: any) => void;
  } = {};

  // listen to a method
  public subscribe<R>(
    command: string,
    callback: (conn: CustomSocket<T>, response: R) => void
  ) {
    this._listeners[command] = (conn, responseData) => {
      callback(conn, responseData);
    };
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
      // assign methods
      conn.isOpen = () => conn.readyState === ws.OPEN;
      conn.sendData = (command: string, data: any) => {
        const packet: IPacket<any> = {
          command,
          data,
        };
        conn.send(JSON.stringify(packet));
      };

      if (this.onAddConnection) {
        conn.data = this.onAddConnection(req);
      }
      conn.on('message', (message) => {
        if (this.onMessage) {
          this.onMessage(conn, message);
        }
        this._receive(conn, message.toString());
      });
      conn.on('close', () => {
        if (this.onClose) {
          this.onClose(conn);
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

  public get clients() {
    return this._socket.clients as Set<CustomSocket<T>>;
  }

  private _receive(conn: CustomSocket<T>, socketData: string) {
    const receivedPackage: IPacket<any> = JSON.parse(socketData);
    const command = this._listeners[receivedPackage.command];
    if (command) {
      command(conn, receivedPackage.data);
    }
  }
}

interface CustomSocket<T> extends ws {
  data: T;
  sendData: <R>(command: string, data: R) => void;
  isOpen: () => boolean;
}
