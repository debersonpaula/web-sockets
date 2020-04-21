export interface IPacket<T> {
  command: string;
  data: T;
}
