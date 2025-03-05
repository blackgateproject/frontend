import { ActivityIcon, CheckSquare, Search, Ticket, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import UserActivity from "../../components/UserActivity";

const Dashboard = () => {
  const accessToken = sessionStorage.getItem("access_token") || "";
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    pendingTickets: 0,
  });

  const [loading, setLoading] = useState(true);
  const [pendingTickets, setPendingTickets] = useState(0);
  const [userActivities, setUserActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:8000/admin/v1/dashboard",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.status === 401) {
          console.log("Redirecting to:", "/");
          window.location.href = "/";
          return;
        }
        if (!response.ok) throw new Error("Failed to fetch dashboard stats");

        const data = await response.json();

        setStats({
          totalUsers: data.totalUsers,
          onlineUsers: data.onlineUsers,
          pendingTickets: data.pendingTickets,
        });
        setUserActivities(data.userActivities);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <Sidebar role={"admin"}>
      {/* Main Content */}
      <div className="col-span-12">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#333333]">Dashboard</h1>
          <div className="relative">
            {/* Search Icon inside the input field */}
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </span>
            <input
              type="text"
              placeholder="Search"
              className="input input-bordered w-60 pl-10 rounded-2xl bg-base-100 text-gray-500 border-none shadow-sm"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 mb-6">
          <div className="bg-base-100 lg:w-48 rounded-2xl shadow-md p-6 flex items-center justify-between">
            <div>
              <div className="flex gap-1 items-center">
                <Users className="text-primary" size={30} />
                <h2 className="text-4xl font-bold text-primary">
                  {loading ? "..." : stats.totalUsers}
                </h2>
              </div>
              <p className="text-gray-500">Total Users</p>
            </div>
          </div>
          <div className="bg-base-100 lg:w-48 rounded-2xl shadow-md p-6 flex items-center justify-between">
            <div>
              <div className="flex gap-3 items-center">
                <CheckSquare className="text-primary" size={30} />
                <h2 className="text-4xl font-bold text-primary">
                  {loading ? "..." : stats.onlineUsers}
                </h2>
              </div>
              <p className="text-gray-500">Users Online</p>
            </div>
          </div>
          <div className="bg-base-100 lg:w-48 rounded-2xl shadow-md p-6 flex items-center justify-between">
            <div>
              <div className="flex gap-3 items-center">
                <Ticket className="text-primary" size={30} />
                <h2 className="text-4xl font-bold text-primary">
                  {loading ? "..." : pendingTickets}
                </h2>
              </div>
              <p className="text-gray-500">Pending Tickets</p>
            </div>
          </div>
        </div>

        {/* User Activity Section */}
        <div className="bg-base-300 rounded-2xl shadow-md max-h-[34rem] overflow-y-scroll p-6 mb-4">
          <div className="w-full flex justify-between items-center my-3 mb-5">
            <h2 className="text-2xl font-bold mb-4 text-[#333333]">
              User Activity
            </h2>
            <Link
              to="/admin/user-activity"
              className="btn bg-primary/75 hover:bg-primary text-base-100 flex items-center gap-2"
            >
              <ActivityIcon className="w-5 h-5" />
              View All
            </Link>
          </div>
          <div className=" max-h-full">
            <UserActivity activities={userActivities} />
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default Dashboard;
