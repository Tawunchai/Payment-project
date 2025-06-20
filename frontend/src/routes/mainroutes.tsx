import { lazy } from "react";
import { useRoutes, RouteObject} from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";

const Login = Loadable(lazy(() => import("../page/login/index")));
const Register = Loadable(lazy(() => import("../page/signup/signup")));

// User Role
const User = Loadable(lazy(() => import("../page/user/index")));

// Admin Role 
const Admin = Loadable(lazy(() => import("../page/admin/main/index")));
const MainLayout = Loadable(lazy(() => import("../component/admin/MainLayout")));
const EV = Loadable(lazy(() => import("../page/admin/ev/EV")));
const Employees = Loadable(lazy(() => import("../page/admin/employee/Employees")));
const Customers = Loadable(lazy(() => import("../page/admin/customer/Customers")));
const Calendar = Loadable(lazy(() => import("../page/admin/calendar/Calendar")));
const Editor = Loadable(lazy(() => import("../page/Editor/Editor")));
const Payment = Loadable(lazy(() => import("../page/admin/pyment/Payment")));
const New = Loadable(lazy(() => import("../page/admin/New/New")));
const GettingStarted = Loadable(lazy(() => import("../page/admin/getting/GettingStarted")));

const Modal = Loadable(lazy(() => import("../component/modal")));

{/* charts  */}
const Area = Loadable(lazy(() => import("../page/admin/charts/Area")));
const Bar = Loadable(lazy(() => import("../page/admin/charts/Bar")));
const Financial = Loadable(lazy(() => import("../page/admin/charts/Financial")));
const Line = Loadable(lazy(() => import("../page/admin/charts/Line")));
const Pie = Loadable(lazy(() => import("../page/admin/charts/Pie")));
const Pyramid = Loadable(lazy(() => import("../page/admin/charts/Pyramid")));
const Stacked = Loadable(lazy(() => import("../page/admin/charts/Stacked")));



const UserRoutes = (): RouteObject[] => [
  {
    path: "/", element: <User />, 
  },                                          
  {
    path: "/user",
    children: [
      { index: true, element: <User /> },
    ],
  },
];

const AdminRoutes = (): RouteObject[] => [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Admin /> },   
    ],
  },
  {
    path: "/admin",
    element: <MainLayout />,
    children: [
      { index: true, element: <Admin /> },
      { path: "Dashboard", element: <Admin /> },
      { path: "EV Charging", element: <EV /> },
      { path: "Employees", element: <Employees /> },
      { path: "Customers", element: <Customers /> },
      { path: "Calendar", element: <Calendar /> },
      { path: "Editor", element: <Editor /> },
      { path: "Payment", element: <Payment /> },
      { path: "New", element: <New /> },
      //{ path: "Getting Started", element: <GettingStarted /> },
      {/* charts  */},
      { path: "Area", element: <Area /> },
      { path: "Bar", element: <Bar /> },
      { path: "Financial", element: <Financial /> },
      { path: "Line", element: <Line /> },
      { path: "Pie", element: <Pie /> },
      { path: "Pyramid", element: <Pyramid /> },
      { path: "Stacked", element: <Stacked /> },
      { path: "Modal", element: <Modal /> },
    ],
  },
];


const MainRoutes = (): RouteObject[] => [
  {
    path: "/",
    children: [
      { index: true, element: <Login /> },
      {path: "/register", element: <Register/>},
      { path: "*", element: <Login /> },
      {path: "/register", element: <Register/>},
    ],
  },
];


function ConfigRoutes() {
  const isLoggedIn = localStorage.getItem('isLogin') === 'true';
  const roleName = localStorage.getItem('roleName');
  const employeeID = localStorage.getItem('employeeid');
  const userid = localStorage.getItem('userid');

  console.log("isLoggedIn:", isLoggedIn);
  console.log("roleName:", roleName);
  console.log("employeeid:", employeeID);
  console.log("userid:", userid);

  let routes: RouteObject[] = [];

  if (isLoggedIn) {
    switch (roleName) {
      case 'Admin':
        routes = AdminRoutes();
        break;
      case 'User':
        routes = UserRoutes();
        break;
      default:
        routes = MainRoutes();
        break;
    }
  } 
  else {
    routes = MainRoutes();
  }

  return useRoutes(routes);
}
export default ConfigRoutes;
