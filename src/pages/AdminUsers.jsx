import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import { Search } from "lucide-react";
import Sidebar from "../components/Sidebar";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]); // State to hold user data

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/get_all_users"); // Adjust the port if necessary
        const data = await response.json();
        // Format user data for display
        const formattedUsers = data.map((user) => ({
          firstName: user.fName || "N/A", // First Name
          lastName: user.lName || "N/A", // Last Name
          email: user.email || "N/A", // Email
          phone: user.phone || "N/A", // Phone
          online: true, // Defaulting to true; replace with actual online status if available
          emailHash: user.email_hash || "N/A", // Email Hash
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Sidebar role={"admin"}>
      {/* Main Content */}
      <div className="col-span-12">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#333333]">Users</h1>
          <div className="flex items-center space-x-4">
            <button
              className="btn bg-purple-700 hover:bg-purple-800 text-white rounded-2xl px-4"
              onClick={() => navigate("/admin/adduser")}
            >
              + Add User
            </button>
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
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Display dynamic data fetched from the backend */}
          {users.map((user, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center"
            >

              <div className="flex items-center space-x-2">
                {/* Online/Offline Indicator */}
                <h2 className="text-lg font-semibold text-[#333333]">
                  {user.firstName} {user.lastName}
                </h2>
                <div
                  className={`w-3 h-3 rounded-full ${
                    user.online ? "bg-purple-600" : "bg-gray-400"
                  }`}
                ></div>
              </div>
              <div className="flex space-x-2">
                {/* Display email and phone */}
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">{user.email}</span>
                  <span className="text-gray-500 text-sm">{user.phone}</span>
                </div>
                {/* Square icon boxes */}
                <button className="btn bg-purple-700 hover:bg-purple-800 text-white p-2 w-10 h-10 flex justify-center items-center rounded-xl">
                  <Edit size={16} />
                </button>
                <button className="btn bg-[#B80000] hover:bg-red-800 text-white p-2 w-10 h-10 flex justify-center items-center rounded-xl">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Sidebar>
  );
};

export default AdminUsers;
