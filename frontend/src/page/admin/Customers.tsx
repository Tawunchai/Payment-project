import { useEffect, useState, useRef } from "react";
import { SelectionSettingsModel } from "@syncfusion/ej2-react-grids";
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
import { customersGrid } from "../../assets/admin/dummy";
import { ListUsersByRoleUser, DeleteUser } from "../../services/index";
import Modal from "./Getting/modal"; // <-- import Modal
import { Trash2 } from "react-feather";

const Customers = () => {
  const [customerData, setCustomerData] = useState<any[]>([]);
  const selectedRowsRef = useRef<number[]>([]);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const gridRef = useRef<any>(null); // ✅ ใช้ ref เพื่อควบคุม GridComponent

  const selectionsettings: SelectionSettingsModel = {
    persistSelection: true,
    type: "Multiple",
    mode: "Row",
  };

  const toolbarOptions = [{ text: 'Delete', id: 'customDelete', prefixIcon: 'e-delete' }];
  const editing = { allowEditing: true };

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await ListUsersByRoleUser();
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
          Gender: user.Gender?.Gender ?? "-",
          StatusBg: user.Gender?.Gender === "Male" ? "#8BE78B" : "#FEC90F",
          PhoneNumber: user.PhoneNumber ?? "-",
        }));
        setCustomerData(formatted);
      }
    };

    fetchUsers();
  }, []);

  const rowSelected = (args: any) => {
    const id = args.data?.UserID;
    if (id && !selectedRowsRef.current.includes(id)) {
      selectedRowsRef.current.push(id);
    }
  };

  const rowDeselected = (args: any) => {
    const id = args.data?.UserID;
    if (id) {
      selectedRowsRef.current = selectedRowsRef.current.filter((uid) => uid !== id);
    }
  };

  const toolbarClick = (args: any) => {
    if (args.item.id === "customDelete") {
      if (selectedRowsRef.current.length === 0) return;
      setOpenConfirmModal(true);
    }
  };

  const confirmDelete = async () => {
    const results = await Promise.all(
      selectedRowsRef.current.map((userId) => DeleteUser(userId))
    );

    const failedIds = selectedRowsRef.current.filter((_, i) => !results[i]);

    if (failedIds.length === 0) {
      const refreshed = await ListUsersByRoleUser(); // 🔁 ดึงข้อมูลใหม่
      if (refreshed) {
        const formatted = refreshed.map((user) => ({
          UserID: user.ID,
          Username: user.Username ?? "-",
          CustomerName: `${user.FirstName ?? ""} ${user.LastName ?? ""}`.trim(),
          CustomerEmail: user.Email ?? "-",
          CustomerImage:
            user.Profile && user.Profile !== ""
              ? user.Profile
              : "https://via.placeholder.com/40",
          Role: user.UserRole?.RoleName ?? "-",
          Gender: user.Gender?.Gender ?? "-",
          StatusBg: user.Gender?.Gender === "Male" ? "#8BE78B" : "#FEC90F",
          PhoneNumber: user.PhoneNumber ?? "-",
        }));
        setCustomerData(formatted);
      }
    }

    selectedRowsRef.current = [];
    setOpenConfirmModal(false);
  };

  const cancelDelete = () => {
    setOpenConfirmModal(false);

    if (gridRef.current) {
      gridRef.current.clearSelection(); // ✅ เคลียร์ selection เมื่อยกเลิก
    }

    selectedRowsRef.current = []; // ✅ เคลียร์ state ที่ใช้เช็ค
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Customers" />
      <GridComponent
        id="grid-users"
        ref={gridRef} // ✅ เพิ่ม ref
        dataSource={customerData}
        enableHover={true}
        allowPaging={true}
        pageSettings={{ pageCount: 5 }}
        selectionSettings={selectionsettings}
        toolbar={toolbarOptions}
        editSettings={editing}
        allowSorting={true}
        toolbarClick={toolbarClick}
        rowSelected={rowSelected}
        rowDeselected={rowDeselected}
      >
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50" />
          <ColumnDirective field="UserID" headerText="ID" isPrimaryKey={true} visible={false} />
          {customersGrid.map((item: any, index: number) => (
            <ColumnDirective key={index} {...item} />
          ))}
        </ColumnsDirective>
        <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
      </GridComponent>

      {/* ✅ Confirm Delete Modal */}
      <Modal open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <div className="text-center w-56">
          <Trash2 size={56} className="mx-auto text-red-500" />
          <div className="mx-auto my-4 w-48">
            <h3 className="text-lg font-black text-gray-800">ยืนยันการลบ</h3>
            <p className="text-sm text-gray-500">
              คุณแน่ใจว่าต้องการลบ {selectedRowsRef.current.length} รายการใช่หรือไม่?
            </p>
          </div>
          <div className="flex gap-4">
            <button className="btn btn-danger w-full" onClick={confirmDelete}>
              ลบ
            </button>
            <button className="btn btn-light w-full" onClick={cancelDelete}>
              ยกเลิก
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
