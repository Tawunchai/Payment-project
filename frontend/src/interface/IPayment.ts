import { UsersInterface } from "./IUser";
import { MethodInterface } from "./IMethod";

export interface PaymentsInterface {
    ID: number;
    Amount: number;
    Date: Date
    User: UsersInterface;
    Method: MethodInterface;
}