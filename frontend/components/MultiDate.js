import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";

export default function MultiDate() {
  return <DatePicker range plugins={[<DatePanel />]} />;
}
