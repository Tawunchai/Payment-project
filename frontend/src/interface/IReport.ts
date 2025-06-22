import {EmployeeInterface} from "./IEmployee"
import {UsersInterface} from "./IUser"

export interface ReportInterface {
    ID?: number;
    Picture?: string;
    Description?: string; 
    Status?: string;
    Employee?: EmployeeInterface; 
    User?:UsersInterface;
}
