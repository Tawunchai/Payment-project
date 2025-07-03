import { lazy } from "react";
import { useRoutes, RouteObject } from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";

const Login = Loadable(lazy(() => import("../page/LoginForm1/LoginForm1")));
const SignUp = Loadable(lazy(() => import("../page/Signup1/Signup2Form")));
const ForgotPassword = Loadable(lazy(() => import("../page/ForgotPasswordForm/ForgotPasswordForm")));
const ResetPassword = Loadable(lazy(() => import("../page/ResetPassword/ResetPassword")));

// User Role
const User = Loadable(lazy(() => import("../page/user/index")));
const Profile = Loadable(lazy(() => import("../component/user/header/SocialProfile/SocialProfile")));
const EVInputUser = Loadable(lazy(() => import("../component/user/evs")));
const PaymentUser = Loadable(lazy(() => import("../component/user/payment")));
const PaymentQr = Loadable(lazy(() => import("../component/user/payment/QRCode/test")));
const PaymentCredit = Loadable(lazy(() => import("../component/user/payment/CreditCard/test")));
const ChargingEV = Loadable(lazy(() => import("../component/user/charge/index")));
const MyCoins = Loadable(lazy(() => import("../component/user/money/index")));

// Admin Role 
const Admin = Loadable(lazy(() => import("../page/admin/main/index")));
const MainLayout = Loadable(lazy(() => import("../component/admin/MainLayout")));
const EV = Loadable(lazy(() => import("../page/admin/ev/EV")));
const Employees = Loadable(lazy(() => import("../page/admin/employee/Employees")));
const Customers = Loadable(lazy(() => import("../page/admin/customer/Customers")));
const Calendar = Loadable(lazy(() => import("../page/admin/calendar/Calendar")));
const Editor = Loadable(lazy(() => import("../page/Editor/Editor")));
const Create_Editor = Loadable(lazy(() => import("../page/Editor/create")));
const Edit_Editor = Loadable(lazy(() => import("../page/Editor/edit")));
const Payment = Loadable(lazy(() => import("../page/admin/pyment/Payment")));
const New = Loadable(lazy(() => import("../page/admin/New/New")));
const Create_New = Loadable(lazy(() => import("../page/admin/New/create")));
const Edit_New = Loadable(lazy(() => import("../page/admin/New/edit")));

const Modal = Loadable(lazy(() => import("../component/modal")));

{/* charts  */ }
const Area = Loadable(lazy(() => import("../page/admin/charts/Area")));
const Bar = Loadable(lazy(() => import("../page/admin/charts/Bar")));
const Financial = Loadable(lazy(() => import("../page/admin/charts/Financial")));
const Line = Loadable(lazy(() => import("../page/SocialProfile/SocialProfile")));
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
      { path: "profile", element: <Profile /> },
      { path: "evs-selector", element: <EVInputUser /> },
      { path: "payment", element: <PaymentUser /> },
      { path: "payment-by-qrcode", element: <PaymentQr /> },
      { path: "credit-card", element: <PaymentCredit /> },
      { path: "charging", element: <ChargingEV/> },
      { path: "my-coins", element: <MyCoins/> },
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
      { path: "Payment", element: <Payment /> },
      { path: "EV Charging", element: <EV /> },
      { path: "Employees", element: <Employees /> },
      { path: "Customers", element: <Customers /> },
      { path: "Calendar", element: <Calendar /> },
      { path: "Editor", element: <Editor /> },
      { path: "create-editor", element: <Create_Editor /> },
      { path: "edit-editor", element: <Edit_Editor /> },
      { path: "New", element: <New /> },
      { path: "create-new", element: <Create_New /> },
      { path: "edit-new", element: <Edit_New /> },
      {/* charts  */ },
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
      { path: "/register", element: <SignUp /> },
      { path: "*", element: <Login /> },
      { path: "/register", element: <SignUp /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
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
      case 'Employee':
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
