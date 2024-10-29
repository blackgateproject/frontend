import React, { useEffect, useState } from "react";
import { CheckSquare, Search, Ticket, Users } from "lucide-react";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersOnline, setUsersOnline] = useState(0); // Placeholder for online users
  const [pendingTickets, setPendingTickets] = useState(0); // Placeholder for pending tickets
  const [userActivity, setUserActivity] = useState([]); // Placeholder for user activity

  useEffect(() => {
    // Fetch total users count from the server
    const fetchTotalUsers = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/get_all_users"); // Update with your API URL
        if (!response.ok) {
          throw new Error("Failed to fetch total users");
        }
        const data = await response.json();
        setTotalUsers(data.length); // Assuming the API returns an array of users
        setUserActivity(data); // Optionally set user activity if needed
      } catch (error) {
        console.error("Error fetching total users:", error);
      }
    };

    fetchTotalUsers();
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
              className="input input-bordered w-60 pl-10 rounded-2xl bg-[#ffffff] text-gray-500 border-none shadow-sm"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
            <div>
              <div className="flex gap-1 items-center">
                <Users className="text-gray-700" size={30} />
                <h2 className="text-4xl font-bold text-gray-700">
                  {totalUsers}
                </h2>
              </div>
              <p className="text-gray-500">Total Users</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
            <div>
              <div className="flex gap-3 items-center">
                <CheckSquare className="text-gray-700" size={30} />
                <h2 className="text-4xl font-bold text-gray-700">
                  {usersOnline}
                </h2>
              </div>
              <p className="text-gray-500">Users Online</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
            <div>
              <div className="flex gap-3 items-center">
                <Ticket className="text-gray-700" size={30} />
                <h2 className="text-4xl font-bold text-gray-700">
                  {pendingTickets}
                </h2>
              </div>
              <p className="text-gray-500">Pending Tickets</p>
            </div>
          </div>
        </div>

        {/* User Activity Section */}
        <div
          className="bg-base-300 rounded-2xl shadow-md p-6 mb-4"
          style={{ height: "calc(100vh - 240px)" }}
        >
          <h2 className="text-2xl font-bold mb-4 text-[#333333]">
            User Activity
          </h2>
          <div className="overflow-y-auto max-h-full">
            {/* Display user activities fetched from the server */}
            {userActivity.map((activity, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row justify-between items-center bg-[#ffffff2a] p-4 mb-3 rounded-2xl"
              >
                <div className="font-semibold text-[#333333]">
                  {activity.fName} {activity.lName}
                </div>
                <div className="text-gray-600">{activity.activity}</div>
                <div className="text-gray-400">{activity.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default Dashboard;
