import {EmployeeInterface} from "./IEmployee"

export interface NewsInterface {
    ID?: number;
    Picture?: string;
    Title?: string;
    Description?: string; 
    Employee?: EmployeeInterface; 
}
