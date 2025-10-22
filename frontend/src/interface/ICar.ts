import { UsersInterface } from "./IUser";

export interface CarsInterface {
  ID?: number;
  Brand?: string;
  ModelCar?: string;
  SpecialNumber?: boolean;
  LicensePlate?: string;
  City?: string;
  User?: UsersInterface[];
}
