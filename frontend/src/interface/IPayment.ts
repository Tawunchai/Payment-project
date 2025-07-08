import { UsersInterface } from "./IUser";
import { MethodInterface } from "./IMethod";

export interface PaymentsInterface {
  ID: number;
  Amount: number;
  Date: Date
  ReferenceNumber: string,
  Picture: string,
  User: UsersInterface;
  Method: MethodInterface;
}

export interface EVChargingPaymentInterface {
  id?: number;
  evcharging_id: number;
  payment_id: number;
  price: number;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentCreateInterface {
  date: string;
  amount: number;
  user_id: number;
  method_id: number;
  reference_number: string;
  picture?: File | null;
}

export interface PaymentInterface {
  ID: number;
  date: string;
  amount: number;
  user_id: number;
  method_id: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}