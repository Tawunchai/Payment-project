import "./Ecommerce.css"
import RecentTransactions from "./recent_transctions/notebook"
import LineChart from './chart/notebook'
import Weekly from "./weekly/notebook"
import Banding from "./branding/notebook"
import Introduction from "./header/notebook"
import Month from "./month/notebook"
import Year from "./year/notebook"
//
const Ecommerce = () => {
  return (
    <div className="flex-1 ml-0 mt-24">
      <Introduction />

      <div className="flex gap-1 flex-wrap justify-center">
        <div className="flex flex-wrap justify-center">
          <Weekly />
          <Banding />
        </div>

        <div>
          <Month />
          <Year />
        </div>
      </div>

      <div className="flex gap-2 m-4 flex-wrap justify-center">
        <RecentTransactions />
        <LineChart />
      </div>
    </div>
  );
};

export default Ecommerce;
