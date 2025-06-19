import {EmployeeInterface} from "./IEmployee"

export interface CalendarInterface {
  ID?: number;
  Title: string;
  Location: string;
  Description: string;
  StartDate: string;   
  EndDate: string;
  EmployeeID?: EmployeeInterface;
}