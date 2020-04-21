import ws from 'ws';
import { BaseSocketConnector } from '../common/BaseSocketConnector';
import { TSocketData } from '../interfaces/TSocketData';

export class ClientConnection<DataType> extends BaseSocketConnector {
  private _data: DataType;
  private _isOpen: () => boolean;
  private _onClose: () => void;

  constructor(
    wsConnection: ws,
    initialData: DataType,
    customReceiver: TClientConnectionReceiver<DataType>
  ) {
    super();
    // assign custom data
    this._data = initialData;
    // assign method to send data
    this._send = (data) => {
      wsConnection.send(data);
    };
    // assign method to check if is open
    this._isOpen = () => wsConnection.readyState === ws.OPEN;
    // assign event CLOSE
    wsConnection.on('close', () => {
      if (this._onClose) {
        this._onClose();
      }
    });
    // assign event MESSAGE
    wsConnection.on('message', (data) => {
      if (customReceiver) {
        customReceiver(this, data);
      } else {
        this._receive(data.toString());
      }
    });
  }

  /**
   * Define method for onClose event
   */
  public set onClose(value: () => void) {
    this._onClose = value;
  }

  /**
   * Returns if connection is still open
   */
  public get isOpen() {
    return this._isOpen;
  }

  /**
   * Custom data to attach on client connection
   */
  public get data() {
    return this._data;
  }
}

export type TClientConnectionReceiver<DataType> = (
  connection: ClientConnection<DataType>,
  data: TSocketData
) => void;
