import { lazy, useEffect, useState } from "react";
import { useRoutes, RouteObject } from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";
import { GetProfile } from "../services/httpLogin";

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
const ProfileAdmin = Loadable(lazy(() => import("../page/SocialProfile/SocialProfile")));
const Car = Loadable(lazy(() => import("../page/admin/car/index")));
const CarData = Loadable(lazy(() => import("../page/admin/car/car_data")));
const ServiceManage = Loadable(lazy(() => import("../page/admin/servicess/index")));

// Monitor
const Solar = Loadable(lazy(() => import("../page/admin/mornitor/solar")));
const Battery = Loadable(lazy(() => import("../page/admin/mornitor/battery")));
const EVCabinet = Loadable(lazy(() => import("../page/admin/mornitor/ev")));

// Charts
/*const Area = Loadable(lazy(() => import("../page/admin/chart/Area")));
const Bar = Loadable(lazy(() => import("../page/admin/chart/Bar")));
const Financial = Loadable(lazy(() => import("../page/admin/chart/Financial")));
const LineLinear = Loadable(lazy(() => import("../page/admin/chart/Line")));
const ColorMapping = Loadable(lazy(() => import("../page/admin/chart/ColorMapping")));
const Pie = Loadable(lazy(() => import("../page/admin/chart/Pie")));
const Pyramid = Loadable(lazy(() => import("../page/admin/chart/Pyramid")));
const Stacked = Loadable(lazy(() => import("../page/admin/chart/Stacked")));*/

const UserRoutes = (): RouteObject[] => [
  {
    path: "/",
    element: <User />,
  },
  {
    path: "/user",
    children: [
      { index: true, element: <User /> }, //ok
      { path: "profile", element: <Profile /> }, //ok
      { path: "evs-selector", element: <EVInputUser /> },//ok
      { path: "payment", element: <PaymentUser /> }, //ok
      { path: "payment-by-qrcode", element: <PaymentQr /> }, //ok
      { path: "charging", element: <ChargingEV /> }, //ok
      { path: "my-coins", element: <MyCoins /> },//ok
      { path: "add-coins", element: <PayCoins /> },//ok
      { path: "intro-cars", element: <IntroCar /> }, //ok
      { path: "add-cars", element: <AddCar /> }, //ok
      { path: "map", element: <Map /> },//ok
      { path: "all-news", element: <AllNews /> }, //ok
      { path: "one-news", element: <News /> }, //ok
      { path: "after-payment", element: <AfterPayment /> }, //ok
      { path: "booking-ev", element: <BookingEV /> }, //ok
      { path: "booking-date", element: <BookingDate /> }, //ok
      { path: "*", element: <User /> }, //ok
    ],
  },
];

const AdminRoutes = (): RouteObject[] => [
  {
    path: "/admin",
    element: <MainLayout />,
    children: [
      { index: true, element: <Admin /> }, //ok
      { path: "Dashboard", element: <Admin /> }, //ok
      { path: "Payment", element: <Payment /> },
      { path: "EV Charging", element: <EV /> },//ok
      { path: "Service", element: <ServiceManage /> },//ok
      { path: "Employees", element: <Employees /> },//ok
      { path: "Customers", element: <Customers /> },//ok
      { path: "Calendar", element: <Calendar /> },//ok
      { path: "Guide", element: <Editor /> },//ok
      { path: "create-editor", element: <Create_Editor /> },//ok
      { path: "edit-editor", element: <Edit_Editor /> },//ok
      { path: "New", element: <New /> },//ok
      { path: "create-new", element: <Create_New /> },//ok
      { path: "edit-new", element: <Edit_New /> },//ok
      { path: "Solar", element: <Solar /> },//ok
      { path: "Battery", element: <Battery /> },//ok
      { path: "EV Cabinet", element: <EVCabinet /> },//ok
      { path: "profile", element: <ProfileAdmin /> }, //ok
      { path: "Car", element: <Car /> },//ok
      { path: "Car-data", element: <CarData /> },//ok
      { path: "*", element: <Admin /> },//ok
    ],
  },
];

const MainRoutes = (): RouteObject[] => [
  {
    path: "/",
    children: [
      { index: true, element: <Login /> },
      { path: "/register", element: <SignUp /> },
      { path: "/loader", element: <Loader /> },
      { path: "*", element: <Login /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
    ],
  },
];

function ConfigRoutes() {
  const [roleName, setRoleName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await GetProfile();
        setRoleName(res.data.role);
      } catch {
        setRoleName(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // ✅ ฟัง event roleChange จาก login/logout
    const handleRoleChange = () => {
      const role = localStorage.getItem("role");
      if (role) {
        setRoleName(role);
      } else {
        setRoleName(null); // ✅ reset roleName ตอน logout
      }
    };

    window.addEventListener("roleChange", handleRoleChange);
    return () => window.removeEventListener("roleChange", handleRoleChange);
  }, []);

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  let routes = MainRoutes(); // default = login routes

  if (roleName === "Admin" || roleName === "Employee") {
    routes = AdminRoutes();
  } else if (roleName === "User") {
    routes = UserRoutes();
  }

  return useRoutes(routes);
}

export default ConfigRoutes;
