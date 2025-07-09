import RecentTransactions from "./recent_transctions/phone"
import Introduction from "./header/phone"
import Banding from "./branding/phone"
import Month from "./month/phone"
import Weekly from "./weekly/phone"
import Year from "./year/phone"
import LineChart from './chart/phone'

const Ecommerce = () => {

  return (
    <div className="mt-24">
      <Introduction />

      <div className="flex gap-10 flex-wrap justify-center">
        <div className="flex flex-wrap justify-center">
          <Weekly />
          <Banding />
        </div>

        <div>
          <Month />
          <Year />
        </div>
      </div>

      <div className="flex gap-10 m-4 flex-wrap justify-center">
        <RecentTransactions />
        <LineChart />
      </div>
    </div>
  );
};

export default Ecommerce;
