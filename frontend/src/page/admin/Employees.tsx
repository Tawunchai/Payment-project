import { useEffect, useState } from "react";
import {
  GridComponent,
  Inject,
  ColumnsDirective,
  ColumnDirective,
  Search,
  Page,
  Toolbar,
  Edit,
  Sort,
} from "@syncfusion/ej2-react-grids";

import { Header } from "../../component/admin";
import { employeesGrid } from "../../assets/admin/dummy";
import { ListUsersByRoleAdmin, GetEmployeeByUserID } from "../../services/index"; // ✅ นำเข้าเพิ่ม

const Employees = () => {
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const toolbarOptions = ["Search"];
  const editing = { allowDeleting: true, allowEditing: true };

  useEffect(() => {
    const fetchAdmins = async () => {
      const users = await ListUsersByRoleAdmin();
      console.log("🔍 Admin Users:", users);

      if (users) {
        const formatted = await Promise.all(
          users.map(async (user) => {
            const employeeDetail = await GetEmployeeByUserID(user.ID!);
            console.log(`🧾 Employee for UserID ${user.ID}:`, employeeDetail);

            return {
              EmployeeID: employeeDetail?.ID ?? user.ID,
              Name: `${user.FirstName ?? ""} ${user.LastName ?? ""}`.trim(),
              Email: user.Email ?? "-",
              ProfileImage: user.Profile || "profile/default.png",
              Role: user.UserRole?.RoleName ?? "-",
              Status: user.Gender?.Gender ?? "-",
              StatusBg: user.Gender?.Gender === "Male" ? "#8BE78B" : "#FEC90F",
              Phone: user.PhoneNumber ?? "-",
              Salary: employeeDetail?.Salary ?? "-",
            };
          })
        );
        setEmployeeData(formatted);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Employees (Admins)" />
      <GridComponent
        dataSource={employeeData}
        width="auto"
        allowPaging
        allowSorting
        pageSettings={{ pageCount: 5 }}
        editSettings={editing}
        toolbar={toolbarOptions}
      >
        <ColumnsDirective>
          {employeesGrid.map((item: any, index: number) => (
            <ColumnDirective key={index} {...item} />
          ))}
        </ColumnsDirective>
        <Inject services={[Search, Page, Toolbar, Edit, Sort]} />
      </GridComponent>
    </div>
  );
};

export default Employees;
