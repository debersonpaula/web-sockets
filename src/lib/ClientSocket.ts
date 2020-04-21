import { BaseSocketConnector } from './BaseSocketConnector';

export class ClientSocket extends BaseSocketConnector {
  private _socket: WebSocket;

  public open(url: string) {
    this.close();
    const socket = new WebSocket(url);
    this._socket = socket;

    socket.onopen = () => {
      this._send = (pkg: string) => {
        socket.send(pkg);
      };
      if (this.onOpen) {
        this.onOpen();
      }
    };

    socket.onclose = () => {
      this._send = undefined;
      if (this.onClose) {
        this.onClose();
      }
    };

    socket.onerror = this.onError;
    socket.onmessage = (msg) => this._receive(msg.data);
  }

  public close() {
    if (this._socket) {
      this._socket.close();
    }
  }
}
