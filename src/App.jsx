import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AddUser from "./pages/AddUser";
import AdminApplications from "./pages/AdminApplications";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";
import AdminTickets from "./pages/AdminTickets";
import AdminUsers from "./pages/AdminUsers";
import LoginPage from "./pages/Loginpage";
import UserHelp from "./pages/UserHelp";
import UserHome from "./pages/UserHome";
import UserProfile from "./pages/UserProfile";

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
          path="/admin/tickets"
          element={<AdminTickets role={"admin"} />}
        />
        <Route
          path="/admin/profile"
          element={<AdminProfile role={"admin"} />}
        />
        {/* User Routes */}
        <Route path="/" element={<LoginPage role={"user"} />} />
        <Route path="/user/dashboard" element={<UserHome role={"user"} />} />
        <Route path="/user/help" element={<UserHelp role={"user"} />} />
        <Route path="/user/profile" element={<UserProfile role={"user"} />} />
      </Routes>
    </Router>
  );
}

export default App;
