import {EmployeeInterface} from "./IEmployee"
import {StatusInterface} from "./IStatus"
import {TypeInterface} from "./IType"

export interface EVchargingInterface {
  ID: number;
  Name: string;
  Voltage: string;
  Current: string;
  Price: number;
  Employee?: EmployeeInterface;
  Status?: StatusInterface;
  Type?: TypeInterface;
}