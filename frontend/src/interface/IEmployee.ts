import { UsersInterface } from "./IUser"

export interface EmployeeInterface {
  ID?: number;
  Bio?: string;
  Experience?: string;
  Education?: string;
  Salary?: number;
  FullTime?: boolean;
  User?: UsersInterface;
}

export interface CreateEmployeeInput {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  salary: number;
}