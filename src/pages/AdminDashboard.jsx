import React from 'react';
import { CheckSquare, Search, Ticket, Users } from 'lucide-react';
import Sidebar from '../components/Sidebar'
const Dashboard = () => {
  // Placeholder data for user activity (Replace with backend data)
  const userActivity = [
    { name: 'Abdullah Abubaker', activity: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', date: '12/10/24 4:53 PM' },
    { name: 'Muhammad Qasim', activity: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', date: '12/10/24 4:53 PM' },
    { name: 'Awais Shahid', activity: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', date: '12/10/24 4:53 PM' },
    { name: 'Taha Qaisar', activity: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', date: '12/10/24 4:53 PM' },
    { name: 'Fahad Sheikh', activity: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', date: '12/10/24 4:53 PM' },
    { name: 'Ubaid Ullah', activity: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', date: '12/10/24 4:53 PM' },
  ];

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
                className="input input-bordered w-60 pl-10 rounded-2xl bg-[#FFFFFF] text-gray-500 border-none shadow-sm"
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
              <div>
                <div className="flex gap-1 items-center">
                  <Users className='text-purple-700' size={30} />
                  <h2 className="text-4xl font-bold text-purple-700">15</h2>
                </div>
                <p className="text-gray-500">Total Users</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
              <div>
                <div className="flex gap-3 items-center">
                  <CheckSquare className='text-purple-700' size={30} />
                  <h2 className="text-4xl font-bold text-purple-700">6</h2>
                </div>
                <p className="text-gray-500">Users Online</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
              <div>
              <div className="flex gap-3 items-center">
                  <Ticket className='text-purple-700' size={30} />
                  <h2 className="text-4xl font-bold text-purple-700">6</h2>
                </div>
                <p className="text-gray-500">Pending Tickets</p>
              </div>
            </div>
          </div>

          {/* User Activity Section */}
          <div className="bg-base-300 rounded-2xl shadow-md p-6 mb-4" style={{ height: 'calc(100vh - 240px)' }}>
            <h2 className="text-2xl font-bold mb-4 text-[#333333]">User Activity</h2>
            <div className="overflow-y-auto max-h-full">
              {/* Replace this section with dynamic data from backend */}
              {userActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex flex-col lg:flex-row justify-between items-center bg-[#ffffff] p-4 mb-3 rounded-2xl"
                >
                  <div className="font-semibold text-[#333333]">{activity.name}</div>
                  <div className="text-gray-600">{activity.activity}</div>
                  <div className="text-gray-400">{activity.date}</div>
                </div>
              ))}
              {/* Backend data ends here */}
            </div>
          </div>
        </div>
    </Sidebar>

  );
};

export default Dashboard;
