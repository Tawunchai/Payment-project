import { useStateContext } from '../../../../contexts/ContextProvider';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { dropdownData } from '../../../../assets/admin/dummy';
import { ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject, LineSeries, DateTime, Legend, Tooltip } from '@syncfusion/ej2-react-charts';
import { lineCustomSeries, LinePrimaryXAxis, LinePrimaryYAxis } from '../../../../assets/admin/dummy';

const DropDown = ({ currentMode }: any) => (
    <div className="w-28 border-1 border-color px-2 py-1 rounded-md">
        <DropDownListComponent id="time" fields={{ text: 'Time', value: 'Id' }} style={{
            border: 'none',
            color: currentMode === 'Dark' ? 'white' : undefined
        }} value="1" dataSource={dropdownData} popupHeight="220px" popupWidth="120px" />
    </div>
);

const index = () => {
    //@ts-ignore
    const { currentColor, currentMode } = useStateContext();
    return (
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl w-96 md:w-760">
            <div className="flex justify-between items-center gap-2 mb-10">
                <p className="text-xl font-semibold">Sales Overview</p>
                <DropDown currentMode={currentMode} />
            </div>
            <div className="md:w-full overflow-auto">
                <ChartComponent
                    id="line-chart"
                    height="420px"
                    primaryXAxis={LinePrimaryXAxis}
                    primaryYAxis={LinePrimaryYAxis}
                    chartArea={{ border: { width: 0 } }}
                    tooltip={{ enable: true }}
                    background={currentMode === 'Dark' ? '#33373E' : '#fff'}
                    legendSettings={{ background: 'white' }}
                >
                    <Inject services={[LineSeries, DateTime, Legend, Tooltip]} />
                    <SeriesCollectionDirective>
                        {lineCustomSeries.map((item : any, index : any) => <SeriesDirective key={index} {...item} />)}
                    </SeriesCollectionDirective>
                </ChartComponent>
            </div>
        </div>
    )
}

export default index
