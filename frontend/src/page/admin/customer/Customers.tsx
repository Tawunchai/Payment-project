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
import { GendersInterface } from "../../../interface/IGender";
import { UserroleInterface } from "../../../interface/IUserrole";
import { Header } from "../../../component/admin";
import { customersGrid } from "../../../assets/admin/dummy";
import { ListUsersByRoleUser, DeleteUser, UpdateUser, ListGenders, ListUserRoles } from "../../../services/index";
import Modal from "../getting/modal";
import EditUserModal from "./edit/index";
import { Trash2 } from "react-feather";

const Customers = () => {

  const [customerData, setCustomerData] = useState<any[]>([]);
  const selectedRowsRef = useRef<number[]>([]);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [genders, setGenders] = useState<GendersInterface[]>([]);
  const [userRoles, setUserRoles] = useState<UserroleInterface[]>([]);

  const gridRef = useRef<any>(null);

  const selectionsettings: SelectionSettingsModel = {
    persistSelection: true,
    type: "Multiple",
    mode: "Row",
  };

  const toolbarOptions = [{ text: "Delete", id: "customDelete", prefixIcon: "e-delete" }];
  const editing = { allowEditing: true };

  useEffect(() => {
    fetchUsers();
    fetchDropdownOptions();
  }, []);

  const fetchDropdownOptions = async () => {
    const g = await ListGenders();
    const r = await ListUserRoles();
    if (g) setGenders(g);
    if (r) setUserRoles(r);
  };

  const fetchUsers = async () => {
    const users = await ListUsersByRoleUser();
    if (users) {
      const formatted = users.map((user) => ({
        UserID: user.ID,
        Username: user.Username ?? "-",
        FirstName: user.FirstName ?? "",
        LastName: user.LastName ?? "",
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
        Raw: user, 
      }));
      setCustomerData(formatted);
    }
  };

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
      await fetchUsers();
    }

    selectedRowsRef.current = [];
    setOpenConfirmModal(false);
  };

  const cancelDelete = () => {
    setOpenConfirmModal(false);
    gridRef.current?.clearSelection();
    selectedRowsRef.current = [];
  };

  const openEditModal = (user: any) => {
    setEditUser(user);
  };

  const handleUpdate = async (updated: any) => {
    if (!updated.UserID && !updated.ID) {
      alert("User ID not found");
      return;
    }
    const id = updated.UserID ?? updated.ID;
    const { Raw, CustomerName, ...dataToUpdate } = updated; 
    console.log(dataToUpdate)
    const res = await UpdateUser(id, dataToUpdate);
    if (res) {
      await fetchUsers();
      setEditUser(null);
    } else {
      alert("Failed to update user");
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Customers" />
      <GridComponent
        id="grid-users"
        ref={gridRef}
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
          <ColumnDirective
            headerText="Action"
            width="100"
            template={(props: any) => (
              <button
                onClick={() => openEditModal(props.Raw)}
                className="text-blue-500 underline"
              >
                Edit
              </button>
            )}
          />
        </ColumnsDirective>
        <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
      </GridComponent>

      {/* Confirm Delete Modal */}
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

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal
          open={!!editUser}
          onClose={() => setEditUser(null)}
          user={editUser}
          onSave={handleUpdate}
          genders={genders}        // ต้องดึงข้อมูลมาจาก API หรือ mock
          userRoles={userRoles}    // ต้องดึงข้อมูลมาจาก API หรือ mock
        />
      )}
    </div>
  );
};

export default Customers;
