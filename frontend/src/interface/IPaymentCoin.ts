import {UsersInterface} from "./IUser"

export interface PaymentCoinInterface {
  ID?: number;
  Date: string;
  Amount: number;
  ReferenceNumber: string;
  Picture: string;
  User?: UsersInterface;
  UserID?: number;
  CreatedAt?:string
}
