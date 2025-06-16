import { Outlet } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { useStateContext } from '../../contexts/ContextProvider';
import { Navbar, Sidebar, Footer, ThemeSettings } from '../../component/admin';
import { Ecommerce, Orders, Calendar, Employees, Stacked, Pyramid, Customers, Kanban, Line, Area, Bar, Pie, Financial, ColorPicker, ColorMapping, Editor } from '../../page/admin';
import "./main.css"

const MainLayout = () => {
    const { currentColor, currentMode, activeMenu, themeSettings, setThemeSettings, setCurrentColor, setCurrentMode, } = useStateContext();

    return (
        <div>
            <div className='flex relative dark:bg-main-dark-bg'>
                <div className='fixed right-4 bottom-4' style={{ zIndex: "1000" }}>
                    <TooltipComponent content="Settings" position="top">
                        <button type='button' className="text-3xl p-3 hover:drop-shadow-xl hover:bg-light-gray text-white" style={{ background: 'blue', borderRadius: '50%' }}>
                            <FiSettings />
                        </button>
                    </TooltipComponent>
                </div>
                {activeMenu ? (
                    <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
                        <Sidebar />
                    </div>
                ) : (
                    <div className="w-0 dark:bg-secondary-dark-bg">
                        <Sidebar />
                    </div>
                )}
                <div className={activeMenu ? 'dark:bg-main-dark-bg bg-main-bg min-h-screen md:ml-72 w-full' : 'bg-main-bg dark:bg-main-dark-bg w-full min-h-screen flex-2'}>
                    <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
                        <Navbar />
                    </div>
                    {themeSettings && <ThemeSettings />}
                    <div className="mt-16 p-4">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MainLayout