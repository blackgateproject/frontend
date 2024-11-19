import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminUsers from './pages/admin/AdminUsers';
import UserActivityLogs from './pages/admin/UserActivityLogs';
import AdminTickets from './pages/admin/AdminTickets';
import AdminProfile from './pages/admin/AdminProfile';
import UserHome from './pages/user/UserHome';
import UserHelp from './pages/user/UserHelp';
import UserProfile from './pages/user/UserProfile';
import AddUser from './pages/admin/AddUser';

function App() {
  return (
    <Router>
      <Routes>
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage role={"admin"}/>} />
        <Route path="/admin/dashboard" element={<AdminDashboard role={"admin"}/>} />
        <Route path="/admin/applications" element={<AdminApplications role={"admin"}/>} />
        <Route path="/admin/users" element={<AdminUsers role={"admin"}/>} />
        <Route path="/admin/adduser" element={<AddUser role={"admin"}/>} />
        <Route path="/admin/tickets" element={<AdminTickets role={"admin"}/>} />
        <Route path="/admin/profile" element={<AdminProfile role={"admin"}/>} />
        <Route path="/admin/user-activity" element={<UserActivityLogs role={"admin"}/>} />

        {/* User Routes */}
        <Route path="/" element={<LoginPage role={"user"}/>} />
        <Route path="/home" element={<UserHome role={"user"}/>} />
        <Route path="/help" element={<UserHelp role={"user"}/>} />
        <Route path="/profile" element={<UserProfile role={"user"}/>} />
      </Routes>
    </Router>
  );
}

export default App;
