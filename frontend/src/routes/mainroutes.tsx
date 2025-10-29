import { lazy } from "react";
import { useRoutes, RouteObject } from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";

const Login = Loadable(lazy(() => import("../page/LoginForm1/LoginForm1")));
const SignUp = Loadable(lazy(() => import("../page/Signup1/Signup2Form")));
const ForgotPassword = Loadable(lazy(() => import("../page/ForgotPasswordForm/ForgotPasswordForm")));
const ResetPassword = Loadable(lazy(() => import("../page/ResetPassword/ResetPassword")));
const Loader = Loadable(lazy(() => import("../component/third-patry/Loader")));
// User Role
const User = Loadable(lazy(() => import("../page/user/index")));
const BookingEV = Loadable(lazy(() => import("../component/user/booking/index")));
const BookingDate = Loadable(lazy(() => import("../component/user/booking/book/index")));
const Profile = Loadable(lazy(() => import("../component/user/header/SocialProfile/SocialProfile")));
const EVInputUser = Loadable(lazy(() => import("../component/user/evs")));
const PaymentUser = Loadable(lazy(() => import("../component/user/payment")));
const PaymentQr = Loadable(lazy(() => import("../component/user/payment/QRCode/test")));
const ChargingEV = Loadable(lazy(() => import("../component/user/charge/index")));
const MyCoins = Loadable(lazy(() => import("../component/user/historypay/pay")));
const PayCoins = Loadable(lazy(() => import("../component/user/money/index")));
const IntroCar = Loadable(lazy(() => import("../component/user/car/intro")));
const AddCar = Loadable(lazy(() => import("../component/user/car/create")));
const Map = Loadable(lazy(() => import("../component/user/map")));
const AllNews = Loadable(lazy(() => import("../component/user/new/all")));
const News = Loadable(lazy(() => import("../component/user/new/event")));
const AfterPayment = Loadable(lazy(() => import("../component/user/payment/after")));
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
const Line = Loadable(lazy(() => import("../page/SocialProfile/SocialProfile")));
const Car = Loadable(lazy(() => import("../page/admin/car/index")));
const ServiceManage = Loadable(lazy(() => import("../page/admin/servicess/index")));
{/* Monitor  */ }
const Solar = Loadable(lazy(() => import("../page/admin/mornitor/solar")));
const Battery = Loadable(lazy(() => import("../page/admin/mornitor/battery")));
const EVCabinet = Loadable(lazy(() => import("../page/admin/mornitor/ev")));
//
{/* charts  */}
const Area = Loadable(lazy(() => import("../page/admin/chart/Area")));
const Bar = Loadable(lazy(() => import("../page/admin/chart/Bar")));
const Financial = Loadable(lazy(() => import("../page/admin/chart/Financial")));
const LineLinear = Loadable(lazy(() => import("../page/admin/chart/Line")));
const ColorMapping = Loadable(lazy(() => import("../page/admin/chart/ColorMapping")));
const Pie = Loadable(lazy(() => import("../page/admin/chart/Pie")));
const Pyramid = Loadable(lazy(() => import("../page/admin/chart/Pyramid")));
const Stacked = Loadable(lazy(() => import("../page/admin/chart/Stacked")));

const UserRoutes = (): RouteObject[] => [
  {
    path: "/", element: <User />,
  },
  {
    path: "/user",
    children: [
      { index: true, element: <User /> },
      { path: "profile", element: <Profile /> }, //edit real
      { path: "evs-selector", element: <EVInputUser /> }, // edit real
      { path: "payment", element: <PaymentUser /> }, // edit real
      { path: "payment-by-qrcode", element: <PaymentQr /> }, //edit real
      { path: "charging", element: <ChargingEV/> },//edit real
      { path: "my-coins", element: <MyCoins/> }, //edit real
      { path: "add-coins", element: <PayCoins/> }, //edit real
      { path: "intro-cars", element: <IntroCar/> }, //edit real
      { path: "add-cars", element: <AddCar/> }, //edit real
      { path: "map", element: <Map/> }, //edit real
      { path: "all-news", element: <AllNews/> }, //edit real
      { path: "one-news", element: <News/> }, //edit real
      { path: "after-payment", element: <AfterPayment/> }, //edit real
      { path: "booking-ev", element: <BookingEV/> }, //edit real
      { path: "booking-date", element: <BookingDate/> }, //edit real
      { path: "*", element: <User /> }, //edit 
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
      { path: "Payment", element: <Payment /> }, //edit
      { path: "EV Charging", element: <EV /> }, //edit
      { path: "Service", element: <ServiceManage /> }, //edit
      { path: "Employees", element: <Employees /> },//edit
      { path: "Customers", element: <Customers /> },//edit
      { path: "Calendar", element: <Calendar /> },//edit
      { path: "Guide", element: <Editor /> },//edit
      { path: "create-editor", element: <Create_Editor /> },//edit
      { path: "edit-editor", element: <Edit_Editor /> },//edit
      { path: "New", element: <New /> }, //edit
      { path: "create-new", element: <Create_New /> },//edit
      { path: "edit-new", element: <Edit_New /> }, //edit
      {/* Test  */ },
      { path: "Solar", element: <Solar /> }, //edit
      { path: "Battery", element: <Battery /> }, //edit
      { path: "EV Cabinet", element: <EVCabinet /> }, //edit
      { path: "profile", element: <Line /> }, //edit profile
      { path: "Car", element: <Car /> }, //edit 
      {/* charts  */},
      { path: "Area", element: <Area /> },
      { path: "Bar", element: <Bar /> },
      { path: "Financial", element: <Financial /> },
      { path: "LineLinear", element: <LineLinear /> },
      { path: "ColorMapping", element: <ColorMapping /> },
      { path: "Pie", element: <Pie /> },
      { path: "Pyramid", element: <Pyramid /> },
      { path: "Stacked", element: <Stacked /> },
      { path: "*", element: <Admin /> }, //edit 
    ],
  },
];


const MainRoutes = (): RouteObject[] => [
  {
    path: "/",
    children: [
      { index: true, element: <Login /> }, //edit
      { path: "/register", element: <SignUp /> },
      { path: "/loader", element: <Loader /> },
      { path: "*", element: <Login /> }, //edit 
      { path: "/register", element: <SignUp /> }, //edit
      { path: "/forgot-password", element: <ForgotPassword /> }, //edit
      { path: "/reset-password", element: <ResetPassword /> }, //edit
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
