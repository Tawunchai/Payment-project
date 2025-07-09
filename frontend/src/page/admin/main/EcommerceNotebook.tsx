import "./Ecommerce.css"
import RecentTransactions from "./recent_transctions"
import LineChart from './chart/index'
import Weekly from "./weekly"
import Banding from "./branding"
import Introduction from "./header"
import Month from "./month"
import Year from "./year"

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
