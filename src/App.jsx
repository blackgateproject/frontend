import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import AddUser from "./pages/admin/AddUser";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminUsers from "./pages/admin/AdminUsers";
import GrafanaDashboard from "./pages/admin/GrafanaDashboard";
import UserActivityLogs from "./pages/admin/UserActivityLogs";
import LoginPage from "./pages/Loginpage";
// import Onboarding from "./pages/Onboarding";
import AuthPage from "./pages/AuthPage";
import DeviceGrafana from "./pages/device/GrafanaDashboard";
import DeviceProfile from "./pages/device/Profile";
import SetupPage from "./pages/SetupPage";
import UserGrafana from "./pages/user/GrafanaDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import UserHelp from "./pages/user/UserHelp";
import UserProfile from "./pages/user/UserProfile";

import TestDashbaord from "./pages/test/TestParallel";
import TestParallel from "./pages/test/TestSerial";
import TestSerial from "./pages/test/TestSerial";

function App() {
  return (
    <Router>
      <Routes>
        {/* Root Route */}
        <Route path="/" element={<LoginPage role={"user"} />} />
        <Route path="/auth" element={<AuthPage role={"user"} />} />
        <Route path="/setup" element={<SetupPage role={"user"} />} />
        {/* <Route path="/setuppage" element={<SetupPage />} /> */}

        {/* Admin Routes */}
        <Route path="/admin">
          <Route path="login" element={<LoginPage role={"admin"} />} />
          <Route path="dashboard" element={<AdminDashboard role={"admin"} />} />
          <Route
            path="applications"
            element={<AdminApplications role={"admin"} />}
          />
          <Route path="users" element={<AdminUsers role={"admin"} />} />
          {/* <Route path="adduser" element={<AddUser role={"admin"} />} /> */}
          <Route path="requests" element={<AdminRequests role={"admin"} />} />
          <Route path="profile" element={<AdminProfile role={"admin"} />} />
          <Route
            path="user-activity"
            element={<UserActivityLogs role={"admin"} />}
          />
          {/* <Route path="onboarding" element={<Onboarding role={"adminOnboard"} />} /> */}
          <Route
            path="grafana-dashboard"
            element={<GrafanaDashboard role={"admin"} />}
          />
        </Route>

        {/* User Routes */}
        <Route path="/user">
          <Route
            path="grafana-dashboard"
            element={<UserGrafana role={"user"} />}
          />
          <Route path="dashboard" element={<UserDashboard role={"user"} />} />
          <Route path="help" element={<UserHelp role={"user"} />} />
          <Route path="profile" element={<UserProfile role={"user"} />} />
          {/* <Route path="onboarding" element={<Onboarding role={"userOnboard"} />} /> */}
        </Route>

        {/* Device Routes */}
        <Route path="/device">
          <Route path="dashboard" element={<DeviceGrafana role={"device"} />} />
          <Route path="profile" element={<DeviceProfile role={"device"} />} />
        </Route>

        {/* Test Routes */}
        <Route path="/test">
          <Route path="serial" element={<TestSerial role={"test"} />} />
          <Route path="parallel" element={<TestParallel role={"test"} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
