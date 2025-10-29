import "./Ecommerce.css"
import RecentTransactions from "./recent_transctions/notebook"
import LineChart from './chart/notebook'
import Weekly from "./weekly/notebook"
import Banding from "./branding/notebook"
import Introduction from "./header/IPad"
import Month from "./month/notebook"
import Year from "./year/notebook"
//
const EcommerceIPad = () => {
    return (
        <div className="flex-1 ml-0 mt-24 md:mt-0">
            <Introduction />

            <div className="flex gap-1 flex-wrap justify-center">
                <div className="flex flex-wrap justify-center">
                    <Weekly />
                    <Banding />
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    <Month />
                    <Year />
                </div>
            </div>

            <div className="flex gap-4 m-4 flex-wrap justify-center">
                <RecentTransactions />
                <LineChart />
            </div>
        </div>
    );
};

export default EcommerceIPad;
