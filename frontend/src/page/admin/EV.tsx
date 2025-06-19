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
import { EVGrid } from "../../assets/admin/dummy"; // ตรวจสอบให้แน่ใจว่า EVGrid ตรงกับโครงสร้างข้อมูล EV
import { ListEVCharging } from "../../services/index"; // เปลี่ยน service

const EV = () => {
  const [evData, setEVData] = useState<any[]>([]);
  const selectionsettings = { persistSelection: true };
  const toolbarOptions = ["Delete"];
  const editing = { allowDeleting: true, allowEditing: true };

  useEffect(() => {
    const fetchEVData = async () => {
      const evs = await ListEVCharging();
      console.log(evs)
      if (evs) {
        const formatted = evs.map((ev) => ({
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
        }));
        setEVData(formatted);
      }
    };

    fetchEVData();
  }, []);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="EV Charging Stations" />
      <GridComponent
        dataSource={evData}
        enableHover={false}
        allowPaging
        pageSettings={{ pageCount: 5 }}
        selectionSettings={selectionsettings}
        toolbar={toolbarOptions}
        editSettings={editing}
        allowSorting
      >
        <ColumnsDirective>
          {EVGrid.map((item: any, index: number) => (
            <ColumnDirective key={index} {...item} />
          ))}
        </ColumnsDirective>
        <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};

export default EV;
