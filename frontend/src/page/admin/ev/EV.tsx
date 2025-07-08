import { useEffect, useRef, useState } from "react";
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
import { EVGrid } from "../../../assets/admin/dummy";
import {
  ListEVCharging,
  DeleteEVcharging,
  ListStatus,
  ListTypeEV,
  apiUrlPicture
} from "../../../services/index";
import Modal from "../getting/modal";
import { Trash2 } from "react-feather";

import EditEVModal from "./edit";
import CreateEVModal from "./create";
import { Image } from "antd";

const EV = () => {
  const [evData, setEVData] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [typeList, setTypeList] = useState<any[]>([]);

  const selectedRowsRef = useRef<number[]>([]);
  const gridRef = useRef<any>(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEV, setEditingEV] = useState<any>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const selectionsettings: SelectionSettingsModel = {
    persistSelection: true,
    type: "Multiple",
    mode: "Row",
  };

  const toolbarOptions = [
    { text: "CREATE", id: "customCreate", prefixIcon: "e-add" },
    { text: "DELETE", id: "customDelete", prefixIcon: "e-delete" },
  ];

  const editing = { allowDeleting: true, allowEditing: true };

  useEffect(() => {
    fetchEVData();
    fetchStatusList();
    fetchTypeList();
  }, []);

  const fetchEVData = async () => {
    const evs = await ListEVCharging();
    if (evs) {
      const formatted = evs.map((ev: any) => ({
        ID: ev.ID,
        Name: ev.Name ?? "-",
        Email: ev.Employee?.User?.Email ?? "-",
        Voltage: ev.Voltage ?? "-",
        Current: ev.Current ?? "-",
        Price: ev.Price ?? 0,
        Type: ev.Type?.Type ?? "-",
        Status: ev.Status?.Status ?? "-",
        EmployeeName: ev.Employee
          ? `${ev.Employee?.User?.FirstName ?? ""} ${ev.Employee?.User?.LastName ?? ""}`.trim()
          : "-",
        ProfileImage: ev.Employee?.User?.Profile || "profile/default.png",
        EmployeeID: ev.EmployeeID,
        StatusID: ev.StatusID,
        TypeID: ev.TypeID,
        Picture: ev.Picture ?? "",
      }));
      setEVData(formatted);
    }
  };

  const fetchStatusList = async () => {
    const statuses = await ListStatus();
    if (statuses) setStatusList(statuses);
  };

  const fetchTypeList = async () => {
    const types = await ListTypeEV();
    if (types) setTypeList(types);
  };

  const rowSelected = (args: any) => {
    const id = args.data?.ID;
    if (id && !selectedRowsRef.current.includes(id)) {
      selectedRowsRef.current.push(id);
    }
  };

  const rowDeselected = (args: any) => {
    const id = args.data?.ID;
    if (id) {
      selectedRowsRef.current = selectedRowsRef.current.filter((eid) => eid !== id);
    }
  };

  const toolbarClick = (args: any) => {
    if (args.item.id === "customDelete") {
      if (selectedRowsRef.current.length === 0) return;
      setOpenConfirmModal(true);
    } else if (args.item.id === "customCreate") {
      setCreateModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    const results = await Promise.all(
      selectedRowsRef.current.map((evId) => DeleteEVcharging(evId))
    );

    const failedIds = selectedRowsRef.current.filter((_, i) => !results[i]);

    if (failedIds.length === 0) {
      await fetchEVData();
    }

    selectedRowsRef.current = [];
    setOpenConfirmModal(false);
  };

  const cancelDelete = () => {
    setOpenConfirmModal(false);
    selectedRowsRef.current = [];

    if (gridRef.current) {
      gridRef.current.clearSelection();
    }
  };

  const handleEdit = (rowData: any) => {
    setEditingEV(rowData);
    setEditModalOpen(true);
  };

  const onSaveEdit = async () => {
    setEditModalOpen(false);
    setEditingEV(null);
    await new Promise((r) => setTimeout(r, 300));
    fetchEVData();
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="EV Charging Stations" />
      <GridComponent
        id="grid-ev"
        ref={gridRef}
        dataSource={evData}
        enableHover={false}
        allowPaging
        pageSettings={{ pageCount: 5 }}
        selectionSettings={selectionsettings}
        toolbar={toolbarOptions}
        editSettings={editing}
        allowSorting
        toolbarClick={toolbarClick}
        rowSelected={rowSelected}
        rowDeselected={rowDeselected}
      >
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50" />
          <ColumnDirective field="ID" isPrimaryKey={true} visible={false} />
          <ColumnDirective
            headerText="Picture"
            textAlign="Center"
            width="120"
            template={(props: any) => (
              <Image
                src={`${apiUrlPicture}${props.Picture}`}
                alt="EV"
                className="w-6 h-6 object-cover mx-auto rounded"
              />
            )}
          />
          {EVGrid.map((item: any, index: number) => (
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

      {/* Modal ยืนยันการลบ */}
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

      {/* Modal แก้ไข EV */}
      <EditEVModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        evCharging={editingEV}
        onSaved={onSaveEdit}
        statusList={statusList}
        typeList={typeList}
      />

      {/* Modal สร้าง EV */}
      <CreateEVModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSaved={async () => {
          setCreateModalOpen(false);
          await fetchEVData();
        }}
        statusList={statusList}
        typeList={typeList}
      />
    </div>
  );
};

export default EV;
