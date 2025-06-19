import { useEffect, useState } from 'react';
import {
  ScheduleComponent,
  ViewsDirective,
  ViewDirective,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
  Resize,
  DragAndDrop,
} from '@syncfusion/ej2-react-schedule';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import type { ScheduleComponent as ScheduleType } from '@syncfusion/ej2-react-schedule';
import { Header } from '../../component/admin';
import type { View } from '@syncfusion/ej2-react-schedule';

import { ListCalendars } from '../../services/index';
import { CalendarInterface } from '../../interface/ICalendar';

const PropertyPane = (props: any) => <div className="mt-5">{props.children}</div>;

const Scheduler = () => {
  const [scheduleObj, setScheduleObj] = useState<ScheduleType | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const views: View[] = ['Day', 'Week', 'WorkWeek', 'Month', 'Agenda'];

  useEffect(() => {
    const fetchData = async () => {
      const res: CalendarInterface[] | null = await ListCalendars();
      if (res) {
        const mapped = res.map((item, index) => ({
          Id: item.ID,
          Subject: item.Title,
          Location: item.Location,
          Description: item.Description,
          StartTime: item.StartDate,
          EndTime: item.EndDate,
          CategoryColor: '#1aaa55', // กำหนดสีตามต้องการหรือสุ่ม
        }));
        setEvents(mapped);
      }
    };
    fetchData();
  }, []);

  const change = (args: any) => {
    if (scheduleObj) {
      scheduleObj.selectedDate = args.value;
      scheduleObj.dataBind();
    }
  };

  const onDragStart = (arg: any) => {
    arg.navigation.enable = true;
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Calendar" />
      <ScheduleComponent
        height="650px"
        ref={(schedule: any) => setScheduleObj(schedule)}
        selectedDate={new Date()}
        eventSettings={{ dataSource: events }}
        dragStart={onDragStart}
      >
        <ViewsDirective>
          {views.map((item) => (
            <ViewDirective key={item} option={item} />
          ))}
        </ViewsDirective>
        <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
      </ScheduleComponent>
      <PropertyPane>
        <table style={{ width: '100%', background: 'white' }}>
          <tbody>
            <tr style={{ height: '50px' }}>
              <td style={{ width: '100%' }}>
                <DatePickerComponent
                  value={new Date()}
                  showClearButton={false}
                  placeholder="Current Date"
                  floatLabelType="Always"
                  change={change}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </PropertyPane>
    </div>
  );
};

export default Scheduler;
