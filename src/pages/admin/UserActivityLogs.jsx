import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import UserActivity from '../../components/UserActivity';
import { Search } from 'lucide-react';

const UserActivityLogs = () => {
  // Original activities data
  const userActivitiesData = [
    { id: 1, name: 'Abdullah Abubaker', activity: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', date: '12/10/24 4:53 PM', type: 'Login' },
    { id: 2, name: 'Muhammad Qasim', activity: 'The purpose of lorem ipsum is to create a natural looking block of text', date: '12/12/24 4:53 PM', type: 'Logout' },
    { id: 3, name: 'Awais Shahid', activity: 'when an unknown printer took a galley of type and scrambled it to make a type specimen book', date: '13/10/23 4:53 PM', type: 'Profile Edit' },
    { id: 4, name: 'Taha Qaisar', activity: 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s', date: '12/10/21 4:53 PM', type: 'App Access' },
    { id: 5, name: 'Abdullah Abubaker', activity: ' Lorem Ipsum is simply dummy text of the printing and typesetting industry.', date: '10/10/24 4:53 PM', type: 'Login' },
    { id: 6, name: 'Muhammad Qasim', activity: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', date: '12/11/24 4:53 PM', type: 'Logout' },
    { id: 7, name: 'Awais Shahid', activity: 'The purpose of lorem ipsum is to create a natural looking block of text', date: '12/11/21 4:53 PM', type: 'Profile Edit' },
    { id: 8, name: 'Awais Shahid', activity: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', date: '12/10/24 4:53 PM', type: 'Profile Edit' },
    { id: 9, name: 'Taha Qaisar', activity: 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s', date: '11/11/24 4:53 PM', type: 'App Access' },
    { id: 10, name: 'Abdullah Abubaker', activity: 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s', date: '12/11/22 4:53 PM', type: 'Login' },
    { id: 11, name: 'Fahad Sheikh', activity: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', date: '12/10/24 4:53 PM', type: 'App Access' },
    { id: 12, name: 'Ubaid Ullah', activity: 'when an unknown printer took a galley of type and scrambled it to make a type specimen book', date: '12/10/24 4:53 PM', type: 'App Access' },
  ];

  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');

  // Handler functions
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Filter and sort the activities
  const filteredActivities = userActivitiesData
    .filter((activity) => {
      // Filter by search query
      const matchesSearch =
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.activity.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by type
      const matchesType = filterType === 'All' || activity.type === filterType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (sortOrder === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

  return (
    <Sidebar role="admin">
      {/* Header Row */}
      <div className="flex lg:justify-between lg:items-center lg:flex-row flex-col mb-6">
        <h1 className="text-3xl font-bold text-[#333333]">User Activities</h1>
        <div className="flex lg:items-center lg:space-x-4 space-y-5 lg:space-y-0 mt-4 lg:mt-0 flex-col lg:flex-row ">
          {/* Filter Dropdown */}
          <select
            value={filterType}
            onChange={handleFilterTypeChange}
            className="select select-bordered rounded-2xl bg-white text-gray-500 border-none shadow-sm"
          >
            <option value="All">All Types</option>
            <option value="Login">Login</option>
            <option value="Logout">Logout</option>
            <option value="Profile Edit">Profile Edit</option>
            <option value="App Access">App Access</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={handleSortOrderChange}
            className="select select-bordered rounded-2xl bg-white text-gray-500 border-none shadow-sm"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {/* Search Input */}
          <div className="relative ">
            {/* Search Icon inside the input field */}
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </span>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="input input-bordered lg:w-60 w-full pl-10 rounded-2xl bg-white text-gray-500 border-none shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* User Activity List */}
      <UserActivity activities={filteredActivities} />
    </Sidebar>
  );
};

export default UserActivityLogs;