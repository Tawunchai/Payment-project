import {EmployeeInterface} from "./IEmployee"
import {StatusInterface} from "./IStatus"
import {TypeInterface} from "./IType"

export interface EVchargingInterface {
  ID: number;
  Name: string;
  Voltage: number;
  Current: number;
  Price: number;
  Employee?: EmployeeInterface;
  Status?: StatusInterface;
  Type?: TypeInterface;

  EmployeeID?: number;
  StatusID?: number;
  TypeID?: number;
}

export interface CreateEVInput {
  Name: string;
  Voltage: number;
  Current: number;
  Price: number;
  EmployeeID: number;
  StatusID: number;
  TypeID: number;
}