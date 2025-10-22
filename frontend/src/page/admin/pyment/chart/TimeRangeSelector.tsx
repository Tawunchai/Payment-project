import React from "react";
import { DateRangePickerComponent } from "@syncfusion/ej2-react-calendars";

interface TimeRangeSelectorProps {
  timeRangeType: "day" | "month" | "year";
  onChange: (val: any) => void;
  selectedValue: any;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  timeRangeType, onChange, selectedValue,
}) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
  const months = [
    { value: "01", label: "Jan" }, { value: "02", label: "Feb" }, { value: "03", label: "Mar" },
    { value: "04", label: "Apr" }, { value: "05", label: "May" }, { value: "06", label: "Jun" },
    { value: "07", label: "Jul" }, { value: "08", label: "Aug" }, { value: "09", label: "Sep" },
    { value: "10", label: "Oct" }, { value: "11", label: "Nov" }, { value: "12", label: "Dec" },
  ];

  const baseStyle =
    "block rounded-md border border-teal-400 bg-white text-teal-600 text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-300 truncate";

  if (timeRangeType === "day") {
    return (
      <DateRangePickerComponent
        placeholder="Select date(s)"
        change={(args) => onChange(args.value)}
        value={Array.isArray(selectedValue) ? selectedValue : undefined}
        max={new Date()}
        cssClass="w-full text-xs"
      />
    );
  }

  if (timeRangeType === "month") {
    return (
      <div className="flex gap-2">
        <select
          className={baseStyle + " w-[90px]"}
          value={selectedValue?.month || ""}
          onChange={(e) => onChange({ ...selectedValue, month: e.target.value })}
        >
          <option value="" disabled>-- M --</option>
          {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select
          className={baseStyle + " w-[90px]"}
          value={selectedValue?.year || ""}
          onChange={(e) => onChange({ ...selectedValue, year: e.target.value })}
        >
          <option value="" disabled>-- Y --</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    );
  }

  if (timeRangeType === "year") {
    return (
      <div className="flex gap-2">
        <select
          className={baseStyle + " w-[90px]"}
          value={selectedValue?.[0] || ""}
          onChange={(e) => onChange([+e.target.value, selectedValue?.[1] || +e.target.value])}
        >
          <option value="" disabled>-- Start --</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          className={baseStyle + " w-[90px]"}
          value={selectedValue?.[1] || ""}
          onChange={(e) => onChange([selectedValue?.[0] || +e.target.value, +e.target.value])}
        >
          <option value="" disabled>-- End --</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    );
  }

  return null;
};

export default TimeRangeSelector;
