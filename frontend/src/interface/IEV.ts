import { EmployeeInterface } from "./IEmployee";
import { StatusInterface } from "./IStatus";
import { TypeInterface } from "./IType";

export interface EVchargingInterface {
  ID: number;
  Name: string;
  Description: string;
  Price: number;
  Picture: string;
  Employee?: EmployeeInterface;
  Status?: StatusInterface;
  Type?: TypeInterface;

  EmployeeID?: number;
  StatusID?: number;
  TypeID?: number;
}

export interface CreateEVInput {
  Name: string;
  Description: string;
  Price: number;
  EmployeeID: number;
  StatusID: number;
  TypeID: number;
}
