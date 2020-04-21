import { IPacket } from '../interfaces/IPacket';
import { TSocketReceiverHandler } from '../interfaces/TSocketReceiverHandler';

export class BaseSocketConnector {
  private _listeners: { [command: string]: TSocketReceiverHandler } = {};
  protected _send: TSocketReceiverHandler;

  public send<T>(command: string, data: T) {
    if (this._send) {
      const packet: IPacket<T> = {
        command,
        data,
      };
      this._send(JSON.stringify(packet));
    }
  }

  public subscribe<T>(command: string, callback: (data: T) => void) {
    this._listeners[command] = (responseData: any) => {
      callback(responseData);
    };
  }

  protected _receive(socketData: string) {
    const receivedPackage: IPacket<any> = JSON.parse(socketData);
    const command = this._listeners[receivedPackage.command];
    if (command) {
      command(receivedPackage.data);
    }
  }
}
