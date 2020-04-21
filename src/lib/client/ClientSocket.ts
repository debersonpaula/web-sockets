import { BaseSocketConnector } from '../common/BaseSocketConnector';

export class ClientSocket extends BaseSocketConnector {
  private _socket: WebSocket;
  private _onError: () => void;
  private _onClose: () => void;
  private _onOpen: () => void;

  public open(url: string) {
    this.close();
    const socket = new WebSocket(url);
    this._socket = socket;

    socket.onopen = () => {
      this._send = (pkg: string) => {
        socket.send(pkg);
      };
      if (this._onOpen) {
        this._onOpen();
      }
    };

    socket.onclose = () => {
      this._send = undefined;
      if (this._onClose) {
        this._onClose();
      }
    };

    socket.onerror = this._onError;
    socket.onmessage = (msg) => this._receive(msg.data);
  }

  public close() {
    if (this._socket) {
      this._socket.close();
    }
  }

  public set onError(value: () => void) {
    this._onError = value;
  }

  public set onOpen(value: () => void) {
    this._onOpen = value;
  }

  public set onClose(value: () => void) {
    this._onClose = value;
  }
}
