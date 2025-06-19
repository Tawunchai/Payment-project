import { useEffect, useState } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Selection,
  Inject,
  Edit,
  Toolbar,
  Sort,
  Filter,
} from "@syncfusion/ej2-react-grids";

import { Header } from "../../component/admin";
import { customersGrid } from "../../assets/admin/dummy"; // ปรับ path ตามโปรเจกต์จริง
import { ListUsersByRoleUser } from "../../services/index";

const EV = () => {
  const [customerData, setCustomerData] = useState<any[]>([]);
  const selectionsettings = { persistSelection: true };
  const toolbarOptions = ["Delete"];
  const editing = { allowDeleting: true, allowEditing: true };

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await ListUsersByRoleUser();
      console.log(users)
      if (users) {
        const formatted = users.map((user) => ({
          UserID: user.ID,
          Username: user.Username ?? "-",
          CustomerName: `${user.FirstName ?? ""} ${user.LastName ?? ""}`.trim(),
          CustomerEmail: user.Email ?? "-",
          CustomerImage:
            user.Profile && user.Profile !== ""
              ? user.Profile
              : "https://via.placeholder.com/40",
          Role: user.UserRole?.RoleName ?? "-",
          Status: user.Gender?.Gender ?? "-",
          StatusBg: user.Gender?.Gender === "Male" ? "#8BE78B" : "#FEC90F",
          PhoneNumber: user.PhoneNumber ?? "-", 
        }));


        setCustomerData(formatted);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Customers" />
      <GridComponent
        dataSource={customerData}
        enableHover={false}
        allowPaging
        pageSettings={{ pageCount: 5 }}
        selectionSettings={selectionsettings}
        toolbar={toolbarOptions}
        editSettings={editing}
        allowSorting
      >
        <ColumnsDirective>
          {customersGrid.map((item: any, index: number) => (
            <ColumnDirective key={index} {...item} />
          ))}
        </ColumnsDirective>
        <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};

export default EV;
