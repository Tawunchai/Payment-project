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
const Orders = Loadable(lazy(() => import("../page/admin/Orders")));
const Employees = Loadable(lazy(() => import("../page/admin/Employees")));
const Customers = Loadable(lazy(() => import("../page/admin/Customers")));
const Calendar = Loadable(lazy(() => import("../page/admin/Calendar")));
const Editor = Loadable(lazy(() => import("../page/admin/Editor")));

{/* charts  */}
const Area = Loadable(lazy(() => import("../page/admin/Charts/Area")));
const Bar = Loadable(lazy(() => import("../page/admin/Charts/Bar")));
const ColorMapping = Loadable(lazy(() => import("../page/admin/Charts/ColorMapping")));
const Financial = Loadable(lazy(() => import("../page/admin/Charts/Financial")));
const Line = Loadable(lazy(() => import("../page/admin/Charts/Line")));
const Pie = Loadable(lazy(() => import("../page/admin/Charts/Pie")));
const Pyramid = Loadable(lazy(() => import("../page/admin/Charts/Pyramid")));
const Stacked = Loadable(lazy(() => import("../page/admin/Charts/Stacked")));



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
      { path: "Orders", element: <Orders /> },
      { path: "Employees", element: <Employees /> },
      { path: "Customers", element: <Customers /> },
      { path: "Calendar", element: <Calendar /> },
      { path: "Editor", element: <Editor /> },
      {/* charts  */},
      { path: "Area", element: <Area /> },
      { path: "Bar", element: <Bar /> },
      { path: "ColorMapping", element: <ColorMapping /> },
      { path: "Financial", element: <Financial /> },
      { path: "Line", element: <Line /> },
      { path: "Pie", element: <Pie /> },
      { path: "Pyramid", element: <Pyramid /> },
      { path: "Stacked", element: <Stacked /> },
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
