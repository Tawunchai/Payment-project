import { PaymentInterface } from "./IPayment";

export interface ChargingSessionInterface {
  ID: number;
  UserID: number;
  Token: string;
  ExpiresAt: string;
  CreatedAt: string;
  Status: boolean;
  PaymentID: number;
  Payment?: PaymentInterface; // ถ้า preload Payment
}