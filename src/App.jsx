import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AddUser from "./pages/admin/AddUser";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import GrafanaDashboard from "./pages/admin/GrafanaDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminUsers from "./pages/admin/AdminUsers";
import UserActivityLogs from "./pages/admin/UserActivityLogs";
import LoginPage from "./pages/LoginPage";
import Onboarding from "./pages/Onboarding";
import UserDashboard from "./pages/user/UserDashboard";
import UserHelp from "./pages/user/UserHelp";
import UserProfile from "./pages/user/UserProfile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage role={"admin"} />} />
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard role={"admin"} />}
        />
        <Route
          path="/admin/applications"
          element={<AdminApplications role={"admin"} />}
        />
        <Route path="/admin/users" element={<AdminUsers role={"admin"} />} />
        <Route path="/admin/adduser" element={<AddUser role={"admin"} />} />
        <Route
          path="/admin/requests"
          element={<AdminRequests role={"admin"} />}
        />
        <Route
          path="/admin/profile"
          element={<AdminProfile role={"admin"} />}
        />
        <Route
          path="/admin/user-activity"
          element={<UserActivityLogs role={"admin"} />}
        />
        <Route
          path="/admin/onboarding"
          element={<Onboarding role={"adminOnboard"} />}
        />
        <Route
          path="/admin/grafana-dashboard"
          element={<GrafanaDashboard role={"admin"} />}
        />

        {/* User Routes */}
        <Route path="/" element={<LoginPage role={"user"} />} />
        <Route
          path="/user/dashboard"
          element={<UserDashboard role={"user"} />}
        />
        <Route path="/user/help" element={<UserHelp role={"user"} />} />
        <Route path="/user/profile" element={<UserProfile role={"user"} />} />

        <Route
          path="/user/onboarding"
          element={<Onboarding role={"userOnboard"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
