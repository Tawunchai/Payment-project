import { EmployeeInterface } from "./IEmployee";
import { UsersInterface } from "./IUser";

export interface ReportInterface {
  ID?: number;
  Picture?: string;
  Description?: string;
  Status?: string;

  // 🔗 ความสัมพันธ์
  EmployeeID?: number;
  Employee?: EmployeeInterface;
  UserID?: number;
  User?: UsersInterface;

  // 🕒 ใช้สำหรับตรวจสอบช่วงเวลา (รายงานภายใน 7 วัน)
  CreatedAt?: string;
  UpdatedAt?: string;
}
