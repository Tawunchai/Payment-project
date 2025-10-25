export interface BookingInterface {
  ID?: number;
  StartDate: string;
  EndDate: string;
  UserID?: number;
  EVCabinetID?: number;
  User?: any;
  EVCabinet?: any;
}

import type { EmployeeInterface } from "./IEmployee";

export interface EVCabinetInterface {
  ID: number;
  Name: string;
  Description: string;
  Location: string;
  Status: string;
  Latitude: number;
  Longitude: number;
  Image: string;
  EmployeeID?: number;
  Employee?: EmployeeInterface;
}
