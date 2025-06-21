import { useEffect, useState, useRef } from "react";
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
import { SelectionSettingsModel } from "@syncfusion/ej2-react-grids";

import { Header } from "../../../component/admin";
import { employeesGrid } from "../../../assets/admin/dummy";
import {
  ListUsersByRoleAdmin,
  GetEmployeeByUserID,
  DeleteAdmin,
  ListUserRoles,  
} from "../../../services/index";

import Modal from "../getting/modal";
import { Trash2 } from "react-feather";
import EditAdminModal from "./edit/index"; 

const Employees = () => {
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);  // เก็บ roles
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const selectedRowsRef = useRef<number[]>([]);
  const gridRef = useRef<any>(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const selectionsettings: SelectionSettingsModel = {
    persistSelection: true,
    type: "Multiple",
    mode: "Row",
  };

  const toolbarOptions = [{ text: "Delete", id: "customDelete", prefixIcon: "e-delete" }];
  const editing = { allowDeleting: true, allowEditing: true };

  useEffect(() => {
    fetchAdmins();
    fetchUserRoles();
  }, []);

  const fetchAdmins = async () => {
    const users = await ListUsersByRoleAdmin();

    if (users) {
      const formatted = await Promise.all(
        users.map(async (user) => {
          const employeeDetail = await GetEmployeeByUserID(user.ID!);

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
            UserRole: user.UserRole,
            UserID: user.ID,
          };
        })
      );
      setEmployeeData(formatted);
    }
  };

  const fetchUserRoles = async () => {
    const roles = await ListUserRoles();
    if (roles) setUserRoles(roles);
  };

  const rowSelected = (args: any) => {
    const id = args.data?.EmployeeID;
    if (id && !selectedRowsRef.current.includes(id)) {
      selectedRowsRef.current.push(id);
    }
  };

  const rowDeselected = (args: any) => {
    const id = args.data?.EmployeeID;
    if (id) {
      selectedRowsRef.current = selectedRowsRef.current.filter((eid) => eid !== id);
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
      selectedRowsRef.current.map((empId) => DeleteAdmin(empId))
    );

    const failedIds = selectedRowsRef.current.filter((_, i) => !results[i]);

    if (failedIds.length === 0) {
      await fetchAdmins();
    }

    selectedRowsRef.current = [];
    setOpenConfirmModal(false);
  };

  const cancelDelete = () => {
    setOpenConfirmModal(false);
    if (gridRef.current) {
      gridRef.current.clearSelection();
    }
    selectedRowsRef.current = [];
  };

  // แก้ไข: เปิด modal แก้ไขข้อมูล admin
  const handleEdit = (rowData: any) => {
    setEditingEmployee(rowData);
    setEditModalOpen(true);
  };

  // เมื่อบันทึกข้อมูลใน modal เสร็จ
  const onSaveEdit = () => {
    setEditModalOpen(false);
    setEditingEmployee(null);
    fetchAdmins(); // รีโหลดข้อมูลหลังแก้ไข
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Employees (Admins)" />
      <GridComponent
        id="grid-admins"
        ref={gridRef}
        dataSource={employeeData}
        allowPaging
        allowSorting
        enableHover={true}
        pageSettings={{ pageCount: 5 }}
        selectionSettings={selectionsettings}
        toolbar={toolbarOptions}
        editSettings={editing}
        toolbarClick={toolbarClick}
        rowSelected={rowSelected}
        rowDeselected={rowDeselected}
      >
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50" />
          <ColumnDirective field="EmployeeID" headerText="ID" isPrimaryKey={true} visible={false} />

          {employeesGrid.map((item: any, index: number) => (
            <ColumnDirective key={index} {...item} />
          ))}

          <ColumnDirective
            headerText="Action"
            textAlign="Center"
            width="120"
            template={(props: any) => (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
                onClick={() => handleEdit(props)}
              >
                Edit
              </button>
            )}
          />
        </ColumnsDirective>

        <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
      </GridComponent>

      {/* Modal ลบ */}
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

      {/* Modal แก้ไข admin */}
      <EditAdminModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        employee={editingEmployee}
        onSaved={onSaveEdit}
        userRoles={userRoles}
      />
    </div>
  );
};

export default Employees;
