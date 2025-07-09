import { BsCurrencyDollar } from 'react-icons/bs';
import { useStateContext } from '../../../../contexts/ContextProvider';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import {  dropdownData } from '../../../../assets/admin/dummy';
import {  Button } from '../../../../component/admin';

const recentTransactions = [
    {
        icon: <BsCurrencyDollar />,
        amount: '+$350',
        title: 'Paromtpay',
        desc: 'Money Added',
        iconColor: '#03C9D7',
        iconBg: '#E5FAFB',
        pcColor: 'green-600',
    },
    {
        icon: <BsCurrencyDollar />,
        amount: '-$560',
        desc: 'All Payment',
        title: 'Coins',
        iconColor: 'rgb(0, 194, 146)',
        iconBg: 'rgb(235, 250, 242)',
        pcColor: 'red-600',
    },
    {
        icon: <BsCurrencyDollar />,
        amount: '+$350',
        title: 'Credit Card',
        desc: 'Money reversed',
        iconColor: 'rgb(255, 244, 229)',
        iconBg: 'rgb(254, 201, 15)',

        pcColor: 'green-600',
    },
    {
        icon: <BsCurrencyDollar />,
        amount: '+$350',
        title: 'Bank Transfer',
        desc: 'Money Added',

        iconColor: 'rgb(228, 106, 118)',
        iconBg: 'rgb(255, 244, 229)',
        pcColor: 'green-600',
    },
    {
        icon: <BsCurrencyDollar />,
        amount: '-$50',
        percentage: '+38%',
        title: 'Refund',
        desc: 'Payment Sent',
        iconColor: '#03C9D7',
        iconBg: '#E5FAFB',
        pcColor: 'red-600',
    },
];

const DropDown = ({ currentMode }: any) => (
    <div className="w-28 border-1 border-color px-2 py-1 rounded-md">
        <DropDownListComponent id="time" fields={{ text: 'Time', value: 'Id' }} style={{
            border: 'none',
            color: currentMode === 'Dark' ? 'white' : undefined
        }} value="1" dataSource={dropdownData} popupHeight="220px" popupWidth="120px" />
    </div>
);

const index = () => {
    const { currentColor, currentMode } = useStateContext(); //@ts-ignore
    return (
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
            <div className="flex justify-between items-center gap-1">
                <p className="text-xl font-semibold">Recent Transactions</p>
                <DropDown currentMode={currentMode} />
            </div>
            <div className="mt-10 w-72 md:w-320">
                {recentTransactions.map((item) => (
                    <div key={item.title} className="flex justify-between mt-4">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                style={{
                                    color: item.iconColor,
                                    backgroundColor: item.iconBg,
                                }}
                                className="text-2xl rounded-lg p-4 hover:drop-shadow-xl"
                            >
                                {item.icon}
                            </button>
                            <div>
                                <p className="text-md font-semibold">{item.title}</p>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                        <p className={`text-${item.pcColor}`}>{item.amount}</p>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center mt-5 border-t-1 border-color">
                <div className="mt-3">
                    <Button
                        color="white"
                        bgColor={currentColor}
                        text="Add"
                        borderRadius="10px"
                    />
                </div>

                <p className="text-gray-400 text-sm">36 Recent Transactions</p>
            </div>
        </div>
    )
}

export default index