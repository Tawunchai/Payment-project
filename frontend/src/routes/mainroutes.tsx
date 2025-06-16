import { lazy } from "react";
import { useRoutes, RouteObject} from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";

const Login = Loadable(lazy(() => import("../page/login/index")));
const Register = Loadable(lazy(() => import("../page/signup/signup")));

// User Role
const User = Loadable(lazy(() => import("../page/user/index")));

// Admin Role 
const Admin = Loadable(lazy(() => import("../page/admin/index")));

//Test
const Test = Loadable(lazy(() => import("../page/test")));


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
    path: "/", element: <Admin />, 
  },                                          
  {
    path: "/admin",
    children: [
      { index: true, element: <Admin /> },
    ],
  },
  {
    path: "/testing", element: <Test />, 
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
